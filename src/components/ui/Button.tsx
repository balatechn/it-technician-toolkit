import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ReactNode
  children: React.ReactNode
}

const VARIANTS = {
  primary: 'bg-terminal-green text-black font-bold hover:bg-terminal-green-dim shadow-glow-green',
  secondary: 'bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/30 hover:bg-terminal-cyan/20',
  danger: 'bg-terminal-red/10 text-terminal-red border border-terminal-red/30 hover:bg-terminal-red/20',
  ghost: 'text-slate-400 hover:text-white hover:bg-white/5',
  outline: 'border border-terminal-border text-slate-300 hover:border-terminal-border-active hover:text-white',
}

const SIZES = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export function Button({ variant = 'outline', size = 'md', loading, icon, children, className, disabled, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || disabled}
      className={cn(
        'inline-flex items-center justify-center font-mono rounded-lg transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  )
}
