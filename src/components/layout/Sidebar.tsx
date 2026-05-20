'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Wrench, Activity, ScrollText, Package,
  Ticket, Settings, StickyNote, BotMessageSquare, ChevronLeft,
  ChevronRight, Terminal, LogOut, Shield, X, Network
} from 'lucide-react'
import { useSidebarStore, useAuthStore, useToastStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/repair', icon: Wrench, label: 'Repair Toolkit' },
  { href: '/monitoring', icon: Activity, label: 'Live Monitoring' },
  { href: '/logs', icon: ScrollText, label: 'Repair Logs' },
  { href: '/assets', icon: Package, label: 'Asset Tracker' },
  { href: '/network', icon: Network, label: 'Network Tools' },
  { href: '/tickets', icon: Ticket, label: 'Tickets' },
  { href: '/notes', icon: StickyNote, label: 'Tech Notes' },
  { href: '/ai-assistant', icon: BotMessageSquare, label: 'AI Assistant' },
  { href: '/settings', icon: Settings, label: 'Settings' },
]

function NavItem({ item, collapsed }: { item: typeof NAV_ITEMS[0]; collapsed: boolean }) {
  const pathname = usePathname()
  const active = pathname === item.href
  const Icon = item.icon
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  return (
    <Link
      href={item.href}
      onClick={() => setMobileOpen(false)}
      className={cn('sidebar-item flex items-center gap-3 px-3 py-2.5 mx-2 rounded-lg text-sm font-mono', active && 'active')}
    >
      <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-terminal-green' : 'text-slate-500')} />
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            className={cn('truncate whitespace-nowrap overflow-hidden', active ? 'text-terminal-green' : 'text-slate-400')}
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function SidebarContent({ collapsed }: { collapsed: boolean }) {
  const router = useRouter()
  const setUser = useAuthStore((s) => s.setUser)
  const addToast = useToastStore((s) => s.addToast)
  const user = useAuthStore((s) => s.user)
  const toggle = useSidebarStore((s) => s.toggle)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    addToast({ type: 'info', title: 'Logged out', message: 'Session terminated.' })
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-4 py-4 border-b border-terminal-border', collapsed ? 'justify-center' : '')}>
        <div className="w-8 h-8 rounded-lg bg-terminal-green/15 border border-terminal-green/30 flex items-center justify-center shrink-0">
          <Terminal className="w-4 h-4 text-terminal-green" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: 'auto' }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="font-mono font-bold text-white text-sm whitespace-nowrap">IT TOOLKIT</div>
              <div className="text-xs text-slate-500 font-mono whitespace-nowrap">v2.0 ENTERPRISE</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      {/* User / Logout */}
      <div className="border-t border-terminal-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-2 mb-2 rounded-lg bg-terminal-green/5 border border-terminal-border">
            <Shield className="w-4 h-4 text-terminal-green shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-mono font-semibold text-white truncate">{user?.username || 'admin'}</div>
              <div className="text-xs text-slate-500 font-mono capitalize">{user?.role || 'admin'}</div>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={cn(
            'sidebar-item flex items-center gap-3 px-3 py-2 mx-0 rounded-lg text-sm font-mono w-full text-slate-400 hover:text-terminal-red',
            collapsed ? 'justify-center' : ''
          )}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse button - desktop only */}
      <button
        onClick={toggle}
        className="hidden lg:flex absolute -right-3 top-16 w-6 h-6 bg-terminal-card border border-terminal-border rounded-full items-center justify-center text-slate-500 hover:text-terminal-green hover:border-terminal-border-active transition-all z-10"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </div>
  )
}

export function Sidebar() {
  const collapsed = useSidebarStore((s) => s.collapsed)
  const mobileOpen = useSidebarStore((s) => s.mobileOpen)
  const setMobileOpen = useSidebarStore((s) => s.setMobileOpen)

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col h-screen sticky top-0 bg-terminal-bg-2 border-r border-terminal-border relative shrink-0 transition-all duration-300',
          collapsed ? 'w-[68px]' : 'w-[240px]'
        )}
      >
        <SidebarContent collapsed={collapsed} />
      </aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 w-[240px] bg-terminal-bg-2 border-r border-terminal-border z-50 flex flex-col"
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-terminal-border">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-terminal-green" />
                  <span className="font-mono font-bold text-white text-sm">IT TOOLKIT</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="text-slate-500 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent collapsed={false} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
