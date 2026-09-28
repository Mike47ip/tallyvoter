import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export const cn = (...i: ClassValue[]) => twMerge(clsx(i))
export const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? 'http://localhost:3000'
export const GRADIENTS = [
  'linear-gradient(135deg,#4F46E5,#818CF8)',
  'linear-gradient(135deg,#10B981,#34D399)',
  'linear-gradient(135deg,#F59E0B,#FCD34D)',
  'linear-gradient(135deg,#F43F5E,#FB7185)',
  'linear-gradient(135deg,#8B5CF6,#A78BFA)',
]
export const initials = (name: string) => name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2)
