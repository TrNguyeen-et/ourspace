import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { paths, bucket = 'private-media' } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrls(paths, 60 * 60) // 1 giờ

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ urls: data })
}
