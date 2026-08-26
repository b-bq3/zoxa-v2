// ===== Zoxa — Stats API =====
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://felix-fx-top.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbG…_r1U'
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    const { count: total_addons, error: addonsError } = await supabase
      .from('addons')
      .select('*', { count: 'exact', head: true })
    
    const { count: total_downloads, error: downloadsError } = await supabase
      .from('addon_downloads')
      .select('*', { count: 'exact', head: true })
    
    if (addonsError || downloadsError) {
      throw new Error(addonsError?.message || downloadsError?.message)
    }
    
    return NextResponse.json({ total_addons, total_downloads })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}