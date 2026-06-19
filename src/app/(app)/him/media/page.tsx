import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MediaGallery from '@/components/media/MediaGallery'

export default async function HimMediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'him') redirect('/her/media')

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['photo', 'video'])
    .order('created_at', { ascending: false })

  return <MediaGallery media={media || []} role="him" userId={user.id} />
}
