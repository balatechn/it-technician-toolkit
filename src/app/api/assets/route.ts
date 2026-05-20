import { NextRequest, NextResponse } from 'next/server'
import { assetsDb } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const assets = await assetsDb.getAll()
  return NextResponse.json({ assets })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  if (!data.name || !data.type) {
    return NextResponse.json({ error: 'Name and type required' }, { status: 400 })
  }

  const asset = await assetsDb.add({
    name: data.name,
    type: data.type,
    serial: data.serial || data.serialNumber || '',
    model: data.model || '',
    location: data.location || '',
    status: data.status || 'active',
    assignedTo: data.assignedTo || '',
    os: data.os || '',
    lastSeen: new Date().toISOString(),
    notes: data.notes || '',
  })
  return NextResponse.json({ asset }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const data = await req.json()
  const asset = await assetsDb.update(id, data)
  if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ asset })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await assetsDb.delete(id)
  return NextResponse.json({ success: true })
}
