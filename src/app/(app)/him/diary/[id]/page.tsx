import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiaryDetail from '@/components/diary/DiaryDetail'
import type { DiaryEntry } from '@/types/database'

export default async function HimDiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'him') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('diary_entries').select('*').eq('id', id).single()
  if (!data) notFound()
  return <DiaryDetail entry={data as DiaryEntry} role="him" />
}
