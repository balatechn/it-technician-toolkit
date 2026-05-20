'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Trash2, Minimize2, Maximize2, Terminal } from 'lucide-react'
import { type OutputLine } from '@/lib/commands'
import { cn } from '@/lib/utils'
import { useToastStore } from '@/lib/store'

interface TerminalWindowProps {
  toolName: string
  lines: OutputLine[]
  isRunning: boolean
  progress: number
  onClear?: () => void
  className?: string
}

const LINE_COLORS: Record<string, string> = {
  command: 'terminal-line cmd',
  info: 'terminal-line info',
  success: 'terminal-line success',
  warning: 'terminal-line warning',
  error: 'terminal-line error',
  progress: 'terminal-line progress',
  blank: 'terminal-line',
}

export function TerminalWindow({ toolName, lines, isRunning, progress, onClear, className }: TerminalWindowProps) {
  const endRef = useRef<HTMLDivElement>(null)
  const [minimized, setMinimized] = useState(false)
  const addToast = useToastStore((s) => s.addToast)

  useEffect(() => {
    if (!minimized) {
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [lines, minimized])

  function copyOutput() {
    const text = lines.map((l) => l.text).join('\n')
    navigator.clipboard.writeText(text)
    addToast({ type: 'success', title: 'Copied to clipboard', message: `${lines.length} lines copied.` })
  }

  return (
    <div className={cn('terminal-window', className)}>
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-dot bg-[#ff5f57]" />
        <div className="terminal-dot bg-[#ffbd2e]" />
        <div className="terminal-dot bg-[#28c840]" />
        <div className="flex items-center gap-1.5 ml-2 flex-1">
          <Terminal className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400 text-xs font-mono">
            {toolName} — cmd.exe (Admin)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onClear && (
            <button onClick={onClear} className="p-1 text-slate-600 hover:text-terminal-red transition-colors" title="Clear">
              <Trash2 className="w-3 h-3" />
            </button>
          )}
          <button onClick={copyOutput} className="p-1 text-slate-600 hover:text-terminal-cyan transition-colors" title="Copy output">
            <Copy className="w-3 h-3" />
          </button>
          <button onClick={() => setMinimized(!minimized)} className="p-1 text-slate-600 hover:text-white transition-colors">
            {minimized ? <Maximize2 className="w-3 h-3" /> : <Minimize2 className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      {(isRunning || progress > 0) && (
        <div className="px-4 py-1.5 border-b border-terminal-border bg-black/20">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-mono text-slate-500">
              {isRunning ? 'EXECUTING...' : progress === 100 ? 'COMPLETED' : 'READY'}
            </span>
            <span className="text-[10px] font-mono text-terminal-green">{progress}%</span>
          </div>
          <div className="progress-bar-track">
            <motion.div
              className="progress-bar-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      {/* Output area */}
      <AnimatePresence>
        {!minimized && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="terminal-output max-h-[380px] overflow-y-auto">
              {lines.length === 0 ? (
                <div className="text-slate-600 font-mono text-xs italic">
                  Waiting for command...
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {lines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15 }}
                      className={cn(LINE_COLORS[line.type] || 'terminal-line info', 'font-mono text-xs leading-relaxed')}
                    >
                      {line.text || '\u00A0'}
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}

              {isRunning && (
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-terminal-green font-mono text-xs">$</span>
                  <span className="terminal-cursor" />
                </div>
              )}
              <div ref={endRef} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
