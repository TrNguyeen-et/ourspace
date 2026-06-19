import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import MusicLibrary from '@/components/music/MusicLibrary'
import type { Profile, Media } from '@/types/database'

export default async function HerMusicPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const profile = data as Pick<Profile, 'role'> | null
  if (profile?.role !== 'her') redirect('/him/music')

  const { data: tracks } = await supabase
    .from('media').select('*')
    .eq('user_id', user.id).eq('type', 'music')
    .order('created_at', { ascending: false })

  return <MusicLibrary tracks={(tracks ?? []) as Media[]} role="her" userId={user.id} />
}
