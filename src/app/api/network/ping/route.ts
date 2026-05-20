import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import * as net from 'net'
import * as dns from 'dns'

export const runtime = 'nodejs'

const PROBE_PORTS = [
  { port: 3389, service: 'RDP' },
  { port: 445, service: 'SMB' },
  { port: 135, service: 'RPC' },
  { port: 22, service: 'SSH' },
  { port: 80, service: 'HTTP' },
  { port: 443, service: 'HTTPS' },
]

function checkPort(host: string, port: number, timeout = 2000): Promise<number | false> {
  return new Promise((resolve) => {
    const start = Date.now()
    const socket = new net.Socket()
    socket.setTimeout(timeout)
    socket.on('connect', () => {
      const latency = Date.now() - start
      socket.destroy()
      resolve(latency)
    })
    socket.on('error', () => { socket.destroy(); resolve(false) })
    socket.on('timeout', () => { socket.destroy(); resolve(false) })
    socket.connect(port, host)
  })
}

function reverseHostname(ip: string): Promise<string | null> {
  return new Promise((resolve) => {
    dns.reverse(ip, (err, hostnames) => {
      resolve(err || !hostnames?.length ? null : hostnames[0])
    })
  })
}

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ip } = await req.json()
  if (!ip || !IP_REGEX.test(ip)) {
    return NextResponse.json({ error: 'Valid IP address required' }, { status: 400 })
  }

  const [portResults, hostname] = await Promise.all([
    Promise.all(
      PROBE_PORTS.map(async ({ port, service }) => {
        const latency = await checkPort(ip, port, 2000)
        return { port, service, open: latency !== false, latency: latency || null }
      })
    ),
    reverseHostname(ip),
  ])

  const openPorts = portResults.filter(r => r.open)
  const alive = openPorts.length > 0
  const latency = alive ? Math.min(...openPorts.map(r => r.latency as number)) : null

  let osHint = 'Unknown'
  const openNums = openPorts.map(p => p.port)
  if (openNums.includes(135) || openNums.includes(445) || openNums.includes(3389)) osHint = 'Windows'
  else if (openNums.includes(22)) osHint = 'Linux / macOS'

  return NextResponse.json({
    alive,
    latency,
    ip,
    hostname,
    osHint,
    openPorts: openPorts.map(r => ({ port: r.port, service: r.service, latency: r.latency })),
  })
}
