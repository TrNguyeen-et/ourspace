'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

export function useProfile() {
  const supabase = createClient()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [partner, setPartner] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: myProfile } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      setProfile(myProfile)

      if (myProfile?.partner_id) {
        const { data: partnerProfile } = await supabase
          .from('profiles').select('*').eq('id', myProfile.partner_id).single()
        setPartner(partnerProfile)
      }

      setLoading(false)
    }
    load()
  }, [])

  return { profile, partner, loading }
}
