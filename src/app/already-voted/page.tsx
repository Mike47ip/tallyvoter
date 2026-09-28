import { VoterTopbar } from '@/components/vote/VoterTopbar'
import { Button } from '@/components/ui'
import Link from 'next/link'
export default function AlreadyVotedPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <VoterTopbar status="closed"/>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black mb-2">Already Voted</h2>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">This device has already cast a vote in this election. Each member can only vote once.</p>
          <Link href="/"><Button variant="ghost">← Back to Home</Button></Link>
        </div>
      </div>
    </div>
  )
}
