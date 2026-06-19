'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { DiaryEntry } from '@/types/database'

const MOODS: Record<string, string> = {
  happy: '😊', love: '🥰', sad: '😢', tired: '😴',
  angry: '😤', miss: '🥺', excited: '🤩', calm: '😌',
}

export default function DiaryDetail({ entry: initialEntry, role }: { entry: DiaryEntry; role: 'him' | 'her' }) {
  const router = useRouter()
  const supabase = createClient()
  const [entry, setEntry] = useState(initialEntry)
  const [sharing, setSharing] = useState(false)

  const isHim = role === 'him'
  const accentColor = isHim ? '#3b82f6' : '#ec4899'
  const backRoute = isHim ? '/him/diary' : '/her/diary'
  const editRoute = `${backRoute}/${entry.id}/edit`

  async function handleShare() {
    setSharing(true)
    await supabase.from('diary_entries').update({
      is_shared: !entry.is_shared,
      shared_at: entry.is_shared ? null : new Date().toISOString(),
    }).eq('id', entry.id)
    setEntry(prev => ({ ...prev, is_shared: !prev.is_shared }))
    setSharing(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>
      {/* Back */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <button onClick={() => router.push(backRoute)} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
          ← Nhật ký
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href={editRoute} style={{ textDecoration: 'none' }}>
            <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              ✏️ Sửa
            </button>
          </Link>
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              padding: '6px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer', fontWeight: 500,
              border: '1px solid ' + (entry.is_shared ? '#fde68a' : '#e9d5ff'),
              background: entry.is_shared ? '#fffbeb' : '#faf5ff',
              color: entry.is_shared ? '#b45309' : '#7c3aed',
            }}
          >
            {sharing ? '...' : entry.is_shared ? '↩ Bỏ chia sẻ' : '✨ Chia sẻ khu chung'}
          </button>
        </div>
      </div>

      <div style={{ background: 'white', borderRadius: 20, padding: '32px', boxShadow: '0 2px 20px rgba(0,0,0,0.06)', border: '1.5px solid #f5f0ff' }}>
        {/* Meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          {entry.mood && <span style={{ fontSize: 28 }}>{MOODS[entry.mood] || '📝'}</span>}
          <div>
            <div style={{ fontSize: 13, color: '#9ca3af' }}>
              {format(new Date(entry.created_at), "EEEE, dd 'tháng' MM, yyyy", { locale: vi })}
            </div>
            {entry.is_shared && (
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#f5f3ff', color: '#7c3aed', fontWeight: 500 }}>
                ✨ Đã chia sẻ khu chung
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        {entry.title && (
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1a1a2e', margin: '0 0 20px', lineHeight: 1.3 }}>
            {entry.title}
          </h1>
        )}

        {/* Content */}
        <div
          style={{ fontSize: 15, lineHeight: 1.9, color: '#374151' }}
          dangerouslySetInnerHTML={{ __html: entry.content || '<p style="color:#9ca3af">Không có nội dung.</p>' }}
        />

        <style>{`
          blockquote { border-left: 3px solid #e9d5ff; margin: 12px 0; padding: 4px 16px; color: #7c3aed; font-style: italic; }
          ul { padding-left: 20px; }
          li { margin: 4px 0; }
        `}</style>
      </div>
    </div>
  )
}
