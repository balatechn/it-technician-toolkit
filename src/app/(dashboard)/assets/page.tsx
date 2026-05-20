'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Package, Plus, Search, Edit2, Trash2, Monitor, Laptop, Server, Printer, Network } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useToastStore } from '@/lib/store'
import { getStatusBg, formatDate } from '@/lib/utils'
import type { Asset } from '@/lib/db'

const TYPE_ICONS: Record<string, any> = { desktop: Monitor, laptop: Laptop, server: Server, printer: Printer, network: Network, other: Package }

const STATUS_OPTIONS = ['active', 'maintenance', 'retired', 'storage']
const TYPE_OPTIONS = ['desktop', 'laptop', 'server', 'printer', 'network', 'other']

function AssetModal({ asset, onClose, onSave }: { asset: Partial<Asset> | null; onClose: () => void; onSave: (data: any) => void }) {
  const [form, setForm] = useState({
    name: asset?.name || '', type: asset?.type || 'desktop', serial: asset?.serial || '',
    model: asset?.model || '', assignedTo: asset?.assignedTo || '', location: asset?.location || '',
    status: asset?.status || 'active', os: asset?.os || '', notes: asset?.notes || '',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-terminal-card border border-terminal-border rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold font-mono text-white mb-4">{asset?.id ? 'EDIT ASSET' : 'ADD ASSET'}</h2>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'name', label: 'Device Name', full: false },
            { key: 'serial', label: 'Serial Number', full: false },
            { key: 'model', label: 'Model', full: false },
            { key: 'assignedTo', label: 'Assigned To', full: false },
            { key: 'location', label: 'Location', full: true },
            { key: 'os', label: 'Operating System', full: true },
            { key: 'notes', label: 'Notes', full: true },
          ].map((f) => (
            <div key={f.key} className={f.full ? 'col-span-2' : ''}>
              <label className="block text-xs font-mono text-slate-400 mb-1">{f.label.toUpperCase()}</label>
              <input
                className="input-field"
                value={(form as any)[f.key]}
                onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">TYPE</label>
            <select className="input-field" value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as any }))}>
              {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">STATUS</label>
            <select className="input-field" value={form.status} onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as any }))}>
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave(form)}>Save Asset</Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function AssetsPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [assets, setAssets] = useState<Asset[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<{ open: boolean; asset: Partial<Asset> | null }>({ open: false, asset: null })

  const fetchAssets = useCallback(async () => {
    setLoading(true)
    const res = await fetch('/api/assets')
    const data = await res.json()
    setAssets(data.assets || [])
    setLoading(false)
  }, [])

  useEffect(() => { fetchAssets() }, [fetchAssets])

  const filtered = assets.filter((a) => {
    const m = !search || [a.name, a.model, a.assignedTo, a.location, a.serial].some(v => v?.toLowerCase().includes(search.toLowerCase()))
    const s = statusFilter === 'all' || a.status === statusFilter
    return m && s
  })

  async function handleSave(data: any) {
    const method = modal.asset?.id ? 'PUT' : 'POST'
    const url = modal.asset?.id ? `/api/assets?id=${modal.asset.id}` : '/api/assets'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) {
      addToast({ type: 'success', title: modal.asset?.id ? 'Asset updated' : 'Asset added', message: data.name })
      fetchAssets()
      setModal({ open: false, asset: null })
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete ${name}?`)) return
    await fetch(`/api/assets?id=${id}`, { method: 'DELETE' })
    addToast({ type: 'warning', title: 'Asset removed', message: name })
    fetchAssets()
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">ASSET TRACKER <span className="text-terminal-green">_</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">{assets.length} devices registered</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModal({ open: true, asset: null })}>
          ADD ASSET
        </Button>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search devices, models, users..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
        </div>
        <div className="flex items-center gap-2">
          {['all', ...STATUS_OPTIONS].map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all capitalize ${statusFilter === s ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30' : 'text-slate-400 border-terminal-border hover:border-terminal-border-active'}`}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((asset, i) => {
          const Icon = TYPE_ICONS[asset.type] || Package
          return (
            <motion.div key={asset.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="stat-card flex flex-col gap-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-terminal-card-2 border border-terminal-border flex items-center justify-center">
                    <Icon className="w-5 h-5 text-terminal-cyan" />
                  </div>
                  <div>
                    <h3 className="font-mono font-bold text-white text-sm">{asset.name}</h3>
                    <p className="text-xs text-slate-400">{asset.model}</p>
                  </div>
                </div>
                <Badge variant={asset.status === 'active' ? 'success' : asset.status === 'maintenance' ? 'warning' : asset.status === 'retired' ? 'error' : 'default'} size="sm" dot>
                  {asset.status}
                </Badge>
              </div>

              <div className="space-y-1.5">
                {[
                  { label: 'Serial', value: asset.serial },
                  { label: 'Assigned', value: asset.assignedTo },
                  { label: 'Location', value: asset.location },
                  { label: 'OS', value: asset.os },
                ].map(f => f.value && (
                  <div key={f.label} className="flex justify-between text-xs font-mono">
                    <span className="text-slate-500">{f.label}:</span>
                    <span className="text-slate-300 truncate ml-2">{f.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-terminal-border">
                <span className="text-xs text-slate-600 font-mono">{formatDate(asset.createdAt)}</span>
                <div className="flex items-center gap-1">
                  <button onClick={() => setModal({ open: true, asset })} className="p-1.5 rounded text-slate-500 hover:text-terminal-cyan hover:bg-terminal-cyan/10 transition-all">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(asset.id, asset.name)} className="p-1.5 rounded text-slate-500 hover:text-terminal-red hover:bg-terminal-red/10 transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {modal.open && <AssetModal asset={modal.asset} onClose={() => setModal({ open: false, asset: null })} onSave={handleSave} />}
    </div>
  )
}
