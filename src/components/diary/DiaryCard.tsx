'use client'

import { useState } from 'react'
import { getMoodEmoji, getMoodLabel } from './MoodPicker'
import { deleteDiaryEntry, toggleShareDiary } from '@/lib/actions/diary'
import DiaryEditor from './DiaryEditor'   // ← fix: default import, không phải named
import type { DiaryEntry } from '@/types/database'

interface Props {
  entry: DiaryEntry
  accentColor?: string
}

export function DiaryCard({ entry, accentColor = '#a855f7' }: Props) {
  const [showEdit, setShowEdit] = useState(false)
  const [sharing, setSharing] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const date = new Date(entry.created_at)
  const isLong = (entry.content?.length ?? 0) > 280

  async function handleShare() {
    setSharing(true)
    await toggleShareDiary(entry.id, entry.is_shared)
    setSharing(false)
  }

  async function handleDelete() {
    if (!confirm('Xoá nhật ký này?')) return
    setDeleting(true)
    await deleteDiaryEntry(entry.id)
    setDeleting(false)
  }

  // DiaryEditor mới nhận userId + role, không nhận onClose/accentColor
  // Nên ở đây ta render inline edit bằng DiaryList redirect thay vì modal
  const role = accentColor === '#3b82f6' ? 'him' : 'her'

  return (
    <>
      <div
        style={{
          background: 'white', borderRadius: 16,
          border: '1px solid ' + (entry.is_shared ? '#e9d5ff' : '#f3f4f6'),
          padding: '1.25rem',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)',
          transition: 'box-shadow .15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 1px 8px rgba(0,0,0,0.04)')}
      >
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{getMoodEmoji(entry.mood ?? '')}</span>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>
                {date.toLocaleDateString('vi-VN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              {entry.mood && (
                <p style={{ margin: 0, fontSize: 11, color: '#d8b4fe' }}>{getMoodLabel(entry.mood)}</p>
              )}
            </div>
          </div>
          {entry.is_shared && (
            <span style={{
              fontSize: 11, padding: '2px 10px', borderRadius: 99,
              background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0',
              fontWeight: 500,
            }}>
              ✓ Đã chia sẻ
            </span>
          )}
        </div>

        {entry.title && (
          <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 600, color: '#1a1a2e' }}>
            {entry.title}
          </h3>
        )}

        <p style={{
          margin: 0, fontSize: 14, color: '#4b5563', lineHeight: 1.75,
          display: '-webkit-box', WebkitBoxOrient: 'vertical',
          WebkitLineClamp: expanded ? 999 : 4,
          overflow: 'hidden',
        }}>
          {entry.content?.replace(/<[^>]*>/g, '')}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(p => !p)}
            style={{ background: 'none', border: 'none', color: accentColor, fontSize: 13, cursor: 'pointer', padding: '4px 0', fontWeight: 500 }}
          >
            {expanded ? 'Thu gọn ↑' : 'Xem thêm ↓'}
          </button>
        )}

        <div style={{ display: 'flex', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid #f9fafb' }}>
          <button
            onClick={handleShare}
            disabled={sharing}
            style={{
              flex: 1, padding: '7px 10px', borderRadius: 8, fontSize: 12, fontWeight: 500,
              cursor: 'pointer', border: '1.5px solid',
              borderColor: entry.is_shared ? '#bbf7d0' : '#e9d5ff',
              background: entry.is_shared ? '#f0fdf4' : '#faf5ff',
              color: entry.is_shared ? '#16a34a' : '#7c3aed',
            }}
          >
            {sharing ? '...' : entry.is_shared ? '💔 Bỏ chia sẻ' : '💝 Chia sẻ sang khu chung'}
          </button>
          <button
            onClick={() => setShowEdit(true)}
            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1.5px solid #e5e7eb', background: 'white', color: '#6b7280', cursor: 'pointer' }}
          >
            ✏️
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            style={{ padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, border: '1.5px solid #fee2e2', background: '#fff5f5', color: '#ef4444', cursor: 'pointer' }}
          >
            {deleting ? '...' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Edit modal — dùng wrapper vì DiaryEditor giờ là page-level component */}
      {showEdit && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, overflow: 'auto' }}>
          <div style={{ minHeight: '100vh', padding: '20px' }}>
            <div style={{ maxWidth: 720, margin: '0 auto', background: '#f9f7ff', borderRadius: 20, padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
                <button
                  onClick={() => setShowEdit(false)}
                  style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}
                >✕</button>
              </div>
              <DiaryEditor userId={entry.user_id} role={role} entry={entry} />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
