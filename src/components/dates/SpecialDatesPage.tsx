'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, differenceInDays, addYears, parseISO, isBefore, startOfDay } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { SpecialDate, Wish } from '@/types/database'

const CATEGORIES = [
  { value: 'anniversary', icon: '💑', label: 'Kỷ niệm' },
  { value: 'birthday', icon: '🎂', label: 'Sinh nhật' },
  { value: 'travel', icon: '✈️', label: 'Du lịch' },
  { value: 'date', icon: '🕯️', label: 'Hẹn hò' },
  { value: 'other', icon: '⭐', label: 'Khác' },
]

function getCategoryIcon(cat: string) {
  return CATEGORIES.find(c => c.value === cat)?.icon ?? '⭐'
}

function getNextOccurrence(dateStr: string, repeatYearly: boolean): Date {
  const today = startOfDay(new Date())
  const date = parseISO(dateStr)
  if (!repeatYearly) return date

  let next = new Date(today.getFullYear(), date.getMonth(), date.getDate())
  if (isBefore(next, today)) next = addYears(next, 1)
  return next
}

function getDaysUntil(dateStr: string, repeatYearly: boolean): number {
  const next = getNextOccurrence(dateStr, repeatYearly)
  return differenceInDays(next, startOfDay(new Date()))
}

