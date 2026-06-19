import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SpecialDatesPage from '@/components/dates/SpecialDatesPage'
import type { Profile, SpecialDate, Wish } from '@/types/database'

export default async function HerDatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('role, partner_id').eq('id', user.id).single()
  const profile = data as Pick<Profile, 'role' | 'partner_id'> | null
  if (profile?.role !== 'her') redirect('/him/dates')

  const { data: dates } = await supabase
    .from('special_dates').select('*').eq('user_id', user.id).order('date')

  const { data: partnerWishes } = profile?.partner_id
    ? await supabase.from('wishes').select('*').eq('user_id', profile.partner_id).eq('is_done', false)
    : { data: [] }

  return (
    <SpecialDatesPage
      dates={(dates ?? []) as SpecialDate[]}
      partnerWishes={(partnerWishes ?? []) as Wish[]}
      role="her"
      userId={user.id}
    />
  )
}
