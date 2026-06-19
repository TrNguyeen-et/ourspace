import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiaryList from '@/components/diary/DiaryList'
import type { Profile, DiaryEntry } from '@/types/database'

export default async function HerDiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  const profile = data as Pick<Profile, 'role'> | null
  if (profile?.role !== 'her') redirect('/him/diary')

  const { data: entries } = await supabase
    .from('diary_entries').select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <DiaryList entries={(entries ?? []) as DiaryEntry[]} role="her" userId={user.id} />
}
