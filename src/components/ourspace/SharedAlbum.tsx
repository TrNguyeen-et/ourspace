'use client'

import { useState, useEffect } from 'react'
import type { Media, Profile } from '@/types/database'

export default function SharedAlbum({ media, profile, partner, currentUserId }: {
  media: Media[]
  profile: Profile
  partner: Profile
  currentUserId: string
}) {
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [viewing, setViewing] = useState<Media | null>(null)
  const [filter, setFilter] = useState<'all' | 'photo' | 'video'>('all')

  // Fetch signed URLs in batches
  useEffect(() => {
    if (!media.length) return
    const paths = media.map(m => m.url)
    fetch('/api/media/signed-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paths }),
    }).then(r => r.json()).then(({ urls }) => {
      if (!urls) return
      const map: Record<string, string> = {}
      urls.forEach((item: { path: string; signedUrl: string }) => { map[item.path] = item.signedUrl })
      setSignedUrls(map)
    })
  }, [media.length])

  const filtered = media.filter(m => filter === 'all' ? true : m.type === filter)
  const photos = media.filter(m => m.type === 'photo')
  const videos = media.filter(m => m.type === 'video')

  if (media.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: 18, border: '1px solid #f0e8ff' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🖼️</div>
        <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 8 }}>Album chung chưa có ảnh nào.</p>
        <p style={{ color: '#c4b5fd', fontSize: 13 }}>Vào khu riêng → Ảnh & Video → hover ảnh → nhấn "✨ Chia sẻ"</p>
      </div>
    )
  }

  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '20px', boxShadow: '0 2px 16px rgba(168,85,247,0.06)', border: '1px solid #f0e8ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>🖼️ Album chung</h2>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { v: 'all', l: 'Tất cả (' + media.length + ')' },
            { v: 'photo', l: '📷 ' + photos.length },
            { v: 'video', l: '🎬 ' + videos.length },
          ].map(f => (
            <button key={f.v} onClick={() => setFilter(f.v as typeof filter)} style={{
              padding: '4px 10px', borderRadius: 99, fontSize: 12,
              border: '1px solid ' + (filter === f.v ? '#a855f7' : '#e5e7eb'),
              background: filter === f.v ? '#faf5ff' : 'white',
              color: filter === f.v ? '#7c3aed' : '#6b7280',
              cursor: 'pointer',
            }}>{f.l}</button>
          ))}
        </div>
      </div>

      {/* Masonry grid */}
      <div style={{ columns: '3 140px', gap: 8 }}>
        {filtered.map(item => {
          const url = signedUrls[item.url]
          const isMe = item.user_id === currentUserId
          const author = isMe ? profile : partner

          return (
            <div
              key={item.id}
              onClick={() => setViewing(item)}
              style={{ position: 'relative', borderRadius: 10, overflow: 'hidden', marginBottom: 8, breakInside: 'avoid', cursor: 'pointer', background: '#f3f4f6', aspectRatio: item.type === 'video' ? '16/9' : undefined }}
            >
              {item.type === 'video' ? (
                <div style={{ position: 'relative', background: '#1a1a2e', height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {url && <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', inset: 0 }} preload="metadata" />}
                  <div style={{ position: 'absolute', background: 'rgba(0,0,0,0.4)', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12 }}>▶</div>
                </div>
              ) : url ? (
                <img src={url} alt={item.caption ?? ''} style={{ width: '100%', display: 'block' }} loading="lazy" />
              ) : (
                <div style={{ height: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#fdf4ff,#fce7f3)', fontSize: 24 }}>🖼️</div>
              )}

              {/* Author badge */}
              <div style={{ position: 'absolute', bottom: 4, left: 4, background: 'rgba(0,0,0,0.55)', borderRadius: 99, padding: '2px 6px', fontSize: 10, color: 'white' }}>
                {author.name?.split(' ').pop()}
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {viewing && (
        <div
          onClick={() => setViewing(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px', flexShrink: 0 }} onClick={e => e.stopPropagation()}>
            <div>
              {viewing.caption && <p style={{ color: 'white', fontSize: 14, margin: 0, fontWeight: 500 }}>{viewing.caption}</p>}
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
                do {viewing.user_id === currentUserId ? profile.name : partner.name} chia sẻ
              </p>
            </div>
            <button onClick={() => setViewing(null)} style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13 }}>✕ Đóng</button>
          </div>

          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 20px' }} onClick={e => e.stopPropagation()}>
            {!signedUrls[viewing.url] ? (
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 48 }}>🖼️</div>
            ) : viewing.type === 'video' ? (
              <video src={signedUrls[viewing.url]} controls autoPlay style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }} />
            ) : (
              <img src={signedUrls[viewing.url]} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }} />
            )}
          </div>

          {/* Navigate */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, paddingBottom: 20 }} onClick={e => e.stopPropagation()}>
            <button
              onClick={() => { const idx = filtered.findIndex(m => m.id === viewing.id); if (idx > 0) setViewing(filtered[idx - 1]) }}
              style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
            >← Trước</button>
            <button
              onClick={() => { const idx = filtered.findIndex(m => m.id === viewing.id); if (idx < filtered.length - 1) setViewing(filtered[idx + 1]) }}
              style={{ border: 'none', background: 'rgba(255,255,255,0.1)', color: 'white', borderRadius: 8, padding: '8px 16px', cursor: 'pointer' }}
            >Tiếp →</button>
          </div>
        </div>
      )}
    </div>
  )
}
