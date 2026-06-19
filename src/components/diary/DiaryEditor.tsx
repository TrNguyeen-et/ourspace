'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const MOODS = [
  { value: 'happy', emoji: '😊', label: 'Vui' },
  { value: 'love', emoji: '🥰', label: 'Yêu' },
  { value: 'sad', emoji: '😢', label: 'Buồn' },
  { value: 'tired', emoji: '😴', label: 'Mệt' },
  { value: 'angry', emoji: '😤', label: 'Tức' },
  { value: 'miss', emoji: '🥺', label: 'Nhớ' },
  { value: 'excited', emoji: '🤩', label: 'Phấn khích' },
  { value: 'calm', emoji: '😌', label: 'Bình yên' },
]

export default function DiaryEditor({ userId, role, entry }: {
  userId: string
  role: 'him' | 'her'
  entry?: { id: string; title: string | null; content: string | null; mood: string | null }
}) {
  const router = useRouter()
  const supabase = createClient()
  const contentRef = useRef<HTMLDivElement>(null)

  const [title, setTitle] = useState(entry?.title || '')
  const [mood, setMood] = useState<string>(entry?.mood || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const isHim = role === 'him'
  const accentColor = isHim ? '#3b82f6' : '#ec4899'
  const backRoute = isHim ? '/him/diary' : '/her/diary'

  function execFormat(cmd: string, value?: string) {
    document.execCommand(cmd, false, value)
    contentRef.current?.focus()
  }

  async function handleSave(shareNow = false) {
    const content = contentRef.current?.innerHTML || ''
    if (!content.trim() && !title.trim()) return
    setSaving(true)
    const payload = {
      user_id: userId,
      title: title || null,
      content,
      mood: mood || null,
      is_shared: shareNow,
      shared_at: shareNow ? new Date().toISOString() : null,
    }
    if (entry?.id) {
      await supabase.from('diary_entries').update(payload).eq('id', entry.id)
    } else {
      await supabase.from('diary_entries').insert(payload)
    }
    setSaving(false)
    setSaved(true)
    setTimeout(() => router.push(backRoute), 800)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button onClick={() => router.back()} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
          ← Quay lại
        </button>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
          {entry ? '✏️ Chỉnh sửa' : '✏️ Viết nhật ký mới'}
        </h1>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '28px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1.5px solid #f5f0ff' }}>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Tiêu đề (không bắt buộc)..."
          style={{ width: '100%', fontSize: 20, fontWeight: 600, color: '#1a1a2e', border: 'none', outline: 'none', padding: '0 0 16px', borderBottom: '1px solid #f3f4f6', marginBottom: 20, background: 'transparent', boxSizing: 'border-box' }}
        />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#9ca3af', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tâm trạng hôm nay</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {MOODS.map(m => (
              <button key={m.value} onClick={() => setMood(mood === m.value ? '' : m.value)} style={{
                padding: '6px 12px', borderRadius: 99,
                border: '1.5px solid ' + (mood === m.value ? accentColor : '#e5e7eb'),
                background: mood === m.value ? (isHim ? '#eff6ff' : '#fdf2f8') : 'white',
                cursor: 'pointer', fontSize: 13,
                color: mood === m.value ? accentColor : '#6b7280',
                fontWeight: mood === m.value ? 600 : 400,
                display: 'flex', alignItems: 'center', gap: 4,
              }}>
                <span>{m.emoji}</span><span>{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4, padding: '8px 0', marginBottom: 12, borderTop: '1px solid #f3f4f6', borderBottom: '1px solid #f3f4f6', flexWrap: 'wrap' }}>
          <button onClick={() => execFormat('bold')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontWeight: 700 }}>B</button>
          <button onClick={() => execFormat('italic')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, fontStyle: 'italic' }}>I</button>
          <button onClick={() => execFormat('underline')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13, textDecoration: 'underline' }}>U</button>
          <button onClick={() => execFormat('insertUnorderedList')} style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer', fontSize: 13 }}>• List</button>
        </div>

        <div
          ref={contentRef}
          contentEditable
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: entry?.content || '' }}
          data-placeholder="Hôm nay của bạn thế nào?..."
          style={{ minHeight: 260, fontSize: 15, lineHeight: 1.8, color: '#374151', outline: 'none', padding: '4px 0' }}
        />

        <style>{`
          [data-placeholder]:empty::before { content: attr(data-placeholder); color: #d1d5db; pointer-events: none; }
          blockquote { border-left: 3px solid #e9d5ff; margin: 8px 0; padding: 4px 12px; color: #7c3aed; font-style: italic; }
        `}</style>

        <div style={{ display: 'flex', gap: 10, marginTop: 24, paddingTop: 20, borderTop: '1px solid #f3f4f6' }}>
          <button onClick={() => handleSave(false)} disabled={saving || saved} style={{ flex: 1, padding: '11px', borderRadius: 10, border: '1.5px solid #e5e7eb', background: 'white', color: '#374151', fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            {saved ? '✓ Đã lưu!' : saving ? 'Đang lưu...' : '💾 Lưu riêng'}
          </button>
          <button onClick={() => handleSave(true)} disabled={saving || saved} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', background: saved ? '#a78bfa' : 'linear-gradient(135deg, #a855f7, ' + accentColor + ')', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            {saved ? '✓ Đã lưu!' : saving ? 'Đang lưu...' : '✨ Lưu & Chia sẻ'}
          </button>
        </div>
        <p style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
          "Lưu & Chia sẻ" sẽ hiện nhật ký này trong khu chung của hai người
        </p>
      </div>
    </div>
  )
}
