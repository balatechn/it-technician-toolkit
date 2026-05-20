'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useToastStore, type Toast } from '@/lib/store'

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const COLORS = {
  success: 'border-terminal-green/40 bg-terminal-green/10',
  error: 'border-terminal-red/40 bg-terminal-red/10',
  warning: 'border-terminal-yellow/40 bg-terminal-yellow/10',
  info: 'border-terminal-cyan/40 bg-terminal-cyan/10',
}

const TEXT_COLORS = {
  success: 'text-terminal-green',
  error: 'text-terminal-red',
  warning: 'text-terminal-yellow',
  info: 'text-terminal-cyan',
}

function ToastItem({ toast }: { toast: Toast }) {
  const remove = useToastStore((s) => s.removeToast)
  const Icon = ICONS[toast.type]

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl min-w-[280px] max-w-sm ${COLORS[toast.type]}`}
    >
      <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${TEXT_COLORS[toast.type]}`} />
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${TEXT_COLORS[toast.type]}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-xs text-slate-400 mt-0.5 font-mono">{toast.message}</p>
        )}
      </div>
      <button
        onClick={() => remove(toast.id)}
        className="text-slate-500 hover:text-slate-300 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts)

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
