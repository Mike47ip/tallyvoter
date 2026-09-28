import { createClient } from './supabase/server'
import type { Election } from '@/types'

// Fetch live election by ID — used by /vote/[id]
export async function getLiveElection(id: string): Promise<Election | null> {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('elections')
    .select('*, candidates(id, name, bio, avatar_url, position)')
    .eq('id', id)
    .eq('status', 'live')
    .single()
  if (error) return null
  // Sort candidates by position
  if (data?.candidates) {
    data.candidates.sort((a: any, b: any) => (a.position ?? 99) - (b.position ?? 99))
  }
  return data
}

// Cast a vote
export async function castVote(electionId: string, candidateId: string, fingerprint: string) {
  const supabase = createClient()
  const { error } = await supabase.from('votes').insert({
    election_id: electionId,
    candidate_id: candidateId,
    voter_fingerprint: fingerprint,
  })
  if (error) {
    // Unique constraint = already voted
    if (error.code === '23505') throw new Error('ALREADY_VOTED')
    throw error
  }
}

// Get vote counts for results display
export async function getVoteCounts(electionId: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('vote_counts')
    .select('*')
    .eq('election_id', electionId)
    .order('count', { ascending: false })
  if (error) return []
  return data ?? []
}

// Lookup election by short code
export async function getElectionByCode(code: string) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from('elections')
    .select('id, title, status, short_code')
    .eq('short_code', code.toUpperCase())
    .single()
  if (error || !data) return null
  return data
}
