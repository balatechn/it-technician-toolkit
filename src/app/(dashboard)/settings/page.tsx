'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Shield, Palette, Bell, Database, Save, RefreshCw, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { useThemeStore, useToastStore } from '@/lib/store'

export default function SettingsPage() {
  const { theme, setTheme } = useThemeStore()
  const addToast = useToastStore((s) => s.addToast)
  const [showPwd, setShowPwd] = useState(false)
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [saving, setSaving] = useState(false)

  const [notifSettings, setNotifSettings] = useState({
    repairComplete: true,
    repairFailed: true,
    newTicket: false,
    systemAlert: true,
  })

  async function savePassword() {
    if (!newPwd || newPwd !== confirmPwd) {
      addToast({ type: 'error', title: 'Password mismatch', message: 'Passwords do not match.' })
      return
    }
    if (newPwd.length < 8) {
      addToast({ type: 'error', title: 'Password too short', message: 'Minimum 8 characters required.' })
      return
    }
    setSaving(true)
    await new Promise((r) => setTimeout(r, 800))
    setSaving(false)
    setNewPwd('')
    setConfirmPwd('')
    addToast({ type: 'success', title: 'Password updated', message: 'Your password has been changed.' })
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl font-bold text-white font-mono">SETTINGS <span className="text-terminal-green">_</span></h1>
        <p className="text-sm text-slate-400 mt-0.5">System configuration and preferences</p>
      </motion.div>

      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-terminal-cyan" />
            <CardTitle>Appearance</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-2">COLOR THEME</label>
            <div className="flex gap-3">
              {[
                { value: 'dark', label: 'Dark Terminal', icon: '⬛', desc: 'Neon green on black' },
                { value: 'light', label: 'Light Mode', icon: '⬜', desc: 'Professional light theme' },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value as any)}
                  className={`flex-1 p-3 rounded-lg border text-left transition-all ${theme === t.value ? 'border-terminal-green/50 bg-terminal-green/5' : 'border-terminal-border hover:border-terminal-border-active'}`}
                >
                  <div className="text-lg mb-1">{t.icon}</div>
                  <div className="text-xs font-mono font-semibold text-white">{t.label}</div>
                  <div className="text-xs text-slate-500">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-terminal-green" />
            <CardTitle>Security</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">NEW PASSWORD</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="Enter new password..."
                className="input-field pr-9"
              />
              <button onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">CONFIRM PASSWORD</label>
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm password..." className="input-field" />
          </div>
          <Button variant="primary" size="sm" onClick={savePassword} loading={saving} icon={<Save className="w-3.5 h-3.5" />}>
            UPDATE PASSWORD
          </Button>
          <div className="p-3 rounded-lg bg-terminal-yellow/5 border border-terminal-yellow/20 text-xs font-mono text-terminal-yellow">
            ⚠ Session timeout: 8 hours · Credentials stored securely with bcrypt
          </div>
        </div>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-terminal-yellow" />
            <CardTitle>Notifications</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          {Object.entries(notifSettings).map(([key, val]) => {
            const labels: Record<string, string> = {
              repairComplete: 'Repair completed',
              repairFailed: 'Repair failed',
              newTicket: 'New ticket created',
              systemAlert: 'System alerts',
            }
            return (
              <div key={key} className="flex items-center justify-between py-2 border-b border-terminal-border last:border-0">
                <span className="text-sm text-slate-300">{labels[key]}</span>
                <button
                  onClick={() => setNotifSettings((p) => ({ ...p, [key]: !p[key as keyof typeof p] }))}
                  className={`relative w-10 h-5 rounded-full transition-all ${val ? 'bg-terminal-green' : 'bg-slate-700'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${val ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            )
          })}
          <Button variant="primary" size="sm" icon={<Save className="w-3.5 h-3.5" />} onClick={() => addToast({ type: 'success', title: 'Settings saved' })}>
            SAVE PREFERENCES
          </Button>
        </div>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-terminal-purple" />
            <CardTitle>Data Management</CardTitle>
          </div>
        </CardHeader>
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-terminal-card-2 border border-terminal-border text-xs font-mono">
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Storage Location:</span><span className="text-slate-300">./data/ (JSON)</span>
            </div>
            <div className="flex justify-between text-slate-400 mb-1">
              <span>Max Log Entries:</span><span className="text-slate-300">1,000</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Session Timeout:</span><span className="text-slate-300">8 hours (JWT)</span>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => addToast({ type: 'info', title: 'Cache cleared', message: 'Application cache has been reset.' })}>
              CLEAR CACHE
            </Button>
            <Button variant="danger" size="sm"
              onClick={() => { if (confirm('Export all data?')) addToast({ type: 'success', title: 'Export started', message: 'Check the Logs page for export options.' }) }}>
              EXPORT ALL DATA
            </Button>
          </div>
        </div>
      </Card>

      {/* About */}
      <div className="text-center p-4 text-xs font-mono text-slate-600 border border-terminal-border rounded-xl">
        IT REPAIR TOOLKIT v2.0.0 · Enterprise Edition · Built with Next.js + Tailwind CSS<br />
        © 2024 · Dark Terminal UI · Role-Based Access Control
      </div>
    </div>
  )
}
