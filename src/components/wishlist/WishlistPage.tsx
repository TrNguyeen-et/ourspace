'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Wish } from '@/types/database'

const CATEGORIES = [
  { icon: '✈️', label: 'Du lịch' },
  { icon: '🍽️', label: 'Ẩm thực' },
  { icon: '🎁', label: 'Quà tặng' },
  { icon: '🎬', label: 'Trải nghiệm' },
  { icon: '📚', label: 'Học hỏi' },
  { icon: '💝', label: 'Kỷ niệm' },
]

export default function WishlistPage({
  wishes: initialWishes, role, userId
}: {
  wishes: Wish[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [wishes, setWishes] = useState<Wish[]>(initialWishes)
  const [filter, setFilter] = useState<'all' | 'pending' | 'done'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const isHim = role === 'him'
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'
  const doneCount = wishes.filter(w => w.is_done).length
  const pendingCount = wishes.filter(w => !w.is_done).length

  const filtered = wishes.filter(w => {
    if (filter === 'pending') return !w.is_done
    if (filter === 'done') return w.is_done
    return true
  })

  async function handleToggleDone(wish: Wish) {
    setToggling(wish.id)
    await supabase.from('wishes').update({ is_done: !wish.is_done }).eq('id', wish.id)
    setWishes(prev => prev.map(w => w.id === wish.id ? { ...w, is_done: !w.is_done } : w))
    setToggling(null)
  }

  async function handleDelete(id: string) {
    if (!confirm('Xoá ước muốn này?')) return
    await supabase.from('wishes').delete().eq('id', id)
    setWishes(prev => prev.filter(w => w.id !== id))
  }

  function handleAdded(wish: Wish) {
    setWishes(prev => [wish, ...prev])
    setShowAdd(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            🌠 Wishlist {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {pendingCount} ước muốn · {doneCount} đã thực hiện
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          + Thêm ước muốn
        </button>
      </div>

      {/* Progress bar */}
      {wishes.length > 0 && (
        <div style={{ background: 'white', borderRadius: 16, padding: '16px 20px', marginBottom: 24, border: '1px solid #f3f4f6', boxShadow: '0 1px 6px rgba(0,0,0,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>Tiến độ thực hiện</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: accent }}>{Math.round(doneCount / wishes.length * 100)}%</span>
          </div>
          <div style={{ height: 8, background: '#f3f4f6', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: (doneCount / wishes.length * 100) + '%', background: 'linear-gradient(90deg, #a855f7, ' + accent + ')', borderRadius: 99, transition: 'width .4s' }} />
          </div>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '8px 0 0' }}>
            {doneCount}/{wishes.length} ước muốn đã thành hiện thực ✨
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { v: 'all', l: 'Tất cả (' + wishes.length + ')' },
          { v: 'pending', l: '💫 Chờ thực hiện (' + pendingCount + ')' },
          { v: 'done', l: '✅ Đã thực hiện (' + doneCount + ')' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v as typeof filter)} style={{
            padding: '6px 14px', borderRadius: 99, fontSize: 13,
            border: '1.5px solid ' + (filter === f.v ? accent : '#e5e7eb'),
            background: filter === f.v ? accentBg : 'white',
            color: filter === f.v ? accent : '#6b7280',
            fontWeight: filter === f.v ? 600 : 400, cursor: 'pointer',
          }}>{f.l}</button>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🌠</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            {filter === 'all' ? 'Wishlist trống. Thêm ước muốn đầu tiên!' : 'Không có gì ở đây.'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Thêm ngay
            </button>
          )}
        </div>
      )}

      {/* Wish cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(wish => (
          <WishCard
            key={wish.id}
            wish={wish}
            accent={accent}
            accentBg={accentBg}
            toggling={toggling === wish.id}
            onToggle={() => handleToggleDone(wish)}
            onDelete={() => handleDelete(wish.id)}
          />
        ))}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddWishModal
          userId={userId}
          accent={accent}
          accentBg={accentBg}
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  )
}

function WishCard({ wish, accent, accentBg, toggling, onToggle, onDelete }: {
  wish: Wish, accent: string, accentBg: string, toggling: boolean,
  onToggle: () => void, onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        background: 'white', borderRadius: 16, padding: '16px 18px',
        border: '1.5px solid ' + (wish.is_done ? '#d1fae5' : hovered ? '#e9d5ff' : '#f3f4f6'),
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.07)' : '0 1px 4px rgba(0,0,0,0.04)',
        transition: 'all .15s',
        opacity: wish.is_done ? 0.75 : 1,
      }}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        disabled={toggling}
        style={{
          width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginTop: 2,
          border: '2px solid ' + (wish.is_done ? '#10b981' : '#d1d5db'),
          background: wish.is_done ? '#10b981' : 'white',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all .2s', fontSize: 13,
        }}
      >
        {wish.is_done && <span style={{ color: 'white' }}>✓</span>}
      </button>

      {/* Image */}
      {wish.image_url && (
        <img src={wish.image_url} alt="" style={{ width: 52, height: 52, borderRadius: 10, objectFit: 'cover', flexShrink: 0 }} />
      )}

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          fontSize: 15, fontWeight: 500, color: '#1a1a2e', margin: '0 0 4px',
          textDecoration: wish.is_done ? 'line-through' : 'none',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {wish.title}
        </p>
        {wish.description && (
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5 }}>
            {wish.description}
          </p>
        )}
        {wish.is_done && (
          <span style={{ fontSize: 11, color: '#10b981', fontWeight: 500, marginTop: 4, display: 'inline-block' }}>
            ✅ Đã thực hiện!
          </span>
        )}
      </div>

      {/* Priority badge */}
      {wish.priority > 0 && (
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 99, flexShrink: 0,
          background: wish.priority === 1 ? '#fef3c7' : wish.priority === 2 ? '#fce7f3' : '#eff6ff',
          color: wish.priority === 1 ? '#b45309' : wish.priority === 2 ? '#9d174d' : '#1d4ed8',
          fontWeight: 500,
        }}>
          {wish.priority === 1 ? '🔥 Quan trọng' : wish.priority === 2 ? '💕 Muốn lắm' : '💭 Để dành'}
        </span>
      )}

      {/* Delete */}
      {hovered && (
        <button onClick={onDelete} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#d1d5db', fontSize: 16, flexShrink: 0, padding: '0 4px' }}>✕</button>
      )}
    </div>
  )
}

