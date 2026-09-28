'use client'
import { useState, useEffect } from 'react'
import { useRealtimeResults } from '@/hooks/useRealtimeResults'
import { VoterTopbar } from '@/components/vote/VoterTopbar'
import { Card, Button } from '@/components/ui'
import { GRADIENTS } from '@/lib/utils'
import type { Election } from '@/types'

type Screen = 'vote' | 'confirm' | 'submitting' | 'success' | 'already_voted' | 'error'

// Simple browser fingerprint for dedup
function getFingerprint(electionId: string): string {
  const key = `tv_fp_${electionId}`
  try {
    let fp = localStorage.getItem(key)
    if (!fp) {
      fp = `${Date.now()}-${Math.random().toString(36).slice(2)}`
      localStorage.setItem(key, fp)
    }
    return fp
  } catch { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }
}

function hasVotedLocally(electionId: string): boolean {
  try { return !!localStorage.getItem(`tv_voted_${electionId}`) } catch { return false }
}

function markVotedLocally(electionId: string) {
  try { localStorage.setItem(`tv_voted_${electionId}`, '1') } catch {}
}

const BAR_COLORS = ['bg-indigo-500','bg-emerald-500','bg-amber-500','bg-rose-500','bg-violet-500']

export function VoteFlow({ election, initialCounts }: { election: Election; initialCounts: any[] }) {
  const [screen, setScreen] = useState<Screen>('vote')
  const [selected, setSelected] = useState<string|null>(null)
  const [showResults, setShowResults] = useState(false)
  const counts = useRealtimeResults(election.id, initialCounts)

  const candidates = election.candidates ?? []
  const candidate = candidates.find(c => c.id === selected)

  // Check already voted on mount
  useEffect(() => {
    if (hasVotedLocally(election.id)) setScreen('already_voted')
  }, [election.id])

  async function handleSubmit() {
    if (!selected) return
    setScreen('submitting')
    try {
      const fingerprint = getFingerprint(election.id)
      const res = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ election_id: election.id, candidate_id: selected, fingerprint }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'ALREADY_VOTED') { setScreen('already_voted'); return }
        throw new Error(data.error)
      }
      markVotedLocally(election.id)
      setScreen('success')
    } catch (e) {
      setScreen('error')
    }
  }

  // ── ALREADY VOTED ──
  if (screen === 'already_voted') return (
    <div className="min-h-screen flex flex-col" style={{background:'#0F1629'}}>
      <VoterTopbar status="closed"/>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-xs">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-black mb-2">Already Voted</h2>
          <p className="text-sm mb-6" style={{color:'#94A3B8'}}>You've already cast your vote in this election. Each member can only vote once.</p>
          <button onClick={() => setShowResults(true)}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all"
            style={{background:'#4F46E5', color:'white'}}>
            See Live Results →
          </button>
          {showResults && counts.length > 0 && (
            <div className="mt-6 text-left">
              {counts.map((v,i) => (
                <div key={v.candidate_id} className="mb-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-semibold">{v.candidate_name}</span>
                    <span className="font-bold">{Number(v.percentage)||0}%</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                    <div className={`h-full rounded-full ${BAR_COLORS[i%BAR_COLORS.length]}`} style={{width:`${Number(v.percentage)||0}%`}}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // ── VOTE SCREEN ──
  if (screen === 'vote') return (
    <div className="min-h-screen flex flex-col" style={{background:'#0F1629'}}>
      <VoterTopbar/>
      <div className="flex-1 flex flex-col items-center px-5 py-8 pb-16 w-full" style={{maxWidth:480, margin:'0 auto'}}>
        <div className="text-center mb-8 w-full">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-4"
            style={{background:'#1E2A47', border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8'}}>
            <span className="w-1.5 h-1.5 rounded-full" style={{background:'#6366F1'}}/>
            {election.org_id ? 'My Organization' : 'TallyVote'}
          </span>
          <h1 className="text-2xl font-black leading-tight mb-2">{election.title}</h1>
          {election.description && <p className="text-sm leading-relaxed" style={{color:'#94A3B8'}}>{election.description}</p>}
          <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl text-xs font-semibold"
            style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'#F59E0B'}}>
            ⏱ Closes {new Date(election.ends_at).toLocaleString([],{dateStyle:'medium',timeStyle:'short'})}
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-7">
          <div className="w-12 h-1 rounded-full" style={{background:'#4F46E5'}}/>
          <div className="w-7 h-1 rounded-full" style={{background:'#1E2A47'}}/>
          <div className="w-7 h-1 rounded-full" style={{background:'#1E2A47'}}/>
        </div>

        <p className="text-sm font-bold self-start mb-3 w-full">Choose your candidate</p>

        <div className="space-y-2.5 w-full mb-6">
          {candidates.map((c, i) => (
            <button key={c.id} onClick={() => setSelected(c.id)}
              className="w-full flex items-center gap-3.5 px-4 py-4 rounded-2xl text-left transition-all"
              style={{
                border: `2px solid ${selected===c.id ? '#4F46E5' : 'rgba(255,255,255,0.1)'}`,
                background: selected===c.id ? 'rgba(79,70,229,0.1)' : 'transparent',
              }}>
              <span className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0"
                style={{background: GRADIENTS[i % GRADIENTS.length]}}>
                {c.name.split(' ').map((w:string) => w[0]).join('').slice(0,2).toUpperCase()}
              </span>
              <div className="flex-1">
                <p className="text-sm font-bold">{c.name}</p>
                {c.bio && <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>{c.bio}</p>}
              </div>
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] transition-all flex-shrink-0"
                style={{
                  borderColor: selected===c.id ? '#4F46E5' : 'rgba(255,255,255,0.2)',
                  background: selected===c.id ? '#4F46E5' : 'transparent',
                  color: 'white',
                }}>
                {selected===c.id && '✓'}
              </div>
            </button>
          ))}
        </div>

        <button disabled={!selected} onClick={() => setScreen('confirm')}
          className="w-full py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{background:'#4F46E5', color:'white'}}>
          Review &amp; Confirm →
        </button>

        <p className="text-[11px] mt-4 text-center" style={{color:'#94A3B8'}}>
          🔒 Your vote is encrypted and anonymous
        </p>
      </div>
    </div>
  )

  // ── CONFIRM SCREEN ──
  if (screen === 'confirm' && candidate) return (
    <div className="min-h-screen flex flex-col" style={{background:'#0F1629'}}>
      <VoterTopbar/>
      <div className="flex-1 flex flex-col items-center px-5 py-8 pb-16 w-full" style={{maxWidth:480, margin:'0 auto'}}>
        <div className="text-center mb-8 w-full">
          <h1 className="text-2xl font-black mb-1">Confirm Your Vote</h1>
          <p className="text-sm" style={{color:'#94A3B8'}}>{election.title}</p>
        </div>

        <div className="flex items-center gap-2 mb-7">
          <div className="w-7 h-1 rounded-full" style={{background:'#10B981'}}/>
          <div className="w-12 h-1 rounded-full" style={{background:'#4F46E5'}}/>
          <div className="w-7 h-1 rounded-full" style={{background:'#1E2A47'}}/>
        </div>

        <Card className="w-full text-center mb-4">
          <p className="text-xs mb-4" style={{color:'#94A3B8'}}>You are voting for</p>
          <span className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-3"
            style={{background: GRADIENTS[candidates.findIndex(c => c.id === selected) % GRADIENTS.length]}}>
            {candidate.name.split(' ').map((w:string) => w[0]).join('').slice(0,2).toUpperCase()}
          </span>
          <p className="text-xl font-black mb-1">{candidate.name}</p>
          {candidate.bio && <p className="text-sm mb-6" style={{color:'#94A3B8'}}>{candidate.bio}</p>}
          <div className="rounded-xl p-3 text-xs text-left leading-relaxed"
            style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', color:'#F59E0B'}}>
            ⚠️ <strong>This action is final.</strong> Once submitted your vote cannot be changed.
          </div>
        </Card>

        <div className="flex gap-3 w-full">
          <button onClick={() => setScreen('vote')}
            className="flex-1 py-3.5 rounded-xl border text-sm font-semibold transition-all"
            style={{border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', background:'transparent'}}>
            ← Change
          </button>
          <button onClick={handleSubmit}
            className="py-3.5 rounded-xl text-sm font-bold transition-all"
            style={{flex:2, background:'#4F46E5', color:'white'}}>
            Submit Vote ✓
          </button>
        </div>
      </div>
    </div>
  )

  // ── SUBMITTING ──
  if (screen === 'submitting') return (
    <div className="min-h-screen flex items-center justify-center" style={{background:'#0F1629'}}>
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"/>
        <p className="text-sm font-semibold" style={{color:'#94A3B8'}}>Submitting your vote...</p>
      </div>
    </div>
  )

  // ── ERROR ──
  if (screen === 'error') return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{background:'#0F1629'}}>
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">❌</div>
        <h2 className="text-xl font-black mb-2">Something went wrong</h2>
        <p className="text-sm mb-6" style={{color:'#94A3B8'}}>Your vote was not submitted. Please try again.</p>
        <button onClick={() => setScreen('confirm')}
          className="w-full py-3.5 rounded-xl font-bold text-sm"
          style={{background:'#4F46E5', color:'white'}}>Try Again</button>
      </div>
    </div>
  )

  // ── SUCCESS ──
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#0F1629'}}>
      <VoterTopbar status="closed"/>
      <div className="flex-1 flex flex-col items-center px-5 py-10 pb-16 w-full text-center" style={{maxWidth:480, margin:'0 auto'}}>
        <div className="text-6xl mb-5" style={{animation:'bounceIn 0.5s'}}>✅</div>
        <h2 className="text-2xl font-black mb-2" style={{color:'#10B981'}}>Vote Recorded!</h2>
        <p className="text-sm leading-relaxed mb-8" style={{color:'#94A3B8', maxWidth:280}}>
          Your vote has been securely recorded. Results will be announced when voting closes.
        </p>

        {/* Receipt */}
        <Card className="w-full text-left mb-6">
          {[
            ['Election', election.title],
            ['Voted for', candidate?.name ?? ''],
            ['Status', '✓ Confirmed'],
            ['Time', new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})],
            ['Anonymous', 'Yes'],
          ].map(([l,v]) => (
            <div key={l} className="flex justify-between items-center py-2.5 text-sm" style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
              <span style={{color:'#94A3B8'}}>{l}</span>
              <span className={`font-semibold ${l==='Status'||l==='Anonymous'?'text-emerald-400':''}`}>{v}</span>
            </div>
          ))}
        </Card>

        <div className="flex gap-3 w-full mb-8">
          <button onClick={() => setShowResults(r => !r)}
            className="flex-1 py-3 rounded-xl border text-sm font-semibold transition-all"
            style={{border:'1px solid rgba(255,255,255,0.1)', color:'#94A3B8', background:'transparent'}}>
            📊 {showResults ? 'Hide' : 'Live Results'}
          </button>
        </div>

        {showResults && (
          <div className="w-full rounded-2xl p-5 text-left" style={{background:'#151D35', border:'1px solid rgba(255,255,255,0.08)'}}>
            <p className="text-sm font-bold mb-4">📊 Live Results</p>
            {counts.length > 0 ? counts.map((v, i) => (
              <div key={v.candidate_id} className="mb-3">
                <div className="flex justify-between items-center mb-1.5 text-sm">
                  <span className="font-semibold flex items-center gap-2">
                    {v.candidate_name}
                    {i===0 && v.count > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                        style={{background:'rgba(16,185,129,0.1)', color:'#10B981', border:'1px solid rgba(16,185,129,0.3)'}}>
                        Leading
                      </span>
                    )}
                  </span>
                  <span className="font-bold">{Number(v.percentage)||0}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.05)'}}>
                  <div className={`h-full rounded-full ${BAR_COLORS[i%BAR_COLORS.length]} transition-all duration-700`}
                    style={{width:`${Number(v.percentage)||0}%`}}/>
                </div>
              </div>
            )) : <p className="text-xs text-center py-4" style={{color:'#94A3B8'}}>Loading results...</p>}
            <p className="text-[11px] text-center mt-3" style={{color:'#94A3B8'}}>Updates in real time</p>
          </div>
        )}
      </div>
    </div>
  )
}
