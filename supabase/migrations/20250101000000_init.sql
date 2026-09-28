-- This is the SHARED database for both tallyvote-admin and tallyvote-voter
-- Run this once in your Supabase SQL editor

create table organizations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null unique,
  logo_url   text,
  created_at timestamptz default now()
);

create table elections (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organizations(id) on delete cascade,
  title       text not null,
  description text,
  status      text not null default 'draft' check (status in ('draft','live','closed')),
  anonymous   boolean not null default true,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  created_at  timestamptz default now()
);

create table candidates (
  id          uuid primary key default gen_random_uuid(),
  election_id uuid not null references elections(id) on delete cascade,
  name        text not null,
  bio         text,
  avatar_url  text,
  position    int,
  created_at  timestamptz default now()
);

create table votes (
  id               uuid primary key default gen_random_uuid(),
  election_id      uuid not null references elections(id) on delete cascade,
  candidate_id     uuid not null references candidates(id) on delete cascade,
  voter_id         uuid,              -- null = anonymous
  voter_fingerprint text,             -- browser fingerprint for dedup
  created_at       timestamptz default now(),
  unique (election_id, voter_fingerprint)  -- one vote per browser per election
);

-- View used by both apps for live results
create or replace view vote_counts as
  select
    c.id           as candidate_id,
    c.name         as candidate_name,
    c.election_id,
    count(v.id)::int as count,
    round(count(v.id) * 100.0 / nullif(sum(count(v.id)) over (partition by c.election_id), 0), 1) as percentage
  from candidates c
  left join votes v on v.candidate_id = c.id
  group by c.id, c.name, c.election_id;

-- Row Level Security
alter table organizations enable row level security;
alter table elections     enable row level security;
alter table candidates    enable row level security;
alter table votes         enable row level security;

-- Public can read live elections + candidates (voter app)
create policy "Public read live elections" on elections for select using (status = 'live');
create policy "Public read candidates"     on candidates for select using (true);
create policy "Public read vote counts"    on votes      for select using (true);

-- Anyone can cast a vote (voter app)
create policy "Anyone can cast vote" on votes for insert with check (true);

-- Enable Supabase Realtime on votes table (for live dashboard + results)
alter publication supabase_realtime add table votes;

-- Indexes
create index on elections (org_id, status);
create index on votes (election_id, candidate_id);
create index on votes (election_id, voter_fingerprint);
