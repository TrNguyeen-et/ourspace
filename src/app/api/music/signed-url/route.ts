import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { path } = await req.json()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { data, error } = await supabase.storage.from('private-media').createSignedUrl(path, 60 * 60 * 3)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ signedUrl: data.signedUrl })
}
