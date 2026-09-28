'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface VoteCount { candidate_id: string; candidate_name: string; count: number; percentage: number }

export function useRealtimeResults(electionId: string, initial: VoteCount[]) {
  const [counts, setCounts] = useState<VoteCount[]>(initial)

  useEffect(() => {
    if (!electionId) return
    const supabase = createClient()
    const channel = supabase
      .channel(`results:${electionId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'votes',
        filter: `election_id=eq.${electionId}`,
      }, async () => {
        const { data } = await supabase
          .from('vote_counts').select('*')
          .eq('election_id', electionId).order('count', { ascending: false })
        if (data) setCounts(data)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [electionId])

  return counts
}
