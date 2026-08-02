import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OurSpacePage from '@/components/ourspace/OurSpacePage'
import type { DiaryEntry, Media, MoodCheckin } from '@/types/database'

export default async function OurSpace() {
  const cookieStore = await cookies()
  const role = cookieStore.get('ourspace_role')?.value as 'him' | 'her' | undefined
  if (!role) redirect('/')

  const supabase = await createClient()
  const partnerId = role === 'him' ? 'her' : 'him'

  const coupleStartDate = '2026-05-14T11:00:00.000Z'
  
  const profile = { id: role, name: role === 'him' ? 'Anh' : 'Em', role, partner_id: partnerId, couple_start_date: coupleStartDate, avatar_url: null, invite_code: null, created_at: '' }
  const partner = { id: partnerId, name: role === 'him' ? 'Em' : 'Anh', role: partnerId as 'him' | 'her', partner_id: role, couple_start_date: coupleStartDate, avatar_url: null, invite_code: null, created_at: '' }

  const { data: sharedDiaries } = await supabase
    .from('diary_entries').select('*').in('user_id', [role, partnerId])
    .eq('is_shared', true).order('shared_at', { ascending: false }).limit(20)

  const { data: sharedMedia } = await supabase
    .from('media').select('*').in('user_id', [role, partnerId])
    .eq('is_in_shared_album', true).in('type', ['photo', 'video'])
    .order('created_at', { ascending: false }).limit(30)

  const { data: musicPool } = await supabase
    .from('media').select('*').in('user_id', [role, partnerId])
    .eq('type', 'music').eq('is_in_shared_pool', true)

  const today = new Date().toISOString().split('T')[0]
  const { data: moods } = await supabase
    .from('mood_checkins').select('*').in('user_id', [role, partnerId])
    .gte('created_at', today + 'T00:00:00').order('created_at', { ascending: false })

  return (
    <OurSpacePage
      profile={profile}
      partner={partner}
      sharedDiaries={(sharedDiaries ?? []) as DiaryEntry[]}
      sharedMedia={(sharedMedia ?? []) as Media[]}
      musicPool={(musicPool ?? []) as Media[]}
      moods={(moods ?? []) as MoodCheckin[]}
      currentUserId={role}
    />
  )
}
