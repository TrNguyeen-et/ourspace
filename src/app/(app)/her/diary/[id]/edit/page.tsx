import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import DiaryEditor from '@/components/diary/DiaryEditor'

export default async function EditHerDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entry } = await supabase
    .from('diary_entries').select('id, title, content, mood').eq('id', id).eq('user_id', user.id).single()

  if (!entry) notFound()

  return <DiaryEditor userId={user.id} role="her" entry={entry} />
}
