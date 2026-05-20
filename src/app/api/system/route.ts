import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth'
import { generateSysInfo } from '@/lib/utils'
import os from 'os'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const info = generateSysInfo()

  return NextResponse.json({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
    processUptime: Math.floor(process.uptime()),
    systemUptime: Math.floor(os.uptime()),
    cpuCores: os.cpus().length,
    cpuModel: os.cpus()[0]?.model || 'Unknown',
    totalMemoryGB: (os.totalmem() / 1024 / 1024 / 1024).toFixed(1),
    freeMemoryGB: (os.freemem() / 1024 / 1024 / 1024).toFixed(1),
    hostname: os.hostname(),
    osType: os.type(),
    osRelease: os.release(),
    simulatedInfo: info,
  })
}
