import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const DATA_DIR = process.env.DATA_DIR || './data'

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function getFilePath(name: string) {
  return path.join(DATA_DIR, `${name}.json`)
}

function readFile<T>(name: string, defaultData: T[]): T[] {
  ensureDataDir()
  const fp = getFilePath(name)
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, JSON.stringify(defaultData, null, 2))
    return defaultData
  }
  const raw = fs.readFileSync(fp, 'utf-8')
  return JSON.parse(raw)
}

function writeFile<T>(name: string, data: T[]): void {
  ensureDataDir()
  fs.writeFileSync(getFilePath(name), JSON.stringify(data, null, 2))
}

// ── Repair Logs ──────────────────────────────────────────────────────────────
export interface RepairLog {
  id: string
  toolId: string
  toolName: string
  command: string
  status: 'success' | 'failed' | 'warning'
  duration: number
  technician: string
  device: string
  notes?: string
  createdAt: string
}

export const logsDb = {
  getAll(): RepairLog[] {
    return readFile<RepairLog>('logs', [])
  },
  add(data: Omit<RepairLog, 'id' | 'createdAt'>): RepairLog {
    const logs = logsDb.getAll()
    const entry: RepairLog = { ...data, id: uuidv4(), createdAt: new Date().toISOString() }
    logs.unshift(entry)
    writeFile('logs', logs.slice(0, 1000)) // keep last 1000
    return entry
  },
  delete(id: string): void {
    const logs = logsDb.getAll().filter(l => l.id !== id)
    writeFile('logs', logs)
  },
  clear(): void {
    writeFile('logs', [])
  }
}

// ── Technician Notes ──────────────────────────────────────────────────────────
export interface TechNote {
  id: string
  title: string
  content: string
  tags: string[]
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

export const notesDb = {
  getAll(): TechNote[] {
    return readFile<TechNote>('notes', [])
  },
  add(data: Omit<TechNote, 'id' | 'createdAt' | 'updatedAt'>): TechNote {
    const notes = notesDb.getAll()
    const now = new Date().toISOString()
    const entry: TechNote = { ...data, id: uuidv4(), createdAt: now, updatedAt: now }
    notes.unshift(entry)
    writeFile('notes', notes)
    return entry
  },
  update(id: string, data: Partial<TechNote>): TechNote | null {
    const notes = notesDb.getAll()
    const idx = notes.findIndex(n => n.id === id)
    if (idx === -1) return null
    notes[idx] = { ...notes[idx], ...data, updatedAt: new Date().toISOString() }
    writeFile('notes', notes)
    return notes[idx]
  },
  delete(id: string): void {
    writeFile('notes', notesDb.getAll().filter(n => n.id !== id))
  }
}

// ── Assets ────────────────────────────────────────────────────────────────────
export interface Asset {
  id: string
  name: string
  type: 'desktop' | 'laptop' | 'server' | 'printer' | 'network' | 'other'
  serial: string
  model: string
  assignedTo: string
  location: string
  status: 'active' | 'maintenance' | 'retired' | 'storage'
  os?: string
  lastSeen?: string
  notes?: string
  createdAt: string
}

const defaultAssets: Asset[] = [
  { id: uuidv4(), name: 'WORKSTATION-01', type: 'desktop', serial: 'SN-20241001', model: 'Dell OptiPlex 7090', assignedTo: 'John Smith', location: 'Floor 2 - Desk 14', status: 'active', os: 'Windows 11 Pro', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'LAPTOP-HR-05', type: 'laptop', serial: 'SN-20241002', model: 'HP EliteBook 845', assignedTo: 'Sarah Connor', location: 'HR Department', status: 'active', os: 'Windows 11 Pro', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'SERVER-DC-01', type: 'server', serial: 'SN-20241003', model: 'Dell PowerEdge R750', assignedTo: 'IT Department', location: 'Server Room A', status: 'active', os: 'Windows Server 2022', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
  { id: uuidv4(), name: 'LAPTOP-DEV-12', type: 'laptop', serial: 'SN-20241004', model: 'Lenovo ThinkPad X1', assignedTo: 'Mike Chen', location: 'Dev Lab', status: 'maintenance', os: 'Windows 11 Pro', lastSeen: new Date().toISOString(), createdAt: new Date().toISOString() },
]

export const assetsDb = {
  getAll(): Asset[] {
    return readFile<Asset>('assets', defaultAssets)
  },
  add(data: Omit<Asset, 'id' | 'createdAt'>): Asset {
    const assets = assetsDb.getAll()
    const entry: Asset = { ...data, id: uuidv4(), createdAt: new Date().toISOString() }
    assets.unshift(entry)
    writeFile('assets', assets)
    return entry
  },
  update(id: string, data: Partial<Asset>): Asset | null {
    const assets = assetsDb.getAll()
    const idx = assets.findIndex(a => a.id === id)
    if (idx === -1) return null
    assets[idx] = { ...assets[idx], ...data }
    writeFile('assets', assets)
    return assets[idx]
  },
  delete(id: string): void {
    writeFile('assets', assetsDb.getAll().filter(a => a.id !== id))
  }
}

// ── Tickets ───────────────────────────────────────────────────────────────────
export interface Ticket {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in-progress' | 'resolved' | 'closed'
  assignedTo: string
  reportedBy: string
  device?: string
  category: string
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

const defaultTickets: Ticket[] = [
  { id: uuidv4(), title: 'Blue screen on WORKSTATION-01', description: 'User reports BSOD on startup, error code 0x0000007E', priority: 'high', status: 'open', assignedTo: 'admin', reportedBy: 'John Smith', device: 'WORKSTATION-01', category: 'Hardware', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Slow internet on HR floor', description: 'Multiple users reporting very slow internet speeds', priority: 'medium', status: 'in-progress', assignedTo: 'admin', reportedBy: 'Sarah Connor', category: 'Network', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: uuidv4(), title: 'Printer offline - Conference Room B', description: 'HP LaserJet is showing offline status', priority: 'low', status: 'open', assignedTo: 'admin', reportedBy: 'IT Help Desk', category: 'Printer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

export const ticketsDb = {
  getAll(): Ticket[] {
    return readFile<Ticket>('tickets', defaultTickets)
  },
  add(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket {
    const tickets = ticketsDb.getAll()
    const now = new Date().toISOString()
    const entry: Ticket = { ...data, id: uuidv4(), createdAt: now, updatedAt: now }
    tickets.unshift(entry)
    writeFile('tickets', tickets)
    return entry
  },
  update(id: string, data: Partial<Ticket>): Ticket | null {
    const tickets = ticketsDb.getAll()
    const idx = tickets.findIndex(t => t.id === id)
    if (idx === -1) return null
    tickets[idx] = { ...tickets[idx], ...data, updatedAt: new Date().toISOString() }
    writeFile('tickets', tickets)
    return tickets[idx]
  },
  delete(id: string): void {
    writeFile('tickets', ticketsDb.getAll().filter(t => t.id !== id))
  }
}
