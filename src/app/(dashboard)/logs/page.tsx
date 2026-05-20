'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ScrollText, Search, Download, Trash2, Filter, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { formatDate, getStatusBg } from '@/lib/utils'
import { useToastStore } from '@/lib/store'
import type { RepairLog } from '@/lib/db'

export default function LogsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [logs, setLogs] = useState<RepairLog[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/logs')
      const data = await res.json()
      setLogs(data.logs || [])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const filtered = logs.filter((l) => {
    const matchSearch = !search ||
      l.toolName.toLowerCase().includes(search.toLowerCase()) ||
      l.command.toLowerCase().includes(search.toLowerCase()) ||
      l.device?.toLowerCase().includes(search.toLowerCase()) ||
      l.technician?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || l.status === statusFilter
    return matchSearch && matchStatus
  })

  async function clearLogs() {
    if (!confirm('Clear all repair logs?')) return
    await fetch('/api/logs', { method: 'DELETE' })
    setLogs([])
    addToast({ type: 'info', title: 'Logs cleared', message: 'All repair logs have been removed.' })
  }

  function exportTXT() {
    const lines = [
      'IT REPAIR TOOLKIT - REPAIR LOGS EXPORT',
      `Exported: ${new Date().toLocaleString()}`,
      `Total Entries: ${filtered.length}`,
      '═'.repeat(60),
      '',
      ...filtered.map((l) => [
        `Tool:       ${l.toolName}`,
        `Command:    ${l.command}`,
        `Status:     ${l.status.toUpperCase()}`,
        `Device:     ${l.device || 'N/A'}`,
        `Technician: ${l.technician}`,
        `Duration:   ${(l.duration / 1000).toFixed(1)}s`,
        `Date:       ${formatDate(l.createdAt)}`,
        l.notes ? `Notes:      ${l.notes}` : '',
        '─'.repeat(60),
      ].filter(Boolean).join('\n')),
    ].join('\n')

    const blob = new Blob([lines], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `repair-logs-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
    addToast({ type: 'success', title: 'Logs exported', message: `${filtered.length} entries saved as TXT.` })
  }

  async function exportPDF() {
    try {
      const { jsPDF } = await import('jspdf')
      const autoTable = (await import('jspdf-autotable')).default

      const doc = new jsPDF({ orientation: 'landscape' })
      doc.setFont('courier', 'normal')
      doc.setFontSize(16)
      doc.text('IT REPAIR TOOLKIT - REPAIR LOGS', 14, 16)
      doc.setFontSize(10)
      doc.text(`Exported: ${new Date().toLocaleString()} | Total: ${filtered.length} entries`, 14, 24)

      autoTable(doc, {
        head: [['Tool', 'Command', 'Status', 'Device', 'Technician', 'Duration', 'Date']],
        body: filtered.map((l) => [
          l.toolName,
          l.command.substring(0, 40) + (l.command.length > 40 ? '...' : ''),
          l.status.toUpperCase(),
          l.device || 'N/A',
          l.technician,
          `${(l.duration / 1000).toFixed(1)}s`,
          formatDate(l.createdAt),
        ]),
        startY: 30,
        styles: { font: 'courier', fontSize: 8 },
        headStyles: { fillColor: [0, 20, 10], textColor: [0, 255, 136] },
        alternateRowStyles: { fillColor: [15, 17, 23] },
      })

      doc.save(`repair-logs-${Date.now()}.pdf`)
      addToast({ type: 'success', title: 'PDF exported', message: `${filtered.length} entries saved.` })
    } catch {
      addToast({ type: 'error', title: 'Export failed', message: 'Could not generate PDF.' })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">REPAIR LOGS <span className="text-terminal-green">_</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">{logs.length} total entries · {filtered.length} shown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" icon={<RefreshCw className="w-3 h-3" />} onClick={fetchLogs} loading={loading}>REFRESH</Button>
          <Button variant="secondary" size="sm" icon={<Download className="w-3 h-3" />} onClick={exportTXT}>EXPORT TXT</Button>
          <Button variant="secondary" size="sm" icon={<Download className="w-3 h-3" />} onClick={exportPDF}>EXPORT PDF</Button>
          <Button variant="danger" size="sm" icon={<Trash2 className="w-3 h-3" />} onClick={clearLogs}>CLEAR</Button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by tool, command, device, technician..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {['all', 'success', 'failed', 'warning'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all capitalize ${
                statusFilter === s
                  ? s === 'all' ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30'
                  : s === 'success' ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30'
                  : s === 'failed' ? 'bg-terminal-red/10 text-terminal-red border-terminal-red/30'
                  : 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30'
                  : 'text-slate-400 border-terminal-border hover:border-terminal-border-active'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Successful', count: logs.filter(l => l.status === 'success').length, color: 'text-terminal-green', bg: 'bg-terminal-green/5 border-terminal-green/20' },
          { label: 'Failed', count: logs.filter(l => l.status === 'failed').length, color: 'text-terminal-red', bg: 'bg-terminal-red/5 border-terminal-red/20' },
          { label: 'Warnings', count: logs.filter(l => l.status === 'warning').length, color: 'text-terminal-yellow', bg: 'bg-terminal-yellow/5 border-terminal-yellow/20' },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs text-slate-400 font-mono">{s.label.toUpperCase()}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden p-0">
        <div className="p-4 border-b border-terminal-border flex items-center gap-2">
          <ScrollText className="w-4 h-4 text-slate-500" />
          <h3 className="text-sm font-semibold font-mono text-white">Command History</h3>
        </div>
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-slate-500 font-mono">
              <ScrollText className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{loading ? 'Loading logs...' : logs.length === 0 ? 'No logs yet. Run a repair tool to see logs here.' : 'No logs match your filter.'}</p>
            </div>
          ) : (
            <table className="w-full data-table">
              <thead>
                <tr>
                  <th className="text-left">Tool</th>
                  <th className="text-left hidden md:table-cell">Command</th>
                  <th className="text-center">Status</th>
                  <th className="text-left hidden lg:table-cell">Device</th>
                  <th className="text-left hidden xl:table-cell">Technician</th>
                  <th className="text-right hidden lg:table-cell">Duration</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td className="font-semibold text-white">{log.toolName}</td>
                    <td className="hidden md:table-cell">
                      <code className="text-xs text-terminal-cyan font-mono">{log.command.substring(0, 45)}{log.command.length > 45 ? '…' : ''}</code>
                    </td>
                    <td className="text-center">
                      <Badge
                        variant={log.status === 'success' ? 'success' : log.status === 'failed' ? 'error' : 'warning'}
                        size="sm"
                        dot
                      >
                        {log.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="hidden lg:table-cell text-slate-400 font-mono text-xs">{log.device || 'N/A'}</td>
                    <td className="hidden xl:table-cell text-slate-400 font-mono text-xs">{log.technician}</td>
                    <td className="hidden lg:table-cell text-right text-slate-400 font-mono text-xs">{(log.duration / 1000).toFixed(1)}s</td>
                    <td className="text-right text-slate-500 font-mono text-xs">{formatDate(log.createdAt)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  )
}
