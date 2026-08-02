import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MusicLibrary from '@/components/music/MusicLibrary'
import type { Media } from '@/types/database'

export default async function HimMusicPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'him') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('media').select('*').eq('user_id', 'him').eq('type', 'music').order('created_at', { ascending: false })
  return <MusicLibrary tracks={(data ?? []) as Media[]} role="him" userId="him" />
}
