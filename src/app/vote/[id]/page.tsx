import { notFound } from 'next/navigation'
import { getLiveElection, getVoteCounts } from '@/lib/elections'
import { VoteFlow } from './VoteFlow'

export default async function VotePage({ params }: { params: { id: string } }) {
  const [election, initialCounts] = await Promise.all([
    getLiveElection(params.id),
    getVoteCounts(params.id),
  ])

  if (!election) notFound()

  return <VoteFlow election={election} initialCounts={initialCounts}/>
}
