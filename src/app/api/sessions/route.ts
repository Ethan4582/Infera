import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'

export async function GET() {
  const { data, error } = await supabaseServer
    .from('sessions')
    .select('*')
    .eq('cancelled', false)
    .order('last_active', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const { id } = await req.json()
  const { data, error } = await supabaseServer
    .from('sessions')
    .insert({ id })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json()
  const { error } = await supabaseServer
    .from('sessions')
    .update({ cancelled: true })
    .eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}