import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ── Theme Store ──────────────────────────────────────────────────────────────
interface ThemeStore {
  theme: 'dark' | 'light'
  toggleTheme: () => void
  setTheme: (t: 'dark' | 'light') => void
}
export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      setTheme: (t) => set({ theme: t }),
    }),
    { name: 'it-toolkit-theme' }
  )
)

// ── Toast Store ───────────────────────────────────────────────────────────────
export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}
interface ToastStore {
  toasts: Toast[]
  addToast: (t: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}
export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((toast) => toast.id !== id) }))
    }, t.duration ?? 4000)
  },
  removeToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}))

// ── Auth Store ────────────────────────────────────────────────────────────────
interface AuthStore {
  user: { username: string; role: string } | null
  setUser: (u: { username: string; role: string } | null) => void
}
export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
    }),
    { name: 'it-toolkit-auth' }
  )
)

// ── Running Commands Store ────────────────────────────────────────────────────
interface RunningCommand {
  toolId: string
  toolName: string
  status: 'queued' | 'running' | 'completed' | 'failed'
  progress: number
  startedAt: number
}
interface CommandStore {
  running: Record<string, RunningCommand>
  queue: string[]
  setRunning: (toolId: string, data: Partial<RunningCommand>) => void
  clearRunning: (toolId: string) => void
  addToQueue: (toolId: string) => void
  removeFromQueue: (toolId: string) => void
}
export const useCommandStore = create<CommandStore>((set) => ({
  running: {},
  queue: [],
  setRunning: (toolId, data) =>
    set((s) => ({
      running: {
        ...s.running,
        [toolId]: Object.assign({ toolId, toolName: '', status: 'queued' as const, progress: 0, startedAt: Date.now() }, s.running[toolId], data),
      },
    })),
  clearRunning: (toolId) =>
    set((s) => {
      const next = { ...s.running }
      delete next[toolId]
      return { running: next }
    }),
  addToQueue: (toolId) => set((s) => ({ queue: [...s.queue, toolId] })),
  removeFromQueue: (toolId) => set((s) => ({ queue: s.queue.filter((id) => id !== toolId) })),
}))

// ── Sidebar Store ─────────────────────────────────────────────────────────────
interface SidebarStore {
  collapsed: boolean
  mobileOpen: boolean
  toggle: () => void
  setMobileOpen: (v: boolean) => void
}
export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set) => ({
      collapsed: false,
      mobileOpen: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
      setMobileOpen: (v) => set({ mobileOpen: v }),
    }),
    { name: 'it-toolkit-sidebar' }
  )
)
