import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import DiaryEditor from '@/components/diary/DiaryEditor'

export default async function NewHimDiaryPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'him') redirect('/')
  return <DiaryEditor userId="him" role="him" />
}
