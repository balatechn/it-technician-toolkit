'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Network, Wifi, WifiOff, Search, Download, Terminal, Loader2,
  Monitor, Laptop, Server, Globe, RefreshCw, Copy, CheckCircle2,
  AlertCircle, Zap, Shield, X
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToastStore } from '@/lib/store'

// ── Types ─────────────────────────────────────────────────────────────────────
interface PingResult {
  alive: boolean
  latency: number | null
  ip: string
  hostname: string | null
  osHint: string
  openPorts: { port: number; service: string; latency: number }[]
}

interface ScanDevice {
  ip: string
  hostname: string | null
  openPorts: number[]
  osHint: string
}

// ── Quick Connect Panel ───────────────────────────────────────────────────────
function QuickConnect() {
  const addToast = useToastStore((s) => s.addToast)
  const [ip, setIp] = useState('')
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [port, setPort] = useState('3389')
  const [pinging, setPinging] = useState(false)
  const [pingResult, setPingResult] = useState<PingResult | null>(null)
  const [copied, setCopied] = useState(false)

  async function handlePing() {
    if (!ip) return
    setPinging(true)
    setPingResult(null)
    try {
      const res = await fetch('/api/network/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      })
      const data = await res.json()
      if (res.ok) {
        setPingResult(data)
        if (!name && data.hostname) setName(data.hostname.split('.')[0])
      } else {
        addToast({ type: 'error', title: 'Ping failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not reach server' })
    } finally {
      setPinging(false)
    }
  }

  function downloadRdp() {
    if (!ip) return
    const params = new URLSearchParams({ ip, name: name || ip, port, username })
    window.open(`/api/network/rdp?${params}`, '_blank')
    addToast({ type: 'success', title: 'RDP file downloaded', message: `${name || ip}.rdp` })
  }

  function copySsh() {
    const cmd = `ssh ${username ? username + '@' : ''}${ip}`
    navigator.clipboard.writeText(cmd)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
    addToast({ type: 'info', title: 'Copied', message: cmd })
  }

  const OS_ICON: Record<string, any> = { Windows: Monitor, 'Linux / macOS': Laptop, 'Web / IoT': Globe }

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Zap className="w-4 h-4 text-terminal-green" />
        <h2 className="font-mono font-bold text-white text-sm">QUICK CONNECT</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">IP ADDRESS *</label>
          <input
            className="input-field font-mono"
            placeholder="192.168.1.100"
            value={ip}
            onChange={e => setIp(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handlePing()}
          />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">DISPLAY NAME</label>
          <input className="input-field" placeholder="PC-01 (for RDP filename)" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">USERNAME</label>
          <input className="input-field font-mono" placeholder="administrator" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">RDP PORT</label>
          <input className="input-field font-mono" placeholder="3389" value={port} onChange={e => setPort(e.target.value)} />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="primary" size="sm" icon={pinging ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Wifi className="w-3.5 h-3.5" />} onClick={handlePing} disabled={!ip || pinging}>
          {pinging ? 'PINGING...' : 'TEST CONNECTION'}
        </Button>
        <Button variant="secondary" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={downloadRdp} disabled={!ip}>
          DOWNLOAD RDP
        </Button>
        <Button variant="ghost" size="sm" icon={copied ? <CheckCircle2 className="w-3.5 h-3.5 text-terminal-green" /> : <Copy className="w-3.5 h-3.5" />} onClick={copySsh} disabled={!ip}>
          COPY SSH CMD
        </Button>
      </div>

      <AnimatePresence>
        {pingResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border border-terminal-border rounded-lg p-4 bg-terminal-card-2"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {pingResult.alive
                  ? <CheckCircle2 className="w-4 h-4 text-terminal-green" />
                  : <WifiOff className="w-4 h-4 text-terminal-red" />
                }
                <span className="font-mono font-bold text-sm text-white">{pingResult.ip}</span>
                {pingResult.hostname && <span className="text-xs text-slate-400 font-mono">({pingResult.hostname})</span>}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={pingResult.alive ? 'success' : 'error'} size="sm" dot>
                  {pingResult.alive ? `Online · ${pingResult.latency}ms` : 'Offline'}
                </Badge>
              </div>
            </div>
            {pingResult.alive && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  {(() => {
                    const Icon = OS_ICON[pingResult.osHint] || Server
                    return <><Icon className="w-3.5 h-3.5" /> {pingResult.osHint}</>
                  })()}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {pingResult.openPorts.map(p => (
                    <span key={p.port} className="text-xs font-mono bg-terminal-green/10 text-terminal-green border border-terminal-green/20 rounded px-2 py-0.5">
                      {p.port}/{p.service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Network Scanner ───────────────────────────────────────────────────────────
function NetworkScanner() {
  const addToast = useToastStore((s) => s.addToast)
  const [subnet, setSubnet] = useState('192.168.1')
  const [startOctet, setStartOctet] = useState('1')
  const [endOctet, setEndOctet] = useState('50')
  const [scanning, setScanning] = useState(false)
  const [results, setResults] = useState<{ devices: ScanDevice[]; total: number; found: number } | null>(null)
  const [connectModal, setConnectModal] = useState<ScanDevice | null>(null)

  async function handleScan() {
    setScanning(true)
    setResults(null)
    try {
      const res = await fetch('/api/network/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subnet, startOctet: parseInt(startOctet), endOctet: parseInt(endOctet) }),
      })
      const data = await res.json()
      if (res.ok) {
        setResults(data)
        addToast({ type: 'success', title: 'Scan complete', message: `${data.found} of ${data.total} hosts online` })
      } else {
        addToast({ type: 'error', title: 'Scan failed', message: data.error })
      }
    } catch {
      addToast({ type: 'error', title: 'Network error', message: 'Could not reach server' })
    } finally {
      setScanning(false)
    }
  }

  const OS_ICON: Record<string, any> = { Windows: Monitor, 'Linux / macOS': Laptop, 'Web / IoT': Globe }

  return (
    <div className="stat-card space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Search className="w-4 h-4 text-terminal-cyan" />
        <h2 className="font-mono font-bold text-white text-sm">NETWORK SCANNER</h2>
        <span className="text-xs text-slate-500 font-mono ml-auto">max 100 IPs per scan</span>
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">SUBNET</label>
          <input className="input-field font-mono w-40" placeholder="192.168.1" value={subnet} onChange={e => setSubnet(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">FROM</label>
          <input className="input-field font-mono w-20" placeholder="1" value={startOctet} onChange={e => setStartOctet(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">TO</label>
          <input className="input-field font-mono w-20" placeholder="50" value={endOctet} onChange={e => setEndOctet(e.target.value)} />
        </div>
        <span className="text-xs text-slate-500 font-mono pb-2">
          → {subnet}.{startOctet} – {subnet}.{endOctet}
        </span>
        <Button
          variant="primary"
          size="sm"
          icon={scanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
          onClick={handleScan}
          disabled={scanning}
        >
          {scanning ? 'SCANNING...' : 'SCAN NETWORK'}
        </Button>
      </div>

      {scanning && (
        <div className="flex items-center gap-3 text-sm font-mono text-slate-400 py-4">
          <Loader2 className="w-4 h-4 animate-spin text-terminal-green" />
          Probing {subnet}.{startOctet}–{subnet}.{endOctet} for live hosts on ports 22, 80, 135, 445, 3389…
        </div>
      )}

      {results && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Shield className="w-3.5 h-3.5" />
            Scanned {results.total} IPs — <span className="text-terminal-green font-bold">{results.found} online</span>
          </div>

          {results.found === 0 ? (
            <div className="text-center py-8 text-slate-500 font-mono text-sm">
              <WifiOff className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No live hosts found in this range.
            </div>
          ) : (
            <div className="overflow-auto rounded-lg border border-terminal-border">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-terminal-border bg-terminal-card-2">
                    <th className="text-left px-3 py-2 text-slate-400">IP</th>
                    <th className="text-left px-3 py-2 text-slate-400">HOSTNAME</th>
                    <th className="text-left px-3 py-2 text-slate-400">OS</th>
                    <th className="text-left px-3 py-2 text-slate-400">OPEN PORTS</th>
                    <th className="text-right px-3 py-2 text-slate-400">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {results.devices.map((device) => {
                    const Icon = OS_ICON[device.osHint] || Server
                    return (
                      <tr key={device.ip} className="border-b border-terminal-border/50 hover:bg-terminal-card-2/50 transition-colors">
                        <td className="px-3 py-2.5 text-terminal-green font-bold">{device.ip}</td>
                        <td className="px-3 py-2.5 text-slate-300">{device.hostname || <span className="text-slate-600">—</span>}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-1.5 text-slate-400">
                            <Icon className="w-3.5 h-3.5" />
                            {device.osHint}
                          </div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1">
                            {device.openPorts.map(p => (
                              <span key={p} className="bg-terminal-cyan/10 text-terminal-cyan border border-terminal-cyan/20 rounded px-1.5 py-0.5 text-[10px]">{p}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <button
                            onClick={() => setConnectModal(device)}
                            className="text-xs font-mono px-2.5 py-1 rounded bg-terminal-green/10 text-terminal-green border border-terminal-green/20 hover:bg-terminal-green/20 transition-all"
                          >
                            CONNECT
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}

      {/* Connect Modal */}
      <AnimatePresence>
        {connectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-terminal-card border border-terminal-border rounded-xl p-6 w-full max-w-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-mono font-bold text-white">CONNECT TO DEVICE</h3>
                  <p className="text-xs text-terminal-green font-mono">{connectModal.ip}</p>
                </div>
                <button onClick={() => setConnectModal(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ConnectActions ip={connectModal.ip} name={connectModal.hostname?.split('.')[0] || connectModal.ip} openPorts={connectModal.openPorts} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Connect Actions (shared) ──────────────────────────────────────────────────
function ConnectActions({ ip, name, openPorts }: { ip: string; name: string; openPorts: number[] }) {
  const addToast = useToastStore((s) => s.addToast)
  const [username, setUsername] = useState('')
  const [rdpPort, setRdpPort] = useState('3389')
  const [copied, setCopied] = useState('')

  function downloadRdp() {
    const params = new URLSearchParams({ ip, name, port: rdpPort, username })
    window.open(`/api/network/rdp?${params}`, '_blank')
    addToast({ type: 'success', title: 'RDP file downloaded', message: `${name}.rdp` })
  }

  function copyCmd(cmd: string, label: string) {
    navigator.clipboard.writeText(cmd)
    setCopied(label)
    setTimeout(() => setCopied(''), 2000)
    addToast({ type: 'info', title: 'Copied to clipboard', message: cmd })
  }

  const hasRdp = openPorts.includes(3389)
  const hasSsh = openPorts.includes(22)

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">USERNAME</label>
          <input className="input-field text-xs font-mono" placeholder="administrator" value={username} onChange={e => setUsername(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1">RDP PORT</label>
          <input className="input-field text-xs font-mono" placeholder="3389" value={rdpPort} onChange={e => setRdpPort(e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={downloadRdp}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-terminal-green/10 border border-terminal-green/30 hover:bg-terminal-green/20 transition-all text-left"
        >
          <Download className="w-4 h-4 text-terminal-green shrink-0" />
          <div>
            <div className="text-xs font-mono font-bold text-terminal-green">DOWNLOAD RDP FILE</div>
            <div className="text-[10px] text-slate-500">Open with Windows Remote Desktop</div>
          </div>
          {!hasRdp && <AlertCircle className="w-3 h-3 text-yellow-500 ml-auto" />}
        </button>

        <button
          onClick={() => copyCmd(`ssh ${username ? username + '@' : ''}${ip}`, 'ssh')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-terminal-cyan/10 border border-terminal-cyan/30 hover:bg-terminal-cyan/20 transition-all text-left"
        >
          {copied === 'ssh' ? <CheckCircle2 className="w-4 h-4 text-terminal-green shrink-0" /> : <Terminal className="w-4 h-4 text-terminal-cyan shrink-0" />}
          <div>
            <div className="text-xs font-mono font-bold text-terminal-cyan">COPY SSH COMMAND</div>
            <div className="text-[10px] text-slate-500 font-mono">ssh {username ? username + '@' : ''}{ip}</div>
          </div>
          {!hasSsh && <AlertCircle className="w-3 h-3 text-yellow-500 ml-auto" />}
        </button>

        <button
          onClick={() => copyCmd(`mstsc /v:${ip}:${rdpPort}`, 'mstsc')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg bg-slate-800/60 border border-terminal-border hover:border-terminal-border-active transition-all text-left"
        >
          {copied === 'mstsc' ? <CheckCircle2 className="w-4 h-4 text-terminal-green shrink-0" /> : <Monitor className="w-4 h-4 text-slate-400 shrink-0" />}
          <div>
            <div className="text-xs font-mono font-bold text-slate-300">COPY MSTSC COMMAND</div>
            <div className="text-[10px] text-slate-500 font-mono">mstsc /v:{ip}:{rdpPort}</div>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function NetworkPage() {
  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white font-mono">NETWORK TOOLS <span className="text-terminal-green">_</span></h1>
        <p className="text-sm text-slate-400 mt-0.5">Connect to PCs, scan the LAN, generate RDP files</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-6">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <QuickConnect />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <NetworkScanner />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="terminal-window"
      >
        <div className="terminal-titlebar">
          <div className="terminal-dot bg-red-500" />
          <div className="terminal-dot bg-yellow-500" />
          <div className="terminal-dot bg-green-500" />
          <span className="text-slate-400 text-xs font-mono ml-2">HOW TO CONNECT</span>
        </div>
        <div className="p-4 font-mono text-xs space-y-1.5 text-terminal-green">
          <p className="text-slate-500"># RDP (Remote Desktop) — Windows only</p>
          <p>&gt; Enter IP → Download RDP file → Double-click to open Remote Desktop</p>
          <p>&gt; Or run: <span className="text-white">mstsc /v:192.168.1.100</span></p>
          <p className="text-slate-500 mt-2"># SSH — Linux / macOS / Windows (OpenSSH)</p>
          <p>&gt; Copy SSH command → Paste in terminal: <span className="text-white">ssh admin@192.168.1.100</span></p>
          <p className="text-slate-500 mt-2"># Network Scanner — find all online devices on your LAN</p>
          <p>&gt; Enter subnet (e.g. 192.168.1) + range → Scan → Click CONNECT on any result</p>
          <p className="text-slate-500 mt-2"># Note: Scanner runs server-side. Server must be on same network as target devices.</p>
        </div>
      </motion.div>
    </div>
  )
}
