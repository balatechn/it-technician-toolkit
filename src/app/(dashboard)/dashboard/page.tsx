'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Shield, Activity, CheckCircle2, AlertTriangle, HardDrive, Wifi,
  Cpu, MemoryStick, Server, Clock, TrendingUp, Wrench, ScrollText,
  Package, Ticket, RefreshCw, ChevronRight
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import Link from 'next/link'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatDate, getStatusBg } from '@/lib/utils'

function generateChartData() {
  return Array.from({ length: 20 }, (_, i) => ({
    t: i,
    cpu: Math.floor(Math.random() * 40 + 20),
    ram: Math.floor(Math.random() * 30 + 45),
    net: Math.floor(Math.random() * 60 + 10),
  }))
}

const QUICK_STATS = [
  { label: 'System Health', value: '94%', trend: '+2%', icon: Shield, color: 'text-terminal-green', bg: 'bg-terminal-green/10 border-terminal-green/20' },
  { label: 'Active Assets', value: '47', trend: '+3 this week', icon: Package, color: 'text-terminal-cyan', bg: 'bg-terminal-cyan/10 border-terminal-cyan/20' },
  { label: 'Open Tickets', value: '12', trend: '3 critical', icon: Ticket, color: 'text-terminal-yellow', bg: 'bg-terminal-yellow/10 border-terminal-yellow/20' },
  { label: 'Repairs Today', value: '8', trend: '2 pending', icon: Wrench, color: 'text-terminal-purple', bg: 'bg-terminal-purple/10 border-terminal-purple/20' },
]

const RECENT_REPAIRS = [
  { tool: 'SFC Scan', device: 'WORKSTATION-14', status: 'success', time: '2 min ago' },
  { tool: 'DNS Flush', device: 'LAPTOP-HR-03', status: 'success', time: '15 min ago' },
  { tool: 'DISM Repair', device: 'SERVER-DC-01', status: 'warning', time: '1h ago' },
  { tool: 'Disk Check', device: 'WORKSTATION-07', status: 'failed', time: '2h ago' },
  { tool: 'Temp Cleaner', device: 'LAPTOP-DEV-11', status: 'success', time: '3h ago' },
]

const SYS_INFO = {
  hostname: 'WORKSTATION-ADMIN',
  os: 'Windows 10 Enterprise',
  cpu: 'Intel Core i7-10700 @ 2.90GHz',
  ram: '32 GB DDR4',
  disk: '512 GB NVMe SSD (67% used)',
  ip: '192.168.1.42',
  uptime: '4d 12h 33m',
  domain: 'corp.local',
}

