'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Play, Square, CheckCircle2, XCircle, Clock, Shield, Wrench, Globe,
  Network, RefreshCw, HardDrive, Trash2, Key, ShieldCheck, Monitor, Zap, Cpu
} from 'lucide-react'
import { type RepairTool, type OutputLine } from '@/lib/commands'
import { TerminalWindow } from '@/components/terminal/TerminalWindow'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useToastStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield, Wrench, Globe, Network, RefreshCw, HardDrive, Trash2, Key, ShieldCheck, Monitor, Zap, Cpu
}

const DANGER_BADGE: Record<string, { variant: 'success' | 'warning' | 'error'; label: string }> = {
  safe: { variant: 'success', label: 'SAFE' },
  moderate: { variant: 'warning', label: 'MODERATE' },
  caution: { variant: 'error', label: 'CAUTION' },
}

const CATEGORY_COLORS: Record<string, string> = {
  system: 'text-terminal-cyan',
  network: 'text-terminal-yellow',
  disk: 'text-terminal-orange',
  maintenance: 'text-terminal-green',
  security: 'text-terminal-red',
  info: 'text-terminal-purple',
}

type RunState = 'idle' | 'running' | 'completed' | 'failed'

interface RepairCardProps {
  tool: RepairTool
  onLogSaved?: () => void
}

export function RepairCard({ tool, onLogSaved }: RepairCardProps) {
  const Icon = ICONS[tool.icon] || Shield
  const danger = DANGER_BADGE[tool.dangerLevel]
  const addToast = useToastStore((s) => s.addToast)

  const [state, setState] = useState<RunState>('idle')
  const [progress, setProgress] = useState(0)
  const [visibleLines, setVisibleLines] = useState<OutputLine[]>([])
  const [showTerminal, setShowTerminal] = useState(false)
  const [stopFlag, setStopFlag] = useState(false)
  const [startTime, setStartTime] = useState(0)
  const stopFlagRef = { current: false }

  const runTool = useCallback(async () => {
    if (state === 'running') return
    setState('running')
    setProgress(0)
    setVisibleLines([])
    setShowTerminal(true)
    stopFlagRef.current = false
    const start = Date.now()
    setStartTime(start)

    const lines = tool.outputLines
    let cancelled = false

    for (let i = 0; i < lines.length; i++) {
      if (stopFlagRef.current) { cancelled = true; break }
      const line = lines[i]
      await new Promise<void>((res) => setTimeout(res, line.delay - (i > 0 ? lines[i - 1].delay : 0)))
      if (stopFlagRef.current) { cancelled = true; break }
      setVisibleLines((prev) => [...prev, line])
      if (line.progress !== undefined) setProgress(line.progress)
    }

    if (cancelled) {
      setState('failed')
      setProgress(0)
      addToast({ type: 'warning', title: `${tool.name} stopped`, message: 'Command execution was cancelled.' })
      return
    }

    const duration = Date.now() - start
    setState('completed')
    setProgress(100)
    addToast({ type: 'success', title: `${tool.name} complete`, message: `Finished in ${(duration / 1000).toFixed(1)}s` })

    // Save log
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId: tool.id,
          toolName: tool.name,
          command: tool.command,
          status: 'success',
          duration,
          technician: 'admin',
          device: 'WORKSTATION-LOCAL',
        }),
      })
      onLogSaved?.()
    } catch {
      // non-critical
    }
  }, [tool, state, addToast, onLogSaved])

  function stopTool() {
    stopFlagRef.current = true
    setStopFlag(true)
  }

  function reset() {
    setState('idle')
    setProgress(0)
    setVisibleLines([])
    setShowTerminal(false)
    setStopFlag(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'repair-card',
        state === 'running' && 'running',
        state === 'completed' && 'completed',
        state === 'failed' && 'failed'
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            state === 'completed' ? 'bg-terminal-green/15 border border-terminal-green/30' :
            state === 'failed' ? 'bg-terminal-red/15 border border-terminal-red/30' :
            'bg-terminal-card-2 border border-terminal-border'
          )}>
            {state === 'completed' ? (
              <CheckCircle2 className="w-4 h-4 text-terminal-green" />
            ) : state === 'failed' ? (
              <XCircle className="w-4 h-4 text-terminal-red" />
            ) : (
              <Icon className={cn('w-4 h-4', CATEGORY_COLORS[tool.category])} />
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">{tool.name}</h3>
            <span className={cn('text-xs font-mono capitalize', CATEGORY_COLORS[tool.category])}>
              {tool.category}
            </span>
          </div>
        </div>
        <Badge variant={danger.variant} size="sm">{danger.label}</Badge>
      </div>

      {/* Description */}
      <p className="text-xs text-slate-400 mb-3 leading-relaxed">{tool.description}</p>

      {/* Command */}
      <div className="bg-black/30 rounded-md px-3 py-2 mb-4 border border-terminal-border">
        <code className="text-xs font-mono text-terminal-cyan break-all">{tool.command}</code>
      </div>

      {/* Estimated time */}
      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono mb-4">
        <Clock className="w-3 h-3" />
        <span>~{tool.estimatedTime}s estimated</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {state === 'idle' && (
          <Button
            variant="primary"
            size="sm"
            icon={<Play className="w-3 h-3" />}
            onClick={runTool}
            className="flex-1"
          >
            RUN
          </Button>
        )}
        {state === 'running' && (
          <>
            <Button
              variant="danger"
              size="sm"
              icon={<Square className="w-3 h-3" />}
              onClick={stopTool}
              className="flex-1"
            >
              STOP
            </Button>
            <div className="flex items-center gap-1.5 text-xs font-mono text-terminal-yellow">
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-terminal-yellow"
              />
              {progress}%
            </div>
          </>
        )}
        {(state === 'completed' || state === 'failed') && (
          <>
            <Button variant="ghost" size="sm" onClick={reset} className="flex-1">
              RESET
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Play className="w-3 h-3" />}
              onClick={runTool}
            >
              RE-RUN
            </Button>
          </>
        )}
        {(state !== 'idle') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTerminal(!showTerminal)}
          >
            {showTerminal ? 'HIDE' : 'LOGS'}
          </Button>
        )}
      </div>

      {/* Terminal */}
      {showTerminal && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          <TerminalWindow
            toolName={tool.name}
            lines={visibleLines}
            isRunning={state === 'running'}
            progress={progress}
            onClear={state !== 'running' ? reset : undefined}
          />
        </motion.div>
      )}
    </motion.div>
  )
}
