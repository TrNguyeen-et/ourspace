import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DiaryList from '@/components/diary/DiaryList'

export default async function HimDiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()

  // Chỉ bạn nam mới vào được
  if (profile?.role !== 'him') redirect('/her/diary')

  const { data: entries } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return <DiaryList entries={entries || []} role="him" userId={user.id} />
}
