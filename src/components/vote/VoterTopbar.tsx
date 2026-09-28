import { ADMIN_URL } from '@/lib/utils'

export function VoterTopbar({ status='open' }: { status?:'open'|'closed' }) {
  return (
    <header className="w-full bg-[#151D35] border-b border-white/[0.08] px-5 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-base">🗳️</span>
        <span className="text-lg font-black tracking-tight">Tally<span className="text-indigo-400">Vote</span></span>
      </div>
      {status==='open'
        ? <span className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1.5 rounded-full text-xs font-semibold text-emerald-400">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse-dot"/>Voting Open
          </span>
        : <span className="text-xs text-slate-500">Powered by <a href={ADMIN_URL} className="text-indigo-400">TallyVote</a></span>
      }
    </header>
  )
}
