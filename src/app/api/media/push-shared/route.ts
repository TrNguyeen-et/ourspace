import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { mediaId, push } = await req.json()
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Verify ownership
  const { data: media } = await supabase
    .from('media').select('id, url, user_id').eq('id', mediaId).single()

  if (!media || media.user_id !== user.id) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  if (push) {
    // Copy file sang shared-media bucket
    const filename = media.url.split('/').pop()!
    const { error: copyError } = await supabase.storage
      .from('private-media')
      .copy(media.url, `shared/${user.id}/${filename}`)

    if (!copyError) {
      // Move copy to shared-media (Supabase doesn't have cross-bucket copy, upload instead)
      // Just update DB flag — dùng signed URL generate phía client
    }
  }

  // Update flag is_in_shared_album
  const { error } = await supabase
    .from('media')
    .update({ is_in_shared_album: push })
    .eq('id', mediaId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
