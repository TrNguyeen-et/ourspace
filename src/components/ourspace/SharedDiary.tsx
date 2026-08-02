'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { DiaryEntry, Profile } from '@/types/database'

const MOOD_MAP: Record<string, string> = {
  happy: '😊', love: '🥰', sad: '😢', tired: '😴',
  angry: '😤', miss: '🥺', excited: '🤩', calm: '😌',
}

export default function SharedDiary({ entries, profile, partner, currentUserId }: {
  entries: DiaryEntry[]
  profile: Profile
  partner: Profile
  currentUserId: string
}) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterAuthor, setFilterAuthor] = useState<'all' | 'me' | 'partner'>('all')

  const filtered = entries.filter(e => {
    if (filterAuthor === 'me') return e.user_id === currentUserId
    if (filterAuthor === 'partner') return e.user_id !== currentUserId
    return true
  })

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 18, border: '1px solid #f0e8ff' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📔</div>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 8 }}>Chưa có nhật ký nào được chia sẻ.</p>
        <p style={{ color: '#c4b5fd', fontSize: 13 }}>Vào khu riêng → nhật ký → nhấn "✨ Chia sẻ" để thêm vào đây.</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '20px', boxShadow: '0 2px 16px rgba(168,85,247,0.06)', border: '1px solid #f0e8ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>📔 Nhật ký chung</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { v: 'all', l: 'Tất cả' },
            { v: 'me', l: profile.name ?? 'Tôi' },
            { v: 'partner', l: partner.name ?? 'Người yêu' },
          ].map(f => (
            <button key={f.v} onClick={() => setFilterAuthor(f.v as typeof filterAuthor)} style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 12,
              border: '1px solid ' + (filterAuthor === f.v ? '#a855f7' : '#e5e7eb'),
              background: filterAuthor === f.v ? '#faf5ff' : 'white',
              color: filterAuthor === f.v ? '#7c3aed' : '#6b7280',
              fontWeight: filterAuthor === f.v ? 600 : 400, cursor: 'pointer',
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(entry => {
          const isMe = entry.user_id === currentUserId
          const author = isMe ? profile : partner
          const isOpen = expanded === entry.id

          return (
            <div key={entry.id} style={{
              borderRadius: 14, border: '1px solid ' + (isMe ? '#e9d5ff' : '#fce7f3'),
              overflow: 'hidden', background: isMe ? '#faf5ff' : '#fff5f9',
            }}>
              {/* Header */}
              <div
                onClick={() => setExpanded(isOpen ? null : entry.id)}
                style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#a855f7,#3b82f6)' : 'linear-gradient(135deg,#ec4899,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: 'white', fontWeight: 700, flexShrink: 0 }}>
                  {author.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e' }}>{author.name}</span>
                    {entry.mood && <span style={{ fontSize: 14 }}>{MOOD_MAP[entry.mood]}</span>}
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                      {entry.shared_at ? format(new Date(entry.shared_at), 'dd/MM/yyyy', { locale: vi }) : ''}
                    </span>
                  </div>
                  {entry.title && <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.title}</p>}
                  {!isOpen && (
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.content?.replace(/<[^>]*>/g, '').slice(0, 80)}...
                    </p>
                  )}
                </div>
                <span style={{ color: '#9ca3af', fontSize: 12, flexShrink: 0 }}>{isOpen ? '▲' : '▼'}</span>
              </div>

              {/* Full content */}
              {isOpen && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid ' + (isMe ? '#e9d5ff' : '#fce7f3') }}>
                  <div
                    style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', paddingTop: 12 }}
                    dangerouslySetInnerHTML={{ __html: entry.content ?? '' }}
                  />
                  <style>{`blockquote{border-left:3px solid #e9d5ff;margin:8px 0;padding:4px 12px;color:#7c3aed;font-style:italic}ul{padding-left:20px}li{margin:4px 0}`}</style>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
