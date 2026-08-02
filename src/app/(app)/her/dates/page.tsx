import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SpecialDatesPage from '@/components/dates/SpecialDatesPage'
import type { SpecialDate, Wish } from '@/types/database'

export default async function HerDatesPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'her') redirect('/')
  const supabase = await createClient()
  const { data: dates } = await supabase.from('special_dates').select('*').eq('user_id', 'her').order('date')
  const { data: partnerWishes } = await supabase.from('wishes').select('*').eq('user_id', 'him').eq('is_done', false)
  return <SpecialDatesPage dates={(dates ?? []) as SpecialDate[]} partnerWishes={(partnerWishes ?? []) as Wish[]} role="her" userId="her" />
}