function AddWishModal({ userId, accent, accentBg, onClose, onAdded }: {
  userId: string, accent: string, accentBg: string,
  onClose: () => void, onAdded: (w: Wish) => void
}) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [priority, setPriority] = useState(0)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const { data } = await supabase.from('wishes').insert({
      user_id: userId,
      title: title.trim(),
      description: description.trim() || null,
      image_url: imageUrl.trim() || null,
      priority,
      is_done: false,
    }).select().single()

    setSaving(false)
    if (data) onAdded(data as Wish)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>✨ Thêm ước muốn</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Tên ước muốn... *"
            autoFocus
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box', width: '100%' }}
            onFocus={e => e.target.style.borderColor = accent}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Mô tả thêm... (không bắt buộc)"
            rows={3}
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', width: '100%' }}
            onFocus={e => e.target.style.borderColor = accent}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />
          <input
            type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="Link ảnh minh hoạ (không bắt buộc)"
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', width: '100%' }}
            onFocus={e => e.target.style.borderColor = accent}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />

          {/* Priority */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: '0 0 8px' }}>Mức độ</p>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { v: 0, l: '💭 Để dành' },
                { v: 2, l: '💕 Muốn lắm' },
                { v: 1, l: '🔥 Quan trọng' },
              ].map(p => (
                <button key={p.v} onClick={() => setPriority(p.v)} style={{
                  flex: 1, padding: '8px 4px', borderRadius: 10, fontSize: 12, fontWeight: priority === p.v ? 600 : 400,
                  border: '1.5px solid ' + (priority === p.v ? accent : '#e5e7eb'),
                  background: priority === p.v ? accentBg : 'white',
                  color: priority === p.v ? accent : '#6b7280', cursor: 'pointer',
                }}>{p.l}</button>
              ))}
            </div>
          </div>

          {/* Preview image */}
          {imageUrl && (
            <img src={imageUrl} alt="preview" onError={e => e.currentTarget.style.display = 'none'}
              style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 10 }} />
          )}

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}>Huỷ</button>
            <button onClick={handleSave} disabled={!title.trim() || saving} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: !title.trim() ? '#f3f4f6' : 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: !title.trim() ? '#9ca3af' : 'white', fontSize: 14, fontWeight: 600, cursor: !title.trim() ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Đang lưu...' : '✨ Thêm vào wishlist'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
