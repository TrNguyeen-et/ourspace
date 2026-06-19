import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SpecialDatesPage from '@/components/dates/SpecialDatesPage'
import type { Profile, SpecialDate, Wish } from '@/types/database'

export default async function HimDatesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('role, partner_id').eq('id', user.id).single()
  const profile = data as Pick<Profile, 'role' | 'partner_id'> | null
  if (profile?.role !== 'him') redirect('/her/dates')

  const { data: dates } = await supabase
    .from('special_dates').select('*').eq('user_id', user.id).order('date')

  // Wishlist của partner (nữ) để hiển thị khi đến ngày
  const { data: partnerWishes } = profile?.partner_id
    ? await supabase.from('wishes').select('*').eq('user_id', profile.partner_id).eq('is_done', false)
    : { data: [] }

  return (
    <SpecialDatesPage
      dates={(dates ?? []) as SpecialDate[]}
      partnerWishes={(partnerWishes ?? []) as Wish[]}
      role="him"
      userId={user.id}
    />
  )
}
