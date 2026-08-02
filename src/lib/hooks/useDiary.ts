'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DiaryEntry } from '@/types/database'

export function useDiary() {
  const supabase = createClient()
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('diary_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  async function createEntry(payload: {
    title: string; content: string; mood: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data, error } = await supabase
      .from('diary_entries')
      .insert({ ...payload, user_id: user.id })
      .select().single()
    if (!error && data) setEntries(prev => [data, ...prev])
    return data
  }

  async function updateEntry(id: string, payload: Partial<DiaryEntry>) {
    const { data, error } = await supabase
      .from('diary_entries').update(payload).eq('id', id).select().single()
    if (!error && data)
      setEntries(prev => prev.map(e => e.id === id ? data : e))
    return data
  }

  async function deleteEntry(id: string) {
    await supabase.from('diary_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  async function toggleShare(entry: DiaryEntry) {
    const now = new Date().toISOString()
    return updateEntry(entry.id, {
      is_shared: !entry.is_shared,
      shared_at: !entry.is_shared ? now : null,
    })
  }

  return { entries, loading, createEntry, updateEntry, deleteEntry, toggleShare, refetch: fetch }
}
