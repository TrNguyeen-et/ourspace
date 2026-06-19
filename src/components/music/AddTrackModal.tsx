'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/types/database'

type Tab = 'upload' | 'youtube'

export default function AddTrackModal({ userId, role, accent, onClose, onAdded }: {
  userId: string, role: 'him' | 'her', accent: string,
  onClose: () => void, onAdded: (track: Media) => void
}) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>('upload')

  // Upload state
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [inPool, setInPool] = useState(false)
  const [uploading, setUploading] = useState(false)

  // YouTube state
  const [ytUrl, setYtUrl] = useState('')
  const [ytMeta, setYtMeta] = useState<{ videoId: string; title: string; artist: string; thumbnail: string; embedUrl: string } | null>(null)
  const [ytLoading, setYtLoading] = useState(false)
  const [ytError, setYtError] = useState('')

  async function fetchYoutubeMeta() {
    if (!ytUrl.trim()) return
    setYtLoading(true); setYtError('')
    const res = await fetch('/api/music/youtube-meta?url=' + encodeURIComponent(ytUrl))
    const data = await res.json()
    if (data.error) { setYtError('Không lấy được thông tin video. Kiểm tra link nhé.'); setYtLoading(false); return }
    setYtMeta(data)
    setTitle(data.title); setArtist(data.artist)
    setYtLoading(false)
  }

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${userId}/music/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const { error: upErr } = await supabase.storage
      .from('private-media').upload(path, file, { cacheControl: '3600' })
    if (upErr) { setUploading(false); return }

    const caption = JSON.stringify({ title: title || file.name, artist: artist || '' })
    const { data: track } = await supabase.from('media').insert({
      user_id: userId, url: path, type: 'music',
      caption, thumbnail_url: null,
      is_in_shared_pool: inPool, is_in_shared_album: false, source: 'upload',
    }).select().single()

    setUploading(false)
    if (track) onAdded(track)
  }

  async function handleAddYoutube() {
    if (!ytMeta) return
    setUploading(true)
    const caption = JSON.stringify({ title: title || ytMeta.title, artist: artist || ytMeta.artist })
    const { data: track } = await supabase.from('media').insert({
      user_id: userId,
      url: ytMeta.embedUrl,  // lưu embed URL, không cần storage
      type: 'music',
      caption,
      thumbnail_url: ytMeta.thumbnail,
      is_in_shared_pool: inPool, is_in_shared_album: false,
      source: 'youtube',
    }).select().single()

    setUploading(false)
    if (track) onAdded(track)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Thêm nhạc</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, padding: '16px 24px 0', borderBottom: '1px solid #f3f4f6' }}>
          {([['upload', '📁 Upload file'], ['youtube', '🔗 YouTube']] as [Tab, string][]).map(([v, l]) => (
            <button key={v} onClick={() => setTab(v)} style={{
              padding: '8px 20px', fontSize: 13, fontWeight: tab === v ? 600 : 400,
              border: 'none', borderBottom: '2px solid ' + (tab === v ? accent : 'transparent'),
              background: 'none', color: tab === v ? accent : '#6b7280', cursor: 'pointer',
            }}>{l}</button>
          ))}
        </div>

        <div style={{ padding: '20px 24px 24px' }}>
          {tab === 'upload' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* File picker */}
              <div
                onClick={() => document.getElementById('music-file-input')?.click()}
                style={{ border: '2px dashed ' + (file ? accent : '#d1d5db'), borderRadius: 12, padding: '20px', textAlign: 'center', cursor: 'pointer', background: file ? '#faf5ff' : '#fafafa' }}
              >
                {file ? (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>🎵</div>
                    <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: '0 0 2px' }}>{file.name}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                  </>
                ) : (
                  <>
                    <div style={{ fontSize: 28, marginBottom: 6 }}>📁</div>
                    <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>Click để chọn file nhạc</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: '4px 0 0' }}>MP3, M4A, WAV, FLAC · Tối đa 50MB</p>
                  </>
                )}
                <input id="music-file-input" type="file" accept="audio/*" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); if (!title) setTitle(f.name.replace(/\.[^.]+$/, '')) } }} />
              </div>

              <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên bài hát"
                style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
              <input type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Ca sĩ / nghệ sĩ"
                style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />

              <PoolToggle inPool={inPool} onChange={setInPool} accent={accent} />

              <button onClick={handleUpload} disabled={!file || uploading} style={{ padding: '11px', borderRadius: 10, border: 'none', background: !file ? '#f3f4f6' : 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: !file ? '#9ca3af' : 'white', fontSize: 14, fontWeight: 600, cursor: !file ? 'not-allowed' : 'pointer' }}>
                {uploading ? 'Đang upload...' : 'Thêm vào kho nhạc'}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* YouTube URL */}
              <div style={{ display: 'flex', gap: 8 }}>
                <input type="text" value={ytUrl} onChange={e => setYtUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..."
                  onKeyDown={e => e.key === 'Enter' && fetchYoutubeMeta()}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                  onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                <button onClick={fetchYoutubeMeta} disabled={ytLoading || !ytUrl.trim()} style={{ padding: '10px 16px', borderRadius: 10, border: 'none', background: accent, color: 'white', fontSize: 13, fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
                  {ytLoading ? '...' : 'Lấy info'}
                </button>
              </div>

              {ytError && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>{ytError}</p>}

              {/* Preview */}
              {ytMeta && (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#fef9ee', borderRadius: 12, padding: '12px', border: '1px solid #fde68a' }}>
                  <img src={ytMeta.thumbnail} alt="" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ytMeta.title}</p>
                    <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>{ytMeta.artist}</p>
                  </div>
                  <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: '#fef3c7', color: '#b45309' }}>YouTube</span>
                </div>
              )}

              {ytMeta && (
                <>
                  <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="Tên bài hát"
                    style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  <input type="text" value={artist} onChange={e => setArtist(e.target.value)} placeholder="Ca sĩ / nghệ sĩ"
                    style={{ padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none' }}
                    onFocus={e => e.target.style.borderColor = accent} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
                  <PoolToggle inPool={inPool} onChange={setInPool} accent={accent} />
                  <button onClick={handleAddYoutube} disabled={uploading} style={{ padding: '11px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
                    {uploading ? 'Đang lưu...' : 'Thêm vào kho nhạc'}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PoolToggle({ inPool, onChange, accent }: { inPool: boolean, onChange: (v: boolean) => void, accent: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', borderRadius: 10, background: '#faf5ff', border: '1px solid #e9d5ff' }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, color: '#374151', margin: 0 }}>🎲 Vào khu chung ngay</p>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Bài này sẽ được random khi mở OurSpace</p>
      </div>
      <div onClick={() => onChange(!inPool)} style={{ width: 40, height: 22, borderRadius: 99, cursor: 'pointer', background: inPool ? '#7c3aed' : '#e5e7eb', position: 'relative', transition: 'background .2s', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 2, left: inPool ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
      </div>
    </div>
  )
}
