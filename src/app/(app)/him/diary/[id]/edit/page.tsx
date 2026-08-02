import { cookies } from 'next/headers'
import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DiaryEditor from '@/components/diary/DiaryEditor'

export default async function EditHimDiaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'him') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('diary_entries').select('id,title,content,mood').eq('id', id).single()
  if (!data) notFound()
  return <DiaryEditor userId="him" role="him" entry={data} />
}
