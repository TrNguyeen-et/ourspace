import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistPage from '@/components/wishlist/WishlistPage'
import type { Wish } from '@/types/database'

export default async function HerWishlistPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'her') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('wishes').select('*').eq('user_id', 'her').order('priority').order('created_at', { ascending: false })
  return <WishlistPage wishes={(data ?? []) as Wish[]} role="her" userId="her" />
}
