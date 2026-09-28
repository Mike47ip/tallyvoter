export type ElectionStatus = 'draft' | 'live' | 'closed'

export interface Election {
  id: string; org_id: string; title: string; description?: string
  status: ElectionStatus; anonymous: boolean
  starts_at: string; ends_at: string; created_at: string
  candidates?: Candidate[]; vote_count?: number
}

export interface Candidate {
  id: string; election_id: string; name: string
  bio?: string; avatar_url?: string; position?: number
}

export interface VoteCount {
  candidate_id: string; candidate_name: string; count: number; percentage: number
}
