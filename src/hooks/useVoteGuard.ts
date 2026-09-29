'use client'
import { useEffect, useState } from 'react'

const KEY = (electionId: string) => `tv_voted_${electionId}`

export function useVoteGuard(electionId: string) {
  const [hasVoted, setHasVoted] = useState(false)

  useEffect(() => {
    try {
      setHasVoted(!!localStorage.getItem(KEY(electionId)))
    } catch { }
  }, [electionId])

  const markVoted = () => {
    try { localStorage.setItem(KEY(electionId), '1') } catch { }
    setHasVoted(true)
  }

  return { hasVoted, markVoted }
}
