import { NextRequest, NextResponse } from 'next/server'
import { logsDb } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'
import os from 'os'

export async function GET(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const limit = req.nextUrl.searchParams.get('limit')
  let logs = await logsDb.getAll()
  if (limit) logs = logs.slice(-parseInt(limit))
  return NextResponse.json({ logs })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  const log = await logsDb.add({
    toolId: data.toolId,
    toolName: data.toolName,
    command: data.command || '',
    status: data.status,
    duration: data.duration || 0,
    technician: user.username,
    device: data.device || os.hostname(),
    notes: data.notes || '',
  })
  return NextResponse.json({ log }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await logsDb.delete(id)
  return NextResponse.json({ success: true })
}
