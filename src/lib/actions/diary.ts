'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDiaryEntries() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('diary_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function createDiaryEntry(formData: {
  title: string
  content: string
  mood: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  const { data, error } = await supabase
    .from('diary_entries')
    .insert({
      user_id: user.id,
      title: formData.title,
      content: formData.content,
      mood: formData.mood,
      is_shared: false,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/him/diary')
  revalidatePath('/her/diary')
  return data
}

export async function updateDiaryEntry(id: string, formData: {
  title: string
  content: string
  mood: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  const { error } = await supabase
    .from('diary_entries')
    .update({ title: formData.title, content: formData.content, mood: formData.mood })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/him/diary')
  revalidatePath('/her/diary')
}

export async function deleteDiaryEntry(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/him/diary')
  revalidatePath('/her/diary')
}

export async function toggleShareDiary(id: string, currentShared: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Chưa đăng nhập')

  const { error } = await supabase
    .from('diary_entries')
    .update({
      is_shared: !currentShared,
      shared_at: !currentShared ? new Date().toISOString() : null,
    })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) throw new Error(error.message)
  revalidatePath('/him/diary')
  revalidatePath('/her/diary')
  revalidatePath('/ourspace')
}
