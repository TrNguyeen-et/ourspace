import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import WishlistPage from '@/components/wishlist/WishlistPage'
import type { Profile, Wish } from '@/types/database'

export default async function HimWishlistPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  const profile = data as Pick<Profile, 'role'> | null
  if (profile?.role !== 'him') redirect('/her/wishlist')

  const { data: wishes } = await supabase
    .from('wishes').select('*').eq('user_id', user.id).order('priority').order('created_at', { ascending: false })

  return <WishlistPage wishes={(wishes ?? []) as Wish[]} role="him" userId={user.id} />
}
