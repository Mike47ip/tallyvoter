import { NextRequest, NextResponse } from 'next/server'
import { getElectionByCode } from '@/lib/elections'

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code')
  if (!code) return NextResponse.json({ error: 'Code required' }, { status: 400 })

  const election = await getElectionByCode(code)
  if (!election) return NextResponse.json({ error: 'Election not found' }, { status: 404 })
  if (election.status !== 'live') return NextResponse.json({ error: `Election is ${election.status}` }, { status: 403 })

  return NextResponse.json({ id: election.id, title: election.title })
}
