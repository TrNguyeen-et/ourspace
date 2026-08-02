import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import MediaGallery from '@/components/media/MediaGallery'
import type { Media } from '@/types/database'

export default async function HerMediaPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('ourspace_role')?.value !== 'her') redirect('/')
  const supabase = await createClient()
  const { data } = await supabase.from('media').select('*').eq('user_id', 'her').in('type', ['photo', 'video']).order('created_at', { ascending: false })
  return <MediaGallery media={(data ?? []) as Media[]} role="her" userId="her" />
}
