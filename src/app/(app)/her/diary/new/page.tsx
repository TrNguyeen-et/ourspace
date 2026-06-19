import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DiaryEditor from '@/components/diary/DiaryEditor'

export default async function NewHerDiaryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <DiaryEditor userId={user.id} role="her" />
}
