'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

type View = 'home' | 'code' | 'link' | 'qr'

export default function VoterHome() {
  const router = useRouter()
  const [view, setView] = useState<View>('home')
  const [code, setCode] = useState('')
  const [link, setLink] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleCodeSubmit() {
    if (!code.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch(`/api/lookup?code=${encodeURIComponent(code.trim())}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Election not found')
      router.push(`/vote/${data.id}`)
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  function handleLinkSubmit() {
    setError('')
    try {
      const url = new URL(link.trim())
      const match = url.pathname.match(/\/vote\/([a-zA-Z0-9-]+)/)
      if (match) router.push(`/vote/${match[1]}`)
      else setError('Invalid TallyVote link. Paste the full link.')
    } catch { setError('Invalid URL. Paste the full link you received.') }
  }

  const inputClass = "w-full rounded-xl px-4 py-3.5 text-white font-semibold text-base outline-none transition-colors placeholder:text-slate-500 placeholder:font-normal"
  const inputStyle = {background:'#1E2A47', border:'1px solid rgba(255,255,255,0.1)'}

  const methodBtn = (onClick: () => void, icon: string, title: string, desc: string) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left transition-all group"
      style={{border:'2px solid rgba(255,255,255,0.1)', background:'#151D35'}}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor='#4F46E5'; (e.currentTarget as HTMLElement).style.background='rgba(79,70,229,0.1)' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor='rgba(255,255,255,0.1)'; (e.currentTarget as HTMLElement).style.background='#151D35' }}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-bold text-sm">{title}</p>
        <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>{desc}</p>
      </div>
      <span className="text-lg transition-transform group-hover:translate-x-0.5" style={{color:'#6366F1'}}>→</span>
    </button>
  )

  const premiumBtn = (icon: string, title: string, desc: string, tier: string, tierColor: string) => (
    <button disabled className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-left opacity-50 cursor-not-allowed"
      style={{border:'2px solid rgba(255,255,255,0.06)', background:'rgba(21,29,53,0.5)'}}>
      <span className="text-2xl">{icon}</span>
      <div className="flex-1">
        <p className="font-bold text-sm flex items-center gap-2">
          {title}
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{background:`${tierColor}1a`, color:tierColor, borderColor:`${tierColor}33`}}>{tier}</span>
        </p>
        <p className="text-xs mt-0.5" style={{color:'#94A3B8'}}>{desc}</p>
      </div>
      <span className="text-xs" style={{color:'#94A3B8'}}>Upgrade →</span>
    </button>
  )

  if (view === 'home') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12" style={{background:'#0F1629'}}>
      <div className="w-full" style={{maxWidth:360}}>
        <div className="text-center mb-10">
          <span className="text-5xl mb-4 block">🗳️</span>
          <h1 className="text-3xl font-black tracking-tight mb-1">Tally<span style={{color:'#6366F1'}}>Vote</span></h1>
          <p className="text-sm" style={{color:'#94A3B8'}}>How would you like to vote?</p>
        </div>
        <div className="space-y-3 mb-8">
          {methodBtn(() => setView('qr'),   '📱', 'Scan QR Code',       'Point your camera at the election poster')}
          {methodBtn(() => setView('code'), '🔢', 'Enter Election Code', 'Type the short code e.g. PRES25')}
          {methodBtn(() => setView('link'), '🔗', 'Paste Voting Link',   'Got a link via WhatsApp or email?')}
          <div className="flex items-center gap-3 py-1">
            <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}}/>
            <span className="text-xs" style={{color:'#94A3B8'}}>premium methods</span>
            <div className="flex-1 h-px" style={{background:'rgba(255,255,255,0.06)'}}/>
          </div>
          {premiumBtn('📧', 'Use Email Link', 'Vote via a link sent to your email', 'Starter', '#F59E0B')}
          {premiumBtn('📲', 'Use SMS Code',   'Get a one-time code via text',        'Pro',     '#8B5CF6')}
          {premiumBtn('📟', 'Dial USSD Code', 'No internet needed — vote via *347#', 'Pro',     '#8B5CF6')}
        </div>
        <p className="text-center text-[11px]" style={{color:'#94A3B8'}}>🔒 All votes are encrypted and anonymous</p>
      </div>
    </div>
  )

  if (view === 'code') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{background:'#0F1629'}}>
      <div className="w-full" style={{maxWidth:360}}>
        <button onClick={() => { setView('home'); setCode(''); setError('') }}
          className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
          style={{color:'#94A3B8'}}>← Back</button>
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🔢</span>
          <h2 className="text-2xl font-black mb-1">Enter Election Code</h2>
          <p className="text-sm" style={{color:'#94A3B8'}}>Your admin or organizer will share this with you</p>
        </div>
        <div className="space-y-3">
          <input className={inputClass} style={inputStyle} value={code}
            onChange={e => { setCode(e.target.value.toUpperCase()); setError('') }}
            onKeyDown={e => e.key==='Enter' && handleCodeSubmit()}
            placeholder="e.g. PRES25" maxLength={10} autoFocus/>
          {error && <p className="text-xs px-1" style={{color:'#F43F5E'}}>{error}</p>}
          <button onClick={handleCodeSubmit} disabled={!code.trim() || loading}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{background:'#4F46E5', color:'white'}}>
            {loading ? 'Looking up...' : 'Find Election →'}
          </button>
        </div>
        <div className="mt-8 rounded-2xl p-4" style={{background:'#151D35', border:'1px solid rgba(255,255,255,0.08)'}}>
          <p className="text-xs font-bold mb-2">💡 Where to find your code</p>
          <ul className="text-xs space-y-1.5" style={{color:'#94A3B8'}}>
            <li>• On the election notice board or poster</li>
            <li>• In a WhatsApp or email from your organizer</li>
            <li>• Next to the QR code on printed materials</li>
          </ul>
        </div>
      </div>
    </div>
  )

  if (view === 'link') return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{background:'#0F1629'}}>
      <div className="w-full" style={{maxWidth:360}}>
        <button onClick={() => { setView('home'); setLink(''); setError('') }}
          className="flex items-center gap-2 text-sm mb-8 transition-colors hover:text-white"
          style={{color:'#94A3B8'}}>← Back</button>
        <div className="text-center mb-8">
          <span className="text-4xl mb-3 block">🔗</span>
          <h2 className="text-2xl font-black mb-1">Paste Your Link</h2>
          <p className="text-sm" style={{color:'#94A3B8'}}>Paste the voting link sent via WhatsApp, email or SMS</p>
        </div>
        <div className="space-y-3">
          <textarea className={`${inputClass} resize-none`} style={inputStyle} rows={3}
            value={link} onChange={e => { setLink(e.target.value); setError('') }}
            placeholder="https://vote.tallyvote.app/vote/..." autoFocus/>
          {error && <p className="text-xs px-1" style={{color:'#F43F5E'}}>{error}</p>}
          <button onClick={handleLinkSubmit} disabled={!link.trim()}
            className="w-full py-4 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{background:'#4F46E5', color:'white'}}>
            Go to Election →
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5" style={{background:'#0F1629'}}>
      <div className="w-full text-center" style={{maxWidth:360}}>
        <button onClick={() => setView('home')}
          className="flex items-center gap-2 text-sm mb-8 mx-auto transition-colors hover:text-white"
          style={{color:'#94A3B8'}}>← Back</button>
        <span className="text-4xl mb-4 block">📱</span>
        <h2 className="text-2xl font-black mb-2">Scan QR Code</h2>
        <p className="text-sm mb-8" style={{color:'#94A3B8'}}>Use your phone's camera app to scan the QR code on the election poster</p>
        <div className="rounded-2xl p-6 mb-6" style={{background:'#151D35', border:'1px solid rgba(255,255,255,0.08)'}}>
          <div className="text-6xl mb-3">📷</div>
          <p className="text-sm font-semibold mb-1">Open your Camera app</p>
          <p className="text-xs" style={{color:'#94A3B8'}}>Point it at the QR code — a link appears automatically. Tap it to vote.</p>
        </div>
        <p className="text-xs" style={{color:'#94A3B8'}}>
          No QR code?{' '}
          <button onClick={() => setView('code')} style={{color:'#6366F1'}} className="font-semibold">Use election code instead</button>
        </p>
      </div>
    </div>
  )
}
