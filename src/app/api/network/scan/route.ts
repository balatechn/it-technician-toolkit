import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import * as net from 'net'
import * as dns from 'dns'

export const runtime = 'nodejs'

const PROBE_PORTS = [135, 445, 3389, 22, 80]
const SUBNET_REGEX = /^(\d{1,3}\.){2}\d{1,3}$/

function checkPort(host: string, port: number, timeout = 1500): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.on('connect', () => { socket.destroy(); resolve(true) })
    socket.on('error', () => { socket.destroy(); resolve(false) })
    socket.on('timeout', () => { socket.destroy(); resolve(false) })
    socket.connect(port, host)
  })
}

function reverseHostname(ip: string): Promise<string | null> {
  return new Promise((resolve) => {
    dns.reverse(ip, (err, hostnames) =>
      resolve(err || !hostnames?.length ? null : hostnames[0])
    )
  })
}

async function probeHost(ip: string) {
  const portResults = await Promise.all(
    PROBE_PORTS.map(async (port) => ({ port, open: await checkPort(ip, port) }))
  )
  const openPorts = portResults.filter(p => p.open).map(p => p.port)
  if (openPorts.length === 0) return null

  const hostname = await reverseHostname(ip)

  let osHint = 'Unknown'
  if (openPorts.includes(135) || openPorts.includes(445) || openPorts.includes(3389)) osHint = 'Windows'
  else if (openPorts.includes(22)) osHint = 'Linux / macOS'
  else if (openPorts.includes(80)) osHint = 'Web / IoT'

  return { ip, hostname, openPorts, osHint }
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { subnet, startOctet, endOctet } = await req.json()

  if (!subnet || startOctet === undefined || endOctet === undefined) {
    return NextResponse.json({ error: 'subnet, startOctet, endOctet required' }, { status: 400 })
  }
  if (!SUBNET_REGEX.test(subnet)) {
    return NextResponse.json({ error: 'Invalid subnet (e.g. 192.168.1)' }, { status: 400 })
  }

  const start = Math.max(1, Math.min(254, parseInt(startOctet)))
  const end = Math.min(254, Math.max(start, parseInt(endOctet)))
  if (end - start > 99) {
    return NextResponse.json({ error: 'Max 100 IPs per scan' }, { status: 400 })
  }

  const ips = Array.from({ length: end - start + 1 }, (_, i) => `${subnet}.${start + i}`)

  // Batch in groups of 20 to avoid too many open sockets
  const devices: any[] = []
  for (let i = 0; i < ips.length; i += 20) {
    const batch = ips.slice(i, i + 20)
    const results = await Promise.all(batch.map(probeHost))
    results.forEach(r => { if (r) devices.push(r) })
  }

  return NextResponse.json({ devices, total: ips.length, found: devices.length })
}
