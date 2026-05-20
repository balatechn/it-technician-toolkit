import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'purple'
  size?: 'sm' | 'md'
  className?: string
  dot?: boolean
}

const VARIANTS = {
  default: 'bg-slate-700/50 text-slate-300 border-slate-600/40',
  success: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
  error: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
  warning: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
  info: 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30',
  purple: 'bg-terminal-purple/10 text-terminal-purple border-terminal-purple/30',
}

const DOT_COLORS = {
  default: 'bg-slate-400',
  success: 'bg-terminal-green',
  error: 'bg-terminal-red',
  warning: 'bg-terminal-yellow',
  info: 'bg-terminal-cyan',
  purple: 'bg-terminal-purple',
}

export function Badge({ children, variant = 'default', size = 'sm', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 border rounded-full font-mono font-medium',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        VARIANTS[variant],
        className
      )}
    >
      {dot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', DOT_COLORS[variant])} />
      )}
      {children}
    </span>
  )
}
