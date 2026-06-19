'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/types/database'
import MediaViewer from './MediaViewer'
import UploadZone from './UploadZone'

export default function MediaGallery({ media: initialMedia, role, userId }: {
  media: Media[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [media, setMedia] = useState(initialMedia)
  const [filter, setFilter] = useState<'all' | 'photo' | 'video' | 'shared'>('all')
  const [viewing, setViewing] = useState<Media | null>(null)
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({})
  const [uploading, setUploading] = useState(false)
  const [pushing, setPushing] = useState<string | null>(null)
  const [showUpload, setShowUpload] = useState(false)

  const isHim = role === 'him'
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'

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

  async function handleUpload(files: File[], captions: Record<string, string>) {
    setUploading(true)
    const uploaded: Media[] = []
    for (const file of files) {
      const isVideo = file.type.startsWith('video/')
      const ext = file.name.split('.').pop()
      const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
      const { error } = await supabase.storage.from('private-media').upload(path, file, { cacheControl: '3600' })
      if (error) continue
      const { data: inserted } = await supabase.from('media').insert({
        user_id: userId, url: path,
        type: isVideo ? 'video' : 'photo',
        caption: captions[file.name] || null,
        is_in_shared_pool: false, is_in_shared_album: false, source: 'upload',
      }).select().single()
      if (inserted) uploaded.push(inserted)
    }
    setMedia(prev => [...uploaded, ...prev])
    setShowUpload(false)
    setUploading(false)
  }

  async function handlePushShared(item: Media) {
    setPushing(item.id)
    await fetch('/api/media/push-shared', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mediaId: item.id, push: !item.is_in_shared_album }),
    })
    setMedia(prev => prev.map(m => m.id === item.id ? { ...m, is_in_shared_album: !m.is_in_shared_album } : m))
    if (viewing?.id === item.id) setViewing(prev => prev ? { ...prev, is_in_shared_album: !prev.is_in_shared_album } : null)
    setPushing(null)
  }

  async function handleDelete(item: Media) {
    if (!confirm('Xoá ảnh/video này?')) return
    await supabase.storage.from('private-media').remove([item.url])
    await supabase.from('media').delete().eq('id', item.id)
    setMedia(prev => prev.filter(m => m.id !== item.id))
    if (viewing?.id === item.id) setViewing(null)
  }

  const filtered = media.filter(m => {
    if (filter === 'all') return true
    if (filter === 'shared') return m.is_in_shared_album
    return m.type === filter
  })

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            🖼️ Ảnh & Video {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {media.filter(m => m.type === 'photo').length} ảnh · {media.filter(m => m.type === 'video').length} video
          </p>
        </div>
        <button onClick={() => setShowUpload(true)} style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Upload
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {[
          { v: 'all', l: 'Tất cả (' + media.length + ')' },
          { v: 'photo', l: '📷 Ảnh (' + media.filter(m => m.type === 'photo').length + ')' },
          { v: 'video', l: '🎬 Video (' + media.filter(m => m.type === 'video').length + ')' },
          { v: 'shared', l: '✨ Đã chia sẻ (' + media.filter(m => m.is_in_shared_album).length + ')' },
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

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>📸</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>Chưa có gì ở đây.</p>
          {filter === 'all' && (
            <button onClick={() => setShowUpload(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Upload ảnh đầu tiên
            </button>
          )}
        </div>
      )}

      {filtered.length > 0 && (
        <div style={{ columns: '3 200px', gap: 10 }}>
          {filtered.map(item => (
            <MediaCard key={item.id} item={item} signedUrl={signedUrls[item.url]} accent={accent}
              pushing={pushing === item.id} onView={() => setViewing(item)}
              onPush={() => handlePushShared(item)} onDelete={() => handleDelete(item)} />
          ))}
        </div>
      )}

      {showUpload && <UploadZone onUpload={handleUpload} onClose={() => setShowUpload(false)} uploading={uploading} accent={accent} />}
      {viewing && <MediaViewer item={viewing} signedUrl={signedUrls[viewing.url]} onClose={() => setViewing(null)}
        onPush={() => handlePushShared(viewing)} onDelete={() => handleDelete(viewing)} pushing={pushing === viewing.id} />}
    </div>
  )
}

function MediaCard({ item, signedUrl, accent, pushing, onView, onPush, onDelete }: {
  item: Media, signedUrl?: string, accent: string, pushing: boolean,
  onView: () => void, onPush: () => void, onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', marginBottom: 10, breakInside: 'avoid', cursor: 'pointer', background: '#f3f4f6', boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)', transform: hovered ? 'translateY(-2px)' : 'none', transition: 'all .2s' }}
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onClick={onView}>
      {item.type === 'video' ? (
        <div style={{ position: 'relative' }}>
          {signedUrl ? <video src={signedUrl} style={{ width: '100%', display: 'block' }} preload="metadata" /> : <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e' }}><span style={{ fontSize: 32 }}>🎬</span></div>}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', background: 'rgba(0,0,0,0.5)', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 16, color: 'white' }}>▶</span>
          </div>
        </div>
      ) : signedUrl ? (
        <img src={signedUrl} alt={item.caption || ''} style={{ width: '100%', display: 'block' }} loading="lazy" />
      ) : (
        <div style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f7ff' }}><span style={{ fontSize: 28, opacity: 0.4 }}>🖼️</span></div>
      )}
      {hovered && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 10 }} onClick={e => e.stopPropagation()}>
          {item.caption && <p style={{ color: 'white', fontSize: 12, margin: '0 0 8px', lineHeight: 1.4 }}>{item.caption}</p>}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={e => { e.stopPropagation(); onPush() }} disabled={pushing} style={{ flex: 1, padding: '5px 8px', borderRadius: 7, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer', background: item.is_in_shared_album ? '#fde68a' : 'white', color: item.is_in_shared_album ? '#b45309' : accent }}>
              {pushing ? '...' : item.is_in_shared_album ? '↩ Bỏ chia sẻ' : '✨ Chia sẻ'}
            </button>
            <button onClick={e => { e.stopPropagation(); onDelete() }} style={{ padding: '5px 8px', borderRadius: 7, fontSize: 11, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}>🗑</button>
          </div>
        </div>
      )}
      {item.is_in_shared_album && <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(124,58,237,0.85)', borderRadius: 99, padding: '2px 8px', fontSize: 10, color: 'white', fontWeight: 600 }}>✨ Chung</div>}
    </div>
  )
}
