// tallyvoter/src/hooks/useRealtimeResults.ts
'use client'
import { useEffect, useState } from 'react'

interface VoteCount { candidate_id: string; candidate_name: string; count: number; percentage: number }

const TALLYVOTE_URL = process.env.NEXT_PUBLIC_TALLYVOTE_URL ?? 'http://localhost:3000'

export function useRealtimeResults(electionId: string, initial: VoteCount[]) {
  const [counts, setCounts] = useState<VoteCount[]>(initial)

  useEffect(() => {
    if (!electionId) return

    async function fetchCounts() {
      try {
        const res = await fetch(`${TALLYVOTE_URL}/api/elections/${electionId}/counts`)
        if (res.ok) {
          const data = await res.json()
          setCounts(data)
        }
      } catch {}
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 5000)
    return () => clearInterval(interval)
  }, [electionId])

  return counts
}