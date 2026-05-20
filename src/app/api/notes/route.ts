import { NextRequest, NextResponse } from 'next/server'
import { notesDb } from '@/lib/db'
import { getSessionUser } from '@/lib/auth'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const notes = await notesDb.getAll()
  return NextResponse.json({ notes })
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const data = await req.json()
  if (!data.title || !data.content) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 })
  }

  const note = await notesDb.add({
    title: data.title,
    content: data.content,
    tags: data.tags || [],
    priority: data.priority || 'medium',
  })
  return NextResponse.json({ note }, { status: 201 })
}

export async function PUT(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  const data = await req.json()
  const note = await notesDb.update(id, data)
  if (!note) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ note })
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 })

  await notesDb.delete(id)
  return NextResponse.json({ success: true })
}
