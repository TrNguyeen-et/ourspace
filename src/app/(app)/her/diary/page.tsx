import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiaryList from '@/components/diary/DiaryList'
import type { DiaryEntry } from '@/types/database'

export default async function HerDiaryPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'her') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('diary_entries').select('*').eq('user_id', 'her').order('created_at', { ascending: false })
  return <DiaryList entries={(data ?? []) as DiaryEntry[]} role="her" userId="her" />
}
