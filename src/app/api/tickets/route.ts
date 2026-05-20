import { NextRequest, NextResponse } from 'next/server'
import { ticketsDb } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const tickets = await ticketsDb.getAll()
  return NextResponse.json({ tickets })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  if (!data.title || !data.description) {
    return NextResponse.json({ error: 'Title and description required' }, { status: 400 })
  }

  const ticket = await ticketsDb.add({
    title: data.title,
    description: data.description,
    priority: data.priority || 'medium',
    status: data.status || 'open',
    category: data.category || 'General',
    assignedTo: data.assignedTo || user.username,
    reportedBy: data.reportedBy || data.reporter || user.username,
    device: data.device || '',
  })
  return NextResponse.json({ ticket }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const data = await req.json()
  const ticket = await ticketsDb.update(id, data)
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ ticket })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await ticketsDb.delete(id)
  return NextResponse.json({ success: true })
}
