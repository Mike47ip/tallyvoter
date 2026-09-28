import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes } from 'react'

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'ghost' }
export function Button({ variant='primary', className, children, ...props }: BtnProps) {
  return (
    <button className={cn('w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed', variant==='primary'?'bg-indigo-600 text-white hover:bg-indigo-500':'bg-transparent text-slate-400 border border-white/10 hover:text-white hover:border-slate-400', className)} {...props}>
      {children}
    </button>
  )
}

export function Card({ className, children }: { className?:string; children:React.ReactNode }) {
  return <div className={cn('bg-[#151D35] border border-white/[0.08] rounded-2xl p-6', className)}>{children}</div>
}
