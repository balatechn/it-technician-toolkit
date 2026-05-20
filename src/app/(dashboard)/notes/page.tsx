'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { StickyNote, Plus, Search, Edit2, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToastStore } from '@/lib/store'
import { formatDate } from '@/lib/utils'
import type { TechNote } from '@/lib/db'

function NoteModal({ note, onClose, onSave }: { note: Partial<TechNote> | null; onClose: () => void; onSave: (d: any) => void }) {
  const [form, setForm] = useState({
    title: note?.title || '',
    content: note?.content || '',
    tags: note?.tags?.join(', ') || '',
    priority: note?.priority || 'medium',
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-terminal-card border border-terminal-border rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-lg font-bold font-mono text-white mb-4">{note?.id ? 'EDIT NOTE' : 'NEW NOTE'}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">TITLE</label>
            <input className="input-field" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">CONTENT</label>
            <textarea rows={6} className="input-field resize-none font-mono text-xs" value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">TAGS (comma-separated)</label>
            <input className="input-field" placeholder="network, repair, windows" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">PRIORITY</label>
            <select className="input-field" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value as any }))}>
              {['low', 'medium', 'high'].map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-5">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={() => onSave({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) })}>Save Note</Button>
        </div>
      </motion.div>
    </div>
  )
}

export default function NotesPage() {
  const addToast = useToastStore((s) => s.addToast)
  const [notes, setNotes] = useState<TechNote[]>([])
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ open: boolean; note: Partial<TechNote> | null }>({ open: false, note: null })

  const fetchNotes = useCallback(async () => {
    const res = await fetch('/api/notes')
    const data = await res.json()
    setNotes(data.notes || [])
  }, [])

  useEffect(() => { fetchNotes() }, [fetchNotes])

  const filtered = notes.filter(n =>
    !search || n.title.toLowerCase().includes(search.toLowerCase()) ||
    n.content.toLowerCase().includes(search.toLowerCase()) ||
    n.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  async function handleSave(data: any) {
    const method = modal.note?.id ? 'PUT' : 'POST'
    const url = modal.note?.id ? `/api/notes?id=${modal.note.id}` : '/api/notes'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    if (res.ok) {
      addToast({ type: 'success', title: modal.note?.id ? 'Note updated' : 'Note saved', message: data.title })
      fetchNotes()
      setModal({ open: false, note: null })
    }
  }

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete note: ${title}?`)) return
    await fetch(`/api/notes?id=${id}`, { method: 'DELETE' })
    addToast({ type: 'warning', title: 'Note deleted' })
    fetchNotes()
  }

  const PRIORITY_COLORS: Record<string, string> = {
    high: 'border-l-terminal-red',
    medium: 'border-l-terminal-yellow',
    low: 'border-l-terminal-green',
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white font-mono">TECH NOTES <span className="text-terminal-green">_</span></h1>
          <p className="text-sm text-slate-400 mt-0.5">{notes.length} notes saved</p>
        </div>
        <Button variant="primary" size="sm" icon={<Plus className="w-3.5 h-3.5" />} onClick={() => setModal({ open: true, note: null })}>
          NEW NOTE
        </Button>
      </motion.div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" placeholder="Search notes..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-mono">
          <StickyNote className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>{notes.length === 0 ? 'No notes yet. Create your first technician note.' : 'No notes match your search.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((note, i) => (
            <motion.div key={note.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className={`stat-card flex flex-col gap-3 border-l-4 ${PRIORITY_COLORS[note.priority]}`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-white text-sm leading-snug">{note.title}</h3>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setModal({ open: true, note })} className="p-1 rounded text-slate-600 hover:text-terminal-cyan transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(note.id, note.title)} className="p-1 rounded text-slate-600 hover:text-terminal-red transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-mono leading-relaxed line-clamp-4 whitespace-pre-wrap">{note.content}</p>
              {note.tags.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Tag className="w-3 h-3 text-slate-600" />
                  {note.tags.map(tag => (
                    <Badge key={tag} variant="info" size="sm">{tag}</Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-600 font-mono">{formatDate(note.updatedAt)}</p>
            </motion.div>
          ))}
        </div>
      )}

      {modal.open && <NoteModal note={modal.note} onClose={() => setModal({ open: false, note: null })} onSave={handleSave} />}
    </div>
  )
}
