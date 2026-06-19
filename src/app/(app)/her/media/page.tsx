import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MediaGallery from '@/components/media/MediaGallery'
import type { Profile } from '@/types/database'

export default async function HerMediaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = data as Pick<Profile, 'role'> | null
  if (profile?.role !== 'her') redirect('/him/media')

  const { data: media } = await supabase
    .from('media')
    .select('*')
    .eq('user_id', user.id)
    .in('type', ['photo', 'video'])
    .order('created_at', { ascending: false })

  return <MediaGallery media={media ?? []} role="her" userId={user.id} />
}
