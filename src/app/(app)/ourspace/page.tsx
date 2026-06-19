import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import OurSpacePage from '@/components/ourspace/OurSpacePage'
import type { Profile, DiaryEntry, Media, MoodCheckin } from '@/types/database'

export default async function OurSpace() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Profile + partner
  const { data: profileRaw } = await supabase
    .from('profiles').select('*').eq('id', user.id).single()
  const profile = profileRaw as Profile | null
  if (!profile?.partner_id) redirect('/connect')

  const { data: partnerRaw } = await supabase
    .from('profiles').select('*').eq('id', profile.partner_id).single()
  const partner = partnerRaw as Profile | null

  // Nhật ký chung (cả 2 chia sẻ)
  const { data: sharedDiaries } = await supabase
    .from('diary_entries')
    .select('*')
    .in('user_id', [user.id, profile.partner_id])
    .eq('is_shared', true)
    .order('shared_at', { ascending: false })
    .limit(20)

  // Album chung
  const { data: sharedMedia } = await supabase
    .from('media')
    .select('*')
    .in('user_id', [user.id, profile.partner_id])
    .eq('is_in_shared_album', true)
    .in('type', ['photo', 'video'])
    .order('created_at', { ascending: false })
    .limit(30)

  // Pool nhạc chung (random phía client)
  const { data: musicPool } = await supabase
    .from('media')
    .select('*')
    .in('user_id', [user.id, profile.partner_id])
    .eq('type', 'music')
    .eq('is_in_shared_pool', true)

  // Mood hôm nay của cả 2
  const today = new Date().toISOString().split('T')[0]
  const { data: moods } = await supabase
    .from('mood_checkins')
    .select('*')
    .in('user_id', [user.id, profile.partner_id])
    .gte('created_at', today + 'T00:00:00')
    .order('created_at', { ascending: false })

  return (
    <OurSpacePage
      profile={profile}
      partner={partner!}
      sharedDiaries={(sharedDiaries ?? []) as DiaryEntry[]}
      sharedMedia={(sharedMedia ?? []) as Media[]}
      musicPool={(musicPool ?? []) as Media[]}
      moods={(moods ?? []) as MoodCheckin[]}
      currentUserId={user.id}
    />
  )
}
