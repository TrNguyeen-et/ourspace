import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DiaryEditor from '@/components/diary/DiaryEditor'

export default async function NewHerDiaryPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'her') redirect('/')
  return <DiaryEditor userId="her" role="her" />
}
