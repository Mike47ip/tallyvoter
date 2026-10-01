// tallyvoter: src/app/api/vote/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { castVote } from '@/lib/elections'
import { PrismaClient } from '@prisma/client'

export const dynamic = 'force-dynamic'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }
const prisma = globalForPrisma.prisma ?? new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

const TALLYVOTE_URL = process.env.NEXT_PUBLIC_TALLYVOTE_URL ?? 'http://localhost:3000'

export async function POST(req: NextRequest) {
  try {
    const { election_id, candidate_id, fingerprint, vote_code } = await req.json()
    if (!election_id || !candidate_id)
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })

    // Check if election is restricted via Prisma
    const election = await prisma.election.findFirst({
      where: { id: election_id },
      select: { restricted: true },
    })

    if (election?.restricted) {
      if (!vote_code)
        return NextResponse.json({ error: 'Vote code required for this election' }, { status: 400 })

      const verifyRes = await fetch(`${TALLYVOTE_URL}/api/elections/${election_id}/verify-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_code }),
      })
      const verifyData = await verifyRes.json()

      if (!verifyRes.ok) {
        if (verifyData.error === 'ALREADY_VOTED')
          return NextResponse.json({ error: 'ALREADY_VOTED' }, { status: 409 })
        return NextResponse.json({ error: verifyData.error ?? 'Invalid code' }, { status: 401 })
      }

      await castVote(election_id, candidate_id, `code_${vote_code.toUpperCase()}`)

      await fetch(`${TALLYVOTE_URL}/api/elections/${election_id}/mark-voted`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vote_code }),
      })

      return NextResponse.json({ success: true })
    }

    // Open election
    await castVote(election_id, candidate_id, fingerprint ?? 'anonymous')
    return NextResponse.json({ success: true })

  } catch (e: any) {
    if (e.message === 'ALREADY_VOTED')
      return NextResponse.json({ error: 'ALREADY_VOTED' }, { status: 409 })
    console.error(e)
    return NextResponse.json({ error: 'Failed to cast vote' }, { status: 500 })
  }
}