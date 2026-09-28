import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{background:'#0F1629'}}>
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-black mb-2">Election Not Found</h2>
        <p className="text-sm mb-6" style={{color:'#94A3B8'}}>This election may have ended or the link is incorrect.</p>
        <Link href="/" className="inline-block w-full py-3.5 rounded-xl font-bold text-sm text-center"
          style={{background:'#4F46E5', color:'white'}}>← Back to Home</Link>
      </div>
    </div>
  )
}
