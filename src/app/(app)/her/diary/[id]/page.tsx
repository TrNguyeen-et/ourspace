import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DiaryDetail from '@/components/diary/DiaryDetail'

export default async function HerDiaryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry } = await supabase
    .from('diary_entries').select('*').eq('id', id).eq('user_id', user.id).single()

  if (!entry) notFound()

  return <DiaryDetail entry={entry} role="her" />
}
