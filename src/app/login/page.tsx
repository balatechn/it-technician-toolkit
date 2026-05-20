'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, Terminal, Eye, EyeOff, Loader2, AlertCircle, Lock, User } from 'lucide-react'
import { useAuthStore } from '@/lib/store'

const BOOT_LINES = [
  '> Initializing IT Repair Toolkit v2.0...',
  '> Loading system diagnostics module...',
  '> Establishing secure connection...',
  '> Loading repair database...',
  '> Verifying admin credentials...',
  '> System ready. Authentication required.',
]

export default function LoginPage() {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bootLines, setBootLines] = useState<string[]>([])
  const [bootDone, setBootDone] = useState(false)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) {
        setBootLines((prev) => [...prev, BOOT_LINES[i]])
        i++
      } else {
        clearInterval(interval)
        setTimeout(() => setBootDone(true), 400)
      }
    }, 280)
    return () => clearInterval(interval)
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!username || !password) {
      setError('Username and password are required.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })
      const data = await res.json()
      if (res.ok) {
        setUser({ username: data.username, role: data.role })
        router.push('/dashboard')
      } else {
        setError(data.error || 'Invalid credentials.')
      }
    } catch {
      setError('Connection failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0b0d] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid opacity-60" />

      {/* Animated glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-terminal-green/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-terminal-cyan/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-terminal-green/10 border border-terminal-green/30 mb-4 glow-green">
            <Shield className="w-8 h-8 text-terminal-green" />
          </div>
          <h1 className="text-2xl font-bold text-white font-mono">IT REPAIR TOOLKIT</h1>
          <p className="text-slate-400 text-sm mt-1 font-mono">Enterprise Admin Dashboard v2.0</p>
        </motion.div>

        {/* Boot terminal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="terminal-window mb-6"
        >
          <div className="terminal-titlebar">
            <div className="terminal-dot bg-red-500" />
            <div className="terminal-dot bg-yellow-500" />
            <div className="terminal-dot bg-green-500" />
            <span className="text-slate-400 text-xs font-mono ml-2">SYSTEM BOOT — cmd.exe</span>
          </div>
          <div className="p-4 font-mono text-xs space-y-1 min-h-[120px]">
            <AnimatePresence>
              {bootLines.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-terminal-green"
                >
                  {line}
                </motion.div>
              ))}
            </AnimatePresence>
            {!bootDone && (
              <span className="text-terminal-green">
                <span className="terminal-cursor" />
              </span>
            )}
          </div>
        </motion.div>

        {/* Login Form */}
        <AnimatePresence>
          {bootDone && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="glass rounded-xl p-6 border border-terminal-green/20"
            >
              <div className="flex items-center gap-2 mb-6">
                <Lock className="w-4 h-4 text-terminal-green" />
                <span className="text-sm font-mono text-slate-400">AUTHENTICATION REQUIRED</span>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2 bg-terminal-red/10 border border-terminal-red/30 rounded-lg p-3 mb-4 text-terminal-red text-sm"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="font-mono">{error}</span>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">USERNAME</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className="input-field pl-9 font-mono"
                      autoComplete="username"
                      autoFocus
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-400 mb-1.5">PASSWORD</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="input-field pl-9 pr-10 font-mono"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-terminal-green text-black font-bold font-mono py-2.5 px-4 rounded-lg hover:bg-terminal-green-dim transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed mt-2 glow-green"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      AUTHENTICATING...
                    </>
                  ) : (
                    <>
                      <Terminal className="w-4 h-4" />
                      ACCESS SYSTEM
                    </>
                  )}
                </button>
              </form>

              <p className="text-center text-xs font-mono text-slate-600 mt-4">
                Default: admin / Admin@2024!
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center mt-6 text-xs font-mono text-slate-600"
        >
          IT REPAIR TOOLKIT © 2024 · SECURE · ENTERPRISE EDITION
        </motion.div>
      </div>
    </div>
  )
}
