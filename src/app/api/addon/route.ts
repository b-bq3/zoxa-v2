// ===== Zoxa — Addon API =====
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://felix-fx-top.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbG…_r1U'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { data: addon, error } = await supabase
      .from('addons')
      .insert([data])
      .select()
    
    if (error) throw error
    return NextResponse.json(addon?.[0])
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}