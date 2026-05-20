'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Search, Filter, CheckCircle2, Wrench } from 'lucide-react'
import { REPAIR_TOOLS, CATEGORIES } from '@/lib/commands'
import { RepairCard } from '@/components/repair/RepairCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToastStore } from '@/lib/store'

export default function RepairPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('all')
  const addToast = useToastStore((s) => s.addToast)

  const filtered = REPAIR_TOOLS.filter((t) => {
    const matchSearch = !search ||
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
    const matchCat = category === 'all' || t.category === category
    return matchSearch && matchCat
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-xl font-bold text-white font-mono">
            REPAIR TOOLKIT <span className="text-terminal-green">_</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {REPAIR_TOOLS.length} tools available · Click RUN to execute
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="info" dot>{filtered.length} tools shown</Badge>
        </div>
      </motion.div>

      {/* Search + Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tools, commands, tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <button
            onClick={() => setCategory('all')}
            className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${category === 'all' ? 'bg-terminal-green/10 text-terminal-green border-terminal-green/30' : 'text-slate-400 border-terminal-border hover:border-terminal-border-active'}`}
          >
            ALL
          </button>
          {Object.entries(CATEGORIES).map(([key, val]) => (
            <button
              key={key}
              onClick={() => setCategory(key)}
              className={`text-xs font-mono px-3 py-1.5 rounded-lg border transition-all ${category === key ? `${val.color} bg-white/5 border-current` : 'text-slate-400 border-terminal-border hover:border-terminal-border-active'}`}
            >
              {val.label.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Info banner */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex items-start gap-3 p-4 rounded-xl bg-terminal-cyan/5 border border-terminal-cyan/20"
      >
        <CheckCircle2 className="w-4 h-4 text-terminal-cyan mt-0.5 shrink-0" />
        <div className="text-xs font-mono text-slate-400 leading-relaxed">
          <span className="text-terminal-cyan font-semibold">SIMULATION MODE:</span> All commands are simulated with realistic output.
          In a production deployment, these would execute via an elevated Windows service agent.
          Logs are saved after each run.
        </div>
      </motion.div>

      {/* Tool grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 font-mono">
          <Wrench className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p>No tools found matching &quot;{search}&quot;</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((tool, i) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <RepairCard tool={tool} />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
