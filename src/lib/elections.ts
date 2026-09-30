// tallyvoter/src/lib/elections.ts
import { PrismaClient } from '@prisma/client'
import type { Election } from '@/types'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getLiveElection(id: string): Promise<Election | null> {
  try {
    const election = await prisma.election.findFirst({
      where: { id, status: 'live' },
      include: { candidates: { orderBy: { position: 'asc' } } },
    })
    if (!election) return null
    return {
      ...election,
      short_code: election.shortCode,
      org_id: election.orgId,
      starts_at: election.startsAt.toISOString(),
      ends_at: election.endsAt.toISOString(),
      created_at: election.createdAt.toISOString(),
      candidates: election.candidates.map((c: any) => ({
        id: c.id,
        name: c.name,
        bio: c.bio ?? undefined,
        avatar_url: c.avatarUrl ?? undefined,
        position: c.position ?? undefined,
      })),
    } as any
  } catch {
    return null
  }
}

export async function castVote(electionId: string, candidateId: string, fingerprint: string) {
  try {
    await prisma.vote.create({
      data: { electionId, candidateId, voterFingerprint: fingerprint },
    })
  } catch (e: any) {
    if (e.code === 'P2002') throw new Error('ALREADY_VOTED')
    throw e
  }
}

export async function getVoteCounts(electionId: string) {
  const candidates = await prisma.candidate.findMany({
    where: { electionId },
    orderBy: { position: 'asc' },
    include: { _count: { select: { votes: true } } },
  })
  const total = candidates.reduce((s: number, c: any) => s + c._count.votes, 0)
  return candidates.map((c: any) => ({
    candidate_id: c.id,
    candidate_name: c.name,
    election_id: electionId,
    count: c._count.votes,
    percentage: total > 0 ? Math.round((c._count.votes / total) * 1000) / 10 : 0,
  }))
}

export async function getElectionByCode(code: string) {
  const election = await prisma.election.findFirst({
    where: { shortCode: code.toUpperCase() },
    select: { id: true, title: true, status: true, shortCode: true },
  })
  if (!election) return null
  return { id: election.id, title: election.title, status: election.status, short_code: election.shortCode }
}