export default function SpecialDatesPage({
  dates: initialDates, partnerWishes, role, userId
}: {
  dates: SpecialDate[], partnerWishes: Wish[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [dates, setDates] = useState<SpecialDate[]>(initialDates)
  const [showAdd, setShowAdd] = useState(false)
  const [revealedWish, setRevealedWish] = useState<Wish | null>(null)
  const [revealingId, setRevealingId] = useState<string | null>(null)

  const isHim = role === 'him'
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'

  // Sort by nearest upcoming
  const sorted = useMemo(() => {
    return [...dates].sort((a, b) => getDaysUntil(a.date, a.repeat_yearly) - getDaysUntil(b.date, b.repeat_yearly))
  }, [dates])

  // Dates happening today or within 3 days
  const upcoming = sorted.filter(d => {
    const days = getDaysUntil(d.date, d.repeat_yearly)
    return days <= 3 && days >= 0
  })

  async function handleDelete(id: string) {
    if (!confirm('Xoá ngày đặc biệt này?')) return
    await supabase.from('special_dates').delete().eq('id', id)
    setDates(prev => prev.filter(d => d.id !== id))
  }

  function handleRevealWish(dateId: string) {
    if (partnerWishes.length === 0) return
    setRevealingId(dateId)
    const random = partnerWishes[Math.floor(Math.random() * partnerWishes.length)]
    setRevealedWish(random)
  }

  function handleAdded(date: SpecialDate) {
    setDates(prev => [...prev, date])
    setShowAdd(false)
  }

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            📅 Ngày đặc biệt {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {dates.length} ngày · {upcoming.length > 0 ? upcoming.length + ' ngày sắp tới' : 'Không có ngày nào trong 3 ngày tới'}
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          + Thêm ngày
        </button>
      </div>

      {/* Upcoming alert */}
      {upcoming.length > 0 && (
        <div style={{ background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)', border: '1.5px solid #e9d5ff', borderRadius: 16, padding: '16px 20px', marginBottom: 24 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', margin: '0 0 10px' }}>
            🎉 Sắp tới rồi!
          </p>
          {upcoming.map(d => {
            const days = getDaysUntil(d.date, d.repeat_yearly)
            return (
              <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 14, color: '#1a1a2e' }}>
                  {getCategoryIcon(d.category)} {d.title}
                </span>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: days === 0 ? '#ef4444' : '#7c3aed' }}>
                    {days === 0 ? '🎊 Hôm nay!' : 'Còn ' + days + ' ngày'}
                  </span>
                  {partnerWishes.length > 0 && (
                    <button
                      onClick={() => handleRevealWish(d.id)}
                      style={{ fontSize: 11, padding: '3px 10px', borderRadius: 99, border: 'none', background: '#7c3aed', color: 'white', cursor: 'pointer', fontWeight: 500 }}
                    >
                      🎁 Gợi ý quà
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Wish reveal modal */}
      {revealedWish && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
          <div style={{ background: 'white', borderRadius: 20, maxWidth: 400, width: '100%', padding: '32px 28px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: '0 0 8px' }}>
              Gợi ý từ wishlist {isHim ? 'của em' : 'của anh'}
            </p>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', margin: '0 0 12px' }}>
              {revealedWish.title}
            </h2>
            {revealedWish.description && (
              <p style={{ fontSize: 14, color: '#6b7280', margin: '0 0 16px', lineHeight: 1.6 }}>
                {revealedWish.description}
              </p>
            )}
            {revealedWish.image_url && (
              <img src={revealedWish.image_url} alt="" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12, marginBottom: 16 }} />
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => { const r = partnerWishes[Math.floor(Math.random() * partnerWishes.length)]; setRevealedWish(r) }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', fontSize: 13, cursor: 'pointer', color: '#6b7280' }}
              >
                🎲 Random lại
              </button>
              <button
                onClick={() => { setRevealedWish(null); setRevealingId(null) }}
                style={{ flex: 1, padding: '10px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Đã biết rồi! 💕
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sorted.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📅</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>Chưa có ngày đặc biệt nào.</p>
          <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
            Thêm ngay
          </button>
        </div>
      )}

      {/* Date cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {sorted.map(date => {
          const daysUntil = getDaysUntil(date.date, date.repeat_yearly)
          const nextOcc = getNextOccurrence(date.date, date.repeat_yearly)
          const isToday = daysUntil === 0
          const isSoon = daysUntil <= 7

          return (
            <div key={date.id} style={{
              display: 'flex', alignItems: 'center', gap: 16,
              background: 'white', borderRadius: 16, padding: '16px 18px',
              border: '1.5px solid ' + (isToday ? '#fca5a5' : isSoon ? '#e9d5ff' : '#f3f4f6'),
              boxShadow: '0 1px 6px rgba(0,0,0,0.04)',
            }}>
              {/* Icon + countdown */}
              <div style={{ textAlign: 'center', flexShrink: 0, minWidth: 60 }}>
                <div style={{ fontSize: 28 }}>{getCategoryIcon(date.category)}</div>
                <div style={{
                  fontSize: 11, fontWeight: 700, marginTop: 4,
                  color: isToday ? '#ef4444' : isSoon ? '#7c3aed' : '#9ca3af',
                }}>
                  {isToday ? 'Hôm nay!' : daysUntil + ' ngày'}
                </div>
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e', margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {date.title}
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
                  {format(nextOcc, "dd 'tháng' MM", { locale: vi })}
                  {date.repeat_yearly ? ' · Hàng năm' : ' · Một lần'}
                </p>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                {partnerWishes.length > 0 && (
                  <button
                    onClick={() => handleRevealWish(date.id)}
                    style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #e9d5ff', background: '#faf5ff', color: '#7c3aed', fontSize: 12, cursor: 'pointer', fontWeight: 500 }}
                  >
                    🎁
                  </button>
                )}
                <button
                  onClick={() => handleDelete(date.id)}
                  style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid #fee2e2', background: 'white', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}
                >
                  🗑
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <AddDateModal
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

function AddDateModal({ userId, accent, accentBg, onClose, onAdded }: {
  userId: string, accent: string, accentBg: string,
  onClose: () => void, onAdded: (d: SpecialDate) => void
}) {
  const supabase = createClient()
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [category, setCategory] = useState('anniversary')
  const [repeatYearly, setRepeatYearly] = useState(true)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!title.trim() || !date) return
    setSaving(true)
    const { data } = await supabase.from('special_dates').insert({
      user_id: userId,
      title: title.trim(),
      date,
      category,
      repeat_yearly: repeatYearly,
    }).select().single()
    setSaving(false)
    if (data) onAdded(data as SpecialDate)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>📅 Thêm ngày đặc biệt</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <div style={{ padding: '20px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Tên ngày... VD: Ngày đầu yêu nhau *"
            autoFocus
            style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box', width: '100%' }}
            onFocus={e => e.target.style.borderColor = accent}
            onBlur={e => e.target.style.borderColor = '#e5e7eb'}
          />

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Ngày</label>
            <input
              type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = accent}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Category */}
          <div>
            <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: '0 0 8px' }}>Loại</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CATEGORIES.map(c => (
                <button key={c.value} onClick={() => setCategory(c.value)} style={{
                  padding: '6px 12px', borderRadius: 99, fontSize: 12,
                  border: '1.5px solid ' + (category === c.value ? accent : '#e5e7eb'),
                  background: category === c.value ? accentBg : 'white',
                  color: category === c.value ? accent : '#6b7280',
                  fontWeight: category === c.value ? 600 : 400, cursor: 'pointer',
                }}>
                  {c.icon} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Repeat yearly toggle */}
          <div
            onClick={() => setRepeatYearly(v => !v)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff', cursor: 'pointer' }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>🔁 Lặp lại hàng năm</p>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Nhắc nhở đúng ngày mỗi năm</p>
            </div>
            <div style={{ width: 40, height: 22, borderRadius: 99, background: repeatYearly ? '#7c3aed' : '#e5e7eb', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
              <div style={{ position: 'absolute', top: 2, left: repeatYearly ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}>Huỷ</button>
            <button onClick={handleSave} disabled={!title.trim() || !date || saving} style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: !title.trim() || !date ? '#f3f4f6' : 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: !title.trim() || !date ? '#9ca3af' : 'white', fontSize: 14, fontWeight: 600, cursor: !title.trim() || !date ? 'not-allowed' : 'pointer' }}>
              {saving ? 'Đang lưu...' : '📅 Thêm ngày'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
