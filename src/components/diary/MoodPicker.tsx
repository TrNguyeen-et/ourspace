'use client'

const MOODS = [
  { emoji: '😊', label: 'Vui', value: 'happy' },
  { emoji: '🥰', label: 'Yêu', value: 'love' },
  { emoji: '😌', label: 'Bình yên', value: 'calm' },
  { emoji: '🤔', label: 'Suy nghĩ', value: 'thoughtful' },
  { emoji: '😔', label: 'Buồn', value: 'sad' },
  { emoji: '😤', label: 'Bực', value: 'frustrated' },
  { emoji: '😴', label: 'Mệt', value: 'tired' },
  { emoji: '🤩', label: 'Hào hứng', value: 'excited' },
]

export function MoodPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 500, color: '#6b7280', margin: '0 0 8px' }}>Tâm trạng hôm nay</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {MOODS.map(m => (
          <button key={m.value} onClick={() => onChange(m.value)} title={m.label}
            style={{
              width: 40, height: 40, borderRadius: 10, border: '2px solid',
              borderColor: value === m.value ? '#a855f7' : '#e5e7eb',
              background: value === m.value ? '#faf5ff' : 'white',
              fontSize: 20, cursor: 'pointer', transition: 'all .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >{m.emoji}</button>
        ))}
      </div>
    </div>
  )
}

export function getMoodEmoji(value: string) {
  return MOODS.find(m => m.value === value)?.emoji ?? '📝'
}

export function getMoodLabel(value: string) {
  return MOODS.find(m => m.value === value)?.label ?? value
}
