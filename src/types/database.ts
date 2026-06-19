export type Profile = {
  id: string
  name: string | null
  avatar_url: string | null
  partner_id: string | null
  role: 'him' | 'her' | null
  couple_start_date: string | null
  invite_code: string | null
  created_at: string
}

export type DiaryEntry = {
  id: string
  user_id: string
  title: string | null
  content: string | null
  mood: string | null
  is_shared: boolean
  shared_at: string | null
  voice_url: string | null
  created_at: string
}

export type Media = {
  id: string
  user_id: string
  url: string
  type: 'photo' | 'video' | 'music'
  caption: string | null
  thumbnail_url: string | null
  is_in_shared_pool: boolean
  is_in_shared_album: boolean
  source: string
  created_at: string
}

export type Wish = {
  id: string
  user_id: string
  title: string
  description: string | null
  image_url: string | null
  priority: number
  is_done: boolean
  created_at: string
}

export type SpecialDate = {
  id: string
  user_id: string
  title: string
  date: string
  repeat_yearly: boolean
  category: string
  created_at: string
}

export type MoodCheckin = {
  id: string
  user_id: string
  mood_value: number
  mood_emoji: string | null
  note: string | null
  created_at: string
}

// Generic Database wrapper (dùng với createClient<Database>)
export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> }
      diary_entries: { Row: DiaryEntry; Insert: Partial<DiaryEntry>; Update: Partial<DiaryEntry> }
      media: { Row: Media; Insert: Partial<Media>; Update: Partial<Media> }
      wishes: { Row: Wish; Insert: Partial<Wish>; Update: Partial<Wish> }
      special_dates: { Row: SpecialDate; Insert: Partial<SpecialDate>; Update: Partial<SpecialDate> }
      mood_checkins: { Row: MoodCheckin; Insert: Partial<MoodCheckin>; Update: Partial<MoodCheckin> }
    }
  }
}
