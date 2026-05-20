import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  glow?: boolean
  onClick?: () => void
}

export function Card({ children, className, hover = false, glow = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl border p-5',
        'bg-terminal-card border-terminal-border',
        hover && 'cursor-pointer transition-all duration-250 hover:border-terminal-border-active hover:shadow-glow-green hover:-translate-y-0.5',
        glow && 'shadow-glow-green',
        className
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex items-center justify-between mb-4', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <h3 className={cn('font-semibold text-white text-sm', className)}>
      {children}
    </h3>
  )
}