export default function DashboardPage() {
  const [chartData, setChartData] = useState(generateChartData())
  const [cpuUsage, setCpuUsage] = useState(34)
  const [ramUsage, setRamUsage] = useState(62)
  const [diskUsage, setDiskUsage] = useState(67)
  const [recentLogs, setRecentLogs] = useState<any[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      const cpu = Math.floor(Math.random() * 45 + 15)
      const ram = Math.floor(Math.random() * 25 + 50)
      setCpuUsage(cpu)
      setRamUsage(ram)
      setChartData((prev) => [
        ...prev.slice(1),
        { t: prev[prev.length - 1].t + 1, cpu, ram, net: Math.floor(Math.random() * 60 + 10) },
      ])
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    fetch('/api/logs?limit=5').then(r => r.json()).then(d => setRecentLogs(d.logs || []))
  }, [])

  return (
    <div className="space-y-6">
      {/* Welcome bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            SYSTEM OVERVIEW <span className="text-terminal-green animate-cursor-blink">_</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terminal-green/10 border border-terminal-green/20 text-xs font-mono text-terminal-green">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ALL SYSTEMS OPERATIONAL
          </div>
        </div>
      </motion.div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_STATS.map((stat, i) => {
          const Icon = stat.icon
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`stat-card border ${stat.bg}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-mono mb-1">{stat.label.toUpperCase()}</p>
                  <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-slate-500 mt-1">{stat.trend}</p>
                </div>
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${stat.bg}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts + System Info */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Live Chart */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Live System Metrics</CardTitle>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-green inline-block" />CPU</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-cyan inline-block" />RAM</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-terminal-yellow inline-block" />NET</span>
              </div>
            </CardHeader>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="cpu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="ram" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd700" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ffd700" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="t" hide />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fill: '#4a5568', fontSize: 11 }} width={36} />
                <Tooltip
                  contentStyle={{ background: '#13161e', border: '1px solid rgba(0,255,136,0.2)', borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}
                  labelStyle={{ display: 'none' }}
                  formatter={(v: number, name: string) => [`${v}%`, name.toUpperCase()]}
                />
                <Area type="monotone" dataKey="cpu" stroke="#00ff88" strokeWidth={2} fill="url(#cpu)" dot={false} />
                <Area type="monotone" dataKey="ram" stroke="#00d4ff" strokeWidth={2} fill="url(#ram)" dot={false} />
                <Area type="monotone" dataKey="net" stroke="#ffd700" strokeWidth={1.5} fill="url(#net)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>

            {/* Usage bars */}
            <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-terminal-border">
              {[
                { label: 'CPU', value: cpuUsage, color: '#00ff88' },
                { label: 'RAM', value: ramUsage, color: '#00d4ff' },
                { label: 'DISK', value: diskUsage, color: '#ffd700' },
              ].map((m) => (
                <div key={m.label}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-mono text-slate-400">{m.label}</span>
                    <span className="text-xs font-mono" style={{ color: m.color }}>{m.value}%</span>
                  </div>
                  <div className="progress-bar-track">
                    <motion.div
                      className="progress-bar-fill"
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 0.8 }}
                      style={{ background: `linear-gradient(90deg, ${m.color}, ${m.color}aa)` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* System Info */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <Server className="w-4 h-4 text-slate-500" />
            </CardHeader>
            <div className="space-y-2">
              {Object.entries(SYS_INFO).map(([k, v]) => (
                <div key={k} className="flex items-start justify-between gap-2 py-1.5 border-b border-terminal-border last:border-0">
                  <span className="text-xs font-mono text-slate-500 uppercase shrink-0">{k}</span>
                  <span className="text-xs font-mono text-slate-300 text-right">{v}</span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Recent Repairs + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Repairs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
          <Card>
            <CardHeader>
              <CardTitle>Recent Repairs</CardTitle>
              <Link href="/logs" className="text-xs text-terminal-green font-mono hover:underline flex items-center gap-1">
                View All <ChevronRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <div className="space-y-2">
              {RECENT_REPAIRS.map((r, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-terminal-border last:border-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${r.status === 'success' ? 'bg-terminal-green' : r.status === 'warning' ? 'bg-terminal-yellow' : 'bg-terminal-red'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-white truncate">{r.tool}</p>
                    <p className="text-xs text-slate-500 font-mono">{r.device}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <Badge variant={r.status === 'success' ? 'success' : r.status === 'warning' ? 'warning' : 'error'} size="sm">
                      {r.status.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-slate-600 font-mono mt-0.5">{r.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <Wrench className="w-4 h-4 text-slate-500" />
            </CardHeader>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/repair', icon: Wrench, label: 'Open Repair Toolkit', color: 'terminal-green' },
                { href: '/monitoring', icon: Activity, label: 'Live Monitoring', color: 'terminal-cyan' },
                { href: '/tickets', icon: Ticket, label: 'New Ticket', color: 'terminal-yellow' },
                { href: '/assets', icon: Package, label: 'Asset Tracker', color: 'terminal-purple' },
                { href: '/logs', icon: ScrollText, label: 'View Logs', color: 'terminal-orange' },
                { href: '/ai-assistant', icon: TrendingUp, label: 'AI Assistant', color: 'terminal-red' },
              ].map((a) => {
                const Icon = a.icon
                return (
                  <Link
                    key={a.href}
                    href={a.href}
                    className="flex items-center gap-2.5 p-3 rounded-lg bg-terminal-card-2 border border-terminal-border hover:border-terminal-border-active hover:bg-white/5 transition-all group"
                  >
                    <Icon className={`w-4 h-4 text-${a.color} shrink-0`} />
                    <span className="text-xs font-mono text-slate-300 group-hover:text-white transition-colors">{a.label}</span>
                  </Link>
                )
              })}
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
