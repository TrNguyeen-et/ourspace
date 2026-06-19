'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { createClient } from '@/lib/supabase/client'
import type { DiaryEntry } from '@/types/database'

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

function getMoodEmoji(mood: string | null) {
  return MOODS.find(m => m.value === mood)?.emoji || '📝'
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, '').slice(0, 160)
}

export default function DiaryList({
  entries: initialEntries, role, userId
}: {
  entries: DiaryEntry[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [entries, setEntries] = useState(initialEntries)
  const [filter, setFilter] = useState<string>('all')
  const [sharing, setSharing] = useState<string | null>(null)

  const isHim = role === 'him'
  const accentColor = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'
  const diaryRoute = isHim ? '/him/diary' : '/her/diary'

  const filtered = filter === 'all' ? entries
    : filter === 'shared' ? entries.filter(e => e.is_shared)
    : entries.filter(e => e.mood === filter)

  async function handleShare(entry: DiaryEntry) {
    setSharing(entry.id)
    await supabase.from('diary_entries').update({
      is_shared: !entry.is_shared,
      shared_at: entry.is_shared ? null : new Date().toISOString()
    }).eq('id', entry.id)
    setEntries(prev => prev.map(e =>
      e.id === entry.id ? { ...e, is_shared: !e.is_shared } : e
    ))
    setSharing(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá nhật ký này?')) return
    await supabase.from('diary_entries').delete().eq('id', id)
    setEntries(prev => prev.filter(e => e.id !== id))
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            📔 Nhật ký {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {entries.length} trang nhật ký
          </p>
        </div>
        <Link href={diaryRoute + '/new'} style={{ textDecoration: 'none' }}>
          <button style={{
            padding: '10px 20px', borderRadius: 12,
            background: 'linear-gradient(135deg, #a855f7, ' + accentColor + ')',
            color: 'white', border: 'none', fontSize: 14,
            fontWeight: 600, cursor: 'pointer',
          }}>
            ✏️ Viết nhật ký
          </button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
        {[{ value: 'all', label: 'Tất cả' }, { value: 'shared', label: '✨ Đã chia sẻ' },
          ...MOODS.map(m => ({ value: m.value, label: m.emoji + ' ' + m.label }))
        ].map(f => (
          <button key={f.value} onClick={() => setFilter(f.value)} style={{
            padding: '5px 12px', borderRadius: 99, fontSize: 12,
            border: '1.5px solid ' + (filter === f.value ? accentColor : '#e5e7eb'),
            background: filter === f.value ? accentBg : 'white',
            color: filter === f.value ? accentColor : '#6b7280',
            fontWeight: filter === f.value ? 600 : 400, cursor: 'pointer',
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📝</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            {filter === 'all' ? 'Chưa có nhật ký nào. Viết trang đầu tiên nhé!' : 'Không có nhật ký nào phù hợp.'}
          </p>
          {filter === 'all' && (
            <Link href={diaryRoute + '/new'}>
              <button style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accentColor, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
                Viết ngay
              </button>
            </Link>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(entry => (
          <div key={entry.id} style={{
            background: 'white', borderRadius: 16, padding: '18px 20px',
            border: '1.5px solid ' + (entry.is_shared ? '#e9d5ff' : '#f3f4f6'),
            boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: 20 }}>{getMoodEmoji(entry.mood)}</span>
                  <span style={{ fontSize: 12, color: '#9ca3af' }}>
                    {format(new Date(entry.created_at), 'EEEE, dd/MM/yyyy', { locale: vi })}
                  </span>
                  {entry.is_shared && (
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#f5f3ff', color: '#7c3aed', fontWeight: 500 }}>
                      ✨ Đã chia sẻ
                    </span>
                  )}
                </div>
                {entry.title && (
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1a1a2e', margin: '0 0 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {entry.title}
                  </h3>
                )}
                <p style={{ fontSize: 14, color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  {entry.content ? stripHtml(entry.content) + (entry.content.length > 160 ? '...' : '') : 'Không có nội dung...'}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <Link href={diaryRoute + '/' + entry.id} style={{ textDecoration: 'none' }}>
                  <button style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', fontSize: 12, color: '#6b7280', cursor: 'pointer', width: '100%' }}>
                    Đọc
                  </button>
                </Link>
                <button onClick={() => handleShare(entry)} disabled={sharing === entry.id} style={{
                  padding: '6px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
                  border: '1px solid ' + (entry.is_shared ? '#fde68a' : '#e9d5ff'),
                  background: entry.is_shared ? '#fffbeb' : '#faf5ff',
                  color: entry.is_shared ? '#b45309' : '#7c3aed', fontWeight: 500,
                }}>
                  {sharing === entry.id ? '...' : entry.is_shared ? '↩ Bỏ chia sẻ' : '✨ Chia sẻ'}
                </button>
                <button onClick={() => handleDelete(entry.id)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #fee2e2', background: 'white', fontSize: 12, color: '#ef4444', cursor: 'pointer' }}>
                  Xoá
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
