'use client'

import { usePathname } from 'next/navigation'
import { Moon, Sun, Menu, Bell, Wifi, WifiOff } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useThemeStore, useSidebarStore, useToastStore } from '@/lib/store'

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/repair': 'Repair Toolkit',
  '/monitoring': 'Live Monitoring',
  '/logs': 'Repair Logs',
  '/assets': 'Asset Tracker',
  '/tickets': 'Support Tickets',
  '/notes': 'Technician Notes',
  '/ai-assistant': 'AI Assistant',
  '/settings': 'Settings',
}

export function Header() {
  const pathname = usePathname()
  const { theme, toggleTheme } = useThemeStore()
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)
  const addToast = useToastStore((s) => s.addToast)
  const [online, setOnline] = useState(true)
  const [time, setTime] = useState('')

  useEffect(() => {
    setOnline(navigator.onLine)
    const onOnline = () => { setOnline(true); addToast({ type: 'success', title: 'Network Connected', message: 'Internet connectivity restored.' }) }
    const onOffline = () => { setOnline(false); addToast({ type: 'error', title: 'Network Lost', message: 'Internet connectivity lost.' }) }
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => { window.removeEventListener('online', onOnline); window.removeEventListener('offline', onOffline) }
  }, [addToast])

  useEffect(() => {
    function tick() {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const title = PAGE_TITLES[pathname] || 'IT Toolkit'

  return (
    <header className="h-[60px] bg-terminal-bg-2/80 backdrop-blur-md border-b border-terminal-border flex items-center justify-between px-4 shrink-0 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page title */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-mono text-sm hidden sm:block">C:\IT-TOOLKIT\</span>
          <span className="font-mono font-semibold text-terminal-green text-sm">{title}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Clock */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-lg bg-terminal-green/5 border border-terminal-border">
          <span className="font-mono text-xs text-terminal-green">{time || '00:00:00'}</span>
        </div>

        {/* Network status */}
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono ${online ? 'bg-terminal-green/5 border-terminal-green/20 text-terminal-green' : 'bg-terminal-red/5 border-terminal-red/20 text-terminal-red'}`}>
          {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          <span className="hidden sm:block">{online ? 'ONLINE' : 'OFFLINE'}</span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-400 hover:text-terminal-yellow hover:bg-terminal-yellow/5 transition-all border border-transparent hover:border-terminal-yellow/20"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Notifications bell */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-terminal-red rounded-full" />
        </button>
      </div>
    </header>
  )
}
