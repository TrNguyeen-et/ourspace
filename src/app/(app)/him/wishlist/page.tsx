import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import WishlistPage from '@/components/wishlist/WishlistPage'
import type { Wish } from '@/types/database'

export default async function HimWishlistPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'him') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('wishes').select('*').eq('user_id', 'him').order('priority').order('created_at', { ascending: false })
  return <WishlistPage wishes={(data ?? []) as Wish[]} role="him" userId="him" />
}
