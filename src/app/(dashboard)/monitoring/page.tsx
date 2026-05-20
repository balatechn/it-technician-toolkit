'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Activity, Cpu, MemoryStick, HardDrive, Wifi, Server, RefreshCw, Globe } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

function randBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min)
}

function useLiveMetric(base: number, variance: number, interval = 2000) {
  const [value, setValue] = useState(base)
  const [history, setHistory] = useState(() => Array.from({ length: 30 }, (_, i) => ({ t: i, v: randBetween(base - variance, base + variance) })))

  useEffect(() => {
    const timer = setInterval(() => {
      const newVal = Math.min(99, Math.max(1, value + randBetween(-variance / 2, variance / 2)))
      setValue(newVal)
      setHistory((prev) => [...prev.slice(1), { t: prev[prev.length - 1].t + 1, v: newVal }])
    }, interval)
    return () => clearInterval(timer)
  }, [value, variance, interval])

  return { value, history }
}

function MetricGauge({ label, value, color, icon: Icon, unit = '%' }: { label: string; value: number; color: string; icon: any; unit?: string }) {
  const danger = value > 85
  const warning = value > 65 && !danger

  return (
    <Card className={danger ? 'border-terminal-red/30' : warning ? 'border-terminal-yellow/30' : ''}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={`w-4 h-4 ${color}`} />
          <span className="text-xs font-mono text-slate-400 uppercase">{label}</span>
        </div>
        <Badge
          variant={danger ? 'error' : warning ? 'warning' : 'success'}
          size="sm"
          dot
        >
          {danger ? 'HIGH' : warning ? 'MEDIUM' : 'NORMAL'}
        </Badge>
      </div>
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-4xl font-bold font-mono ${color}`}>{value}</span>
        <span className="text-lg text-slate-500 font-mono mb-1">{unit}</span>
      </div>
      <div className="progress-bar-track">
        <motion.div
          className="h-full rounded-full transition-all duration-500"
          animate={{ width: `${value}%` }}
          style={{
            background: danger ? 'linear-gradient(90deg, #ff4757, #ff4757aa)' :
              warning ? 'linear-gradient(90deg, #ffd700, #ffd700aa)' :
              `linear-gradient(90deg, ${color.replace('text-', '').replace('terminal-', '')}, transparent)`,
            boxShadow: `0 0 8px ${danger ? 'rgba(255,71,87,0.5)' : warning ? 'rgba(255,215,0,0.5)' : 'rgba(0,255,136,0.5)'}`,
          }}
        />
      </div>
    </Card>
  )
}

const PROCESS_TABLE = [
  { name: 'System', pid: 4, cpu: 0.1, mem: 0.3, status: 'Running' },
  { name: 'svchost.exe', pid: 1284, cpu: 2.4, mem: 1.2, status: 'Running' },
  { name: 'explorer.exe', pid: 5892, cpu: 0.8, mem: 3.4, status: 'Running' },
  { name: 'chrome.exe', pid: 9248, cpu: 12.3, mem: 18.7, status: 'Running' },
  { name: 'MsMpEng.exe', pid: 2884, cpu: 1.1, mem: 2.8, status: 'Running' },
  { name: 'Teams.exe', pid: 7832, cpu: 5.6, mem: 12.4, status: 'Running' },
  { name: 'OneDrive.exe', pid: 8124, cpu: 0.3, mem: 4.1, status: 'Running' },
]

export default function MonitoringPage() {
  const cpu = useLiveMetric(35, 20)
  const ram = useLiveMetric(62, 12)
  const disk = useLiveMetric(67, 5, 5000)
  const net = useLiveMetric(25, 40, 1500)

  const [pingHistory, setPingHistory] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({ t: i, ping: randBetween(8, 35) }))
  )
  const [currentPing, setCurrentPing] = useState(12)

  useEffect(() => {
    const t = setInterval(() => {
      const p = randBetween(6, 45)
      setCurrentPing(p)
      setPingHistory((prev) => [...prev.slice(1), { t: prev[prev.length - 1].t + 1, ping: p }])
    }, 1500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">LIVE MONITORING <span className="text-terminal-green">_</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">Real-time system performance metrics</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-terminal-green">
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-terminal-green"
          />
          LIVE · UPDATING
        </div>
      </motion.div>

      {/* Gauges */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricGauge label="CPU Usage" value={cpu.value} color="text-terminal-green" icon={Cpu} />
        <MetricGauge label="RAM Usage" value={ram.value} color="text-terminal-cyan" icon={MemoryStick} />
        <MetricGauge label="Disk I/O" value={disk.value} color="text-terminal-yellow" icon={HardDrive} />
        <MetricGauge label="Network" value={net.value} color="text-terminal-purple" icon={Wifi} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* CPU + RAM Combined Chart */}
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>CPU & RAM History (30s)</CardTitle>
            <div className="flex gap-3 text-xs font-mono">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-terminal-green rounded-full" />CPU</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-terminal-cyan rounded-full" />RAM</span>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={cpu.history.map((d, i) => ({ ...d, ram: ram.history[i]?.v }))}>
              <defs>
                <linearGradient id="gcpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gram" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#4a5568', fontSize: 10 }} width={32} />
              <Tooltip
                contentStyle={{ background: '#13161e', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
                labelStyle={{ display: 'none' }}
                formatter={(v: number, n: string) => [`${v}%`, n.toUpperCase()]}
              />
              <Area type="monotone" dataKey="v" name="cpu" stroke="#00ff88" strokeWidth={2} fill="url(#gcpu)" dot={false} />
              <Area type="monotone" dataKey="ram" name="ram" stroke="#00d4ff" strokeWidth={2} fill="url(#gram)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        {/* Ping Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Network Latency</CardTitle>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-terminal-green">{currentPing}</span>
              <span className="text-sm text-slate-500 font-mono">ms</span>
            </div>
          </CardHeader>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={pingHistory}>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis domain={[0, 80]} tick={{ fill: '#4a5568', fontSize: 10 }} width={28} />
              <Tooltip
                contentStyle={{ background: '#13161e', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, fontSize: 11, fontFamily: 'monospace' }}
                labelStyle={{ display: 'none' }}
                formatter={(v: number) => [`${v}ms`, 'PING']}
              />
              <Line type="monotone" dataKey="ping" stroke="#00d4ff" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>

          <div className="mt-3 pt-3 border-t border-terminal-border space-y-1.5">
            {[
              { label: '8.8.8.8 (Google)', ping: randBetween(8, 20), ok: true },
              { label: 'corp.local (DC)', ping: randBetween(1, 5), ok: true },
              { label: 'azure.microsoft.com', ping: randBetween(20, 45), ok: true },
            ].map((host) => (
              <div key={host.label} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${host.ok ? 'bg-terminal-green' : 'bg-terminal-red'}`} />
                  <span className="text-slate-400 truncate">{host.label}</span>
                </div>
                <span className="text-terminal-cyan">{host.ping}ms</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Process table */}
      <Card>
        <CardHeader>
          <CardTitle>Top Processes</CardTitle>
          <Badge variant="info" dot>LIVE</Badge>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr>
                <th className="text-left">Process</th>
                <th className="text-right">PID</th>
                <th className="text-right">CPU%</th>
                <th className="text-right">MEM%</th>
                <th className="text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {PROCESS_TABLE.map((p) => (
                <tr key={p.pid}>
                  <td className="font-mono text-slate-300">{p.name}</td>
                  <td className="text-right font-mono text-slate-500">{p.pid}</td>
                  <td className={`text-right font-mono ${p.cpu > 10 ? 'text-terminal-yellow' : 'text-terminal-green'}`}>{p.cpu.toFixed(1)}%</td>
                  <td className={`text-right font-mono ${p.mem > 15 ? 'text-terminal-yellow' : 'text-slate-400'}`}>{p.mem.toFixed(1)}%</td>
                  <td className="text-center"><Badge variant="success" size="sm" dot>Running</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
