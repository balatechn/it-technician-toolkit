'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Plus, Search, Edit2, Trash2, ChevronDown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToastStore } from '@/lib/store'
import { formatDate, getStatusBg } from '@/lib/utils'
import type { Ticket as TicketType } from '@/lib/db'

const PRIORITY_ORDER = { critical: 0, high: 1, medium: 2, low: 3 }

function TicketModal({ ticket, onClose, onSave }: { ticket: Partial<TicketType> | null; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    title: ticket?.title || '', description: ticket?.description || '',
    priority: ticket?.priority || 'medium', status: ticket?.status || 'open',
    assignedTo: ticket?.assignedTo || 'admin', reportedBy: ticket?.reportedBy || '',
    device: ticket?.device || '', category: ticket?.category || 'General',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-terminal-card border border-terminal-border rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold font-mono text-white mb-4">{ticket?.id ? 'EDIT TICKET' : 'NEW TICKET'}</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">TITLE</label>
            <input className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-mono text-slate-400 mb-1">DESCRIPTION</label>
            <textarea rows={3} className="input-field resize-none" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          </div>
          {[
            { key: 'reportedBy', label: 'Reported By' }, { key: 'device', label: 'Device' },
            { key: 'category', label: 'Category' }, { key: 'assignedTo', label: 'Assigned To' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs font-mono text-slate-400 mb-1">{f.label.toUpperCase()}</label>
              <input className="input-field" value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
            </div>
          ))}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PRIORITY</label>
            <select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}>
              {['low', 'medium', 'high', 'critical'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">STATUS</label>
            <select className="input-field" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value as any }))}>
              {['open', 'in-progress', 'resolved', 'closed'].map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)}>Save Ticket</Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function TicketsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [tickets, setTickets] = useState<TicketType[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [modal, setModal] = useState<{ open: boolean; ticket: Partial<TicketType> | null }>({ open: false, ticket: null })

  const fetchTickets = useCallback(async () => {
    const res = await fetch('/api/tickets')
    const data = await res.json()
    setTickets(data.tickets || [])
  }, [])

  useEffect(() => { fetchTickets() }, [fetchTickets])

  const filtered = tickets
    .filter(t => {
      const m = !search || [t.title, t.description, t.reportedBy, t.device, t.category].some(v => v?.toLowerCase().includes(search.toLowerCase()))
      const s = statusFilter === 'all' || t.status === statusFilter
      return m && s
    })
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])

  async function handleSave(data: any) {
    const method = modal.ticket?.id ? 'PUT' : 'POST'
    const url = modal.ticket?.id ? `/api/tickets?id=${modal.ticket.id}` : '/api/tickets'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) {
      addToast({ type: 'success', title: modal.ticket?.id ? 'Ticket updated' : 'Ticket created', message: data.title })
      fetchTickets()
      setModal({ open: false, ticket: null })
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete ticket: ${title}?`)) return
    await fetch(`/api/tickets?id=${id}`, { method: 'DELETE' })
    addToast({ type: 'warning', title: 'Ticket deleted', message: title })
    fetchTickets()
  }

  const stats = {
    open: tickets.filter(t => t.status === 'open').length,
    inProgress: tickets.filter(t => t.status === 'in-progress').length,
    resolved: tickets.filter(t => t.status === 'resolved').length,
    critical: tickets.filter(t => t.priority === 'critical').length,
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">SUPPORT TICKETS <span className="text-terminal-green">_</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">{tickets.length} total · {stats.open} open · {stats.critical} critical</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModal({ open: true, ticket: null })}>
          NEW TICKET
        </Button>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Open', count: stats.open, color: 'text-terminal-cyan', bg: 'bg-terminal-cyan/5 border-terminal-cyan/20' },
          { label: 'In Progress', count: stats.inProgress, color: 'text-terminal-yellow', bg: 'bg-terminal-yellow/5 border-terminal-yellow/20' },
          { label: 'Resolved', count: stats.resolved, color: 'text-terminal-green', bg: 'bg-terminal-green/5 border-terminal-green/20' },
          { label: 'Critical', count: stats.critical, color: 'text-terminal-red', bg: 'bg-terminal-red/5 border-terminal-red/20' },
        ].map(s => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
            <p className="text-xs text-slate-400 font-mono">{s.label.toUpperCase()}</p>
            <p className={`text-2xl font-bold font-mono mt-1 ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['all', 'open', 'in-progress', 'resolved', 'closed'].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${statusFilter === s ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30' : 'text-slate-400 border-terminal-border hover:border-terminal-border-active'}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Ticket list */}
      <div className="space-y-3">
        {filtered.map((ticket, i) => (
          <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className="stat-card flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                {ticket.priority === 'critical' && <AlertTriangle className="w-3.5 h-3.5 text-terminal-red shrink-0" />}
                <h3 className="font-semibold text-white text-sm">{ticket.title}</h3>
                <Badge variant={ticket.status === 'open' ? 'info' : ticket.status === 'in-progress' ? 'warning' : ticket.status === 'resolved' ? 'success' : 'default'} size="sm">
                  {ticket.status.toUpperCase()}
                </Badge>
                <Badge variant={ticket.priority === 'critical' ? 'error' : ticket.priority === 'high' ? 'error' : ticket.priority === 'medium' ? 'warning' : 'success'} size="sm">
                  {ticket.priority.toUpperCase()}
                </Badge>
              </div>
              <p className="text-xs text-slate-400 truncate mb-2">{ticket.description}</p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500 flex-wrap">
                <span>By: {ticket.reportedBy}</span>
                {ticket.device && <span>Device: {ticket.device}</span>}
                <span>Category: {ticket.category}</span>
                <span>{formatDate(ticket.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => setModal({ open: true, ticket })} className="p-2 rounded text-slate-500 hover:text-terminal-cyan hover:bg-terminal-cyan/10 transition-all">
                <Edit2 className="w-4 h-4" />
              </button>
              <button onClick={() => handleDelete(ticket.id, ticket.title)} className="p-2 rounded text-slate-500 hover:text-terminal-red hover:bg-terminal-red/10 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500 font-mono">
            <Ticket className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No tickets found.</p>
          </div>
        )}
      </div>

      {modal.open && <TicketModal ticket={modal.ticket} onClose={() => setModal({ open: false, ticket: null })} onSave={handleSave} />}
    </div>
  )
}
