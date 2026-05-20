import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { formatDistanceToNow, format } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

export function timeAgo(date: string | Date) {
  return formatDistanceToNow(new Date(date), { addSuffix: true })
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function generateSysInfo() {
  return {
    hostname: 'WORKSTATION-' + Math.floor(Math.random() * 90 + 10),
    os: 'Windows 10 Enterprise',
    version: '10.0.19045.4291',
    cpu: 'Intel Core i7-10700 @ 2.90GHz',
    cores: 8,
    ram: '32 GB',
    disk: '512 GB NVMe SSD',
    ip: `192.168.1.${Math.floor(Math.random() * 200 + 50)}`,
    uptime: `${Math.floor(Math.random() * 10 + 1)}d ${Math.floor(Math.random() * 23)}h`,
    domain: 'corp.local',
    lastBoot: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
  }
}

export function getStatusColor(status: string) {
  const map: Record<string, string> = {
    success: 'text-terminal-green',
    active: 'text-terminal-green',
    resolved: 'text-terminal-green',
    failed: 'text-terminal-red',
    error: 'text-terminal-red',
    critical: 'text-terminal-red',
    retired: 'text-terminal-red',
    warning: 'text-terminal-yellow',
    maintenance: 'text-terminal-yellow',
    'in-progress': 'text-terminal-yellow',
    info: 'text-terminal-cyan',
    open: 'text-terminal-cyan',
    medium: 'text-terminal-yellow',
    high: 'text-terminal-orange',
    low: 'text-terminal-green',
    storage: 'text-slate-400',
    closed: 'text-slate-400',
  }
  return map[status] ?? 'text-slate-400'
}

export function getStatusBg(status: string) {
  const map: Record<string, string> = {
    success: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
    active: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
    resolved: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
    failed: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
    error: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
    critical: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
    retired: 'bg-terminal-red/10 text-terminal-red border-terminal-red/30',
    warning: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
    maintenance: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
    'in-progress': 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
    high: 'bg-terminal-orange/10 text-terminal-orange border-terminal-orange/30',
    open: 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30',
    info: 'bg-terminal-cyan/10 text-terminal-cyan border-terminal-cyan/30',
    low: 'bg-terminal-green/10 text-terminal-green border-terminal-green/30',
    medium: 'bg-terminal-yellow/10 text-terminal-yellow border-terminal-yellow/30',
    storage: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
    closed: 'bg-slate-500/10 text-slate-400 border-slate-500/30',
  }
  return map[status] ?? 'bg-slate-500/10 text-slate-400 border-slate-500/30'
}
