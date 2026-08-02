'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MoodCheckin } from '@/types/database'

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Vui' },
  { value: 'love', emoji: '🥰', label: 'Yêu' },
  { value: 'sad', emoji: '😢', label: 'Buồn' },
  { value: 'tired', emoji: '😴', label: 'Mệt' },
  { value: 'angry', emoji: '😤', label: 'Tức' },
  { value: 'miss', emoji: '🥺', label: 'Nhớ' },
  { value: 'excited', emoji: '🤩', label: 'Hào hứng' },
  { value: 'calm', emoji: '😌', label: 'Bình yên' },
]

export default function MoodSync({ myMood: initialMyMood, partnerMood, myName, partnerName, currentUserId }: {
  myMood: MoodCheckin | null
  partnerMood: MoodCheckin | null
  myName: string
  partnerName: string
  currentUserId: string
}) {
  const supabase = createClient()
  const [myMood, setMyMood] = useState<MoodCheckin | null>(initialMyMood)
  const [selecting, setSelecting] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSelectMood(moodValue: string) {
    setSaving(true)
    const emoji = MOODS.find(m => m.value === moodValue)?.emoji ?? ''

    if (myMood) {
      // Update existing
      await supabase.from('mood_checkins').update({
        mood_value: MOODS.findIndex(m => m.value === moodValue) + 1,
        mood_emoji: emoji,
      }).eq('id', myMood.id)
      setMyMood(prev => prev ? { ...prev, mood_value: MOODS.findIndex(m => m.value === moodValue) + 1, mood_emoji: emoji } : null)
    } else {
      const { data } = await supabase.from('mood_checkins').insert({
        user_id: currentUserId,
        mood_value: MOODS.findIndex(m => m.value === moodValue) + 1,
        mood_emoji: emoji,
      }).select().single()
      if (data) setMyMood(data as MoodCheckin)
    }

    setSelecting(false)
    setSaving(false)
  }

  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '18px 20px', marginBottom: 20, boxShadow: '0 2px 16px rgba(168,85,247,0.06)', border: '1px solid #f0e8ff' }}>
      <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1a1a2e', margin: '0 0 14px' }}>💭 Tâm trạng hôm nay</h2>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {/* My mood */}
        <div
          onClick={() => setSelecting(v => !v)}
          style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px dashed ' + (myMood ? '#e9d5ff' : '#d1d5db'), textAlign: 'center', cursor: 'pointer', background: myMood ? '#faf5ff' : '#fafafa', transition: 'all .15s' }}
        >
          {myMood ? (
            <>
              <div style={{ fontSize: 32 }}>{myMood.mood_emoji}</div>
              <p style={{ fontSize: 12, color: '#7c3aed', fontWeight: 500, margin: '4px 0 0' }}>{myName}</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, opacity: 0.3 }}>😶</div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>Check-in</p>
            </>
          )}
        </div>

        <div style={{ fontSize: 20 }}>💞</div>

        {/* Partner mood */}
        <div style={{ flex: 1, padding: '14px', borderRadius: 14, border: '1.5px solid ' + (partnerMood ? '#fce7f3' : '#f3f4f6'), textAlign: 'center', background: partnerMood ? '#fdf2f8' : '#fafafa' }}>
          {partnerMood ? (
            <>
              <div style={{ fontSize: 32 }}>{partnerMood.mood_emoji}</div>
              <p style={{ fontSize: 12, color: '#ec4899', fontWeight: 500, margin: '4px 0 0' }}>{partnerName}</p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 28, opacity: 0.3 }}>😶</div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>{partnerName}</p>
            </>
          )}
        </div>
      </div>

      {/* Mood picker */}
      {selecting && (
        <div style={{ marginTop: 14, padding: '14px', background: '#f9f7ff', borderRadius: 12, border: '1px solid #e9d5ff' }}>
          <p style={{ fontSize: 12, color: '#7c3aed', fontWeight: 500, margin: '0 0 10px' }}>Hôm nay bạn cảm thấy thế nào?</p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button
                key={m.value}
                onClick={() => handleSelectMood(m.value)}
                disabled={saving}
                style={{
                  padding: '6px 12px', borderRadius: 99, fontSize: 13, cursor: 'pointer',
                  border: '1.5px solid #e9d5ff', background: 'white', color: '#374151',
                  display: 'flex', alignItems: 'center', gap: 4, transition: 'all .15s',
                }}
                onMouseOver={e => { e.currentTarget.style.background = '#faf5ff'; e.currentTarget.style.borderColor = '#a855f7' }}
                onMouseOut={e => { e.currentTarget.style.background = 'white'; e.currentTarget.style.borderColor = '#e9d5ff' }}
              >
                <span>{m.emoji}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Both checked in message */}
      {myMood && partnerMood && (
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', margin: '12px 0 0' }}>
          {myMood.mood_emoji === partnerMood.mood_emoji
            ? `Hai người cùng cảm thấy ${myMood.mood_emoji} hôm nay! 💕`
            : 'Cả hai đã check-in hôm nay rồi 💕'}
        </p>
      )}
    </div>
  )
}
