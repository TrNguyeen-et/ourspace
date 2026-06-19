import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AppNav from '@/components/layout/AppNav'
import type { Profile } from '@/types/database'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const profile = data as Profile | null
  if (!profile?.partner_id) redirect('/connect')

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f9f7ff' }}>
      <AppNav profile={profile} />
      <main style={{ flex: 1, marginLeft: 220, minHeight: '100vh' }}>
        {children}
      </main>
    </div>
  )
}
