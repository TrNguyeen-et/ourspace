'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/types/database'
import AddTrackModal from './AddTrackModal'
import MusicPlayer from './MusicPlayer'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getAudioUrl(track: Media): string {
  if (track.source === 'youtube') return track.url
  if (track.url.startsWith('http')) return track.url
  return `${SUPABASE_URL}/storage/v1/object/public/private-media/${track.url}`
}

export default function MusicLibrary({ tracks: initialTracks, role, userId }: {
  tracks: Media[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [tracks, setTracks] = useState(initialTracks)
  const [playing, setPlaying] = useState<Media | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pool'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isHim = role === 'him'
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'
  const poolCount = tracks.filter(t => t.is_in_shared_pool).length

  function handlePlay(track: Media) {
    if (playing?.id === track.id) { setPlaying(null); setPlayingUrl(null); return }
    const url = getAudioUrl(track)
    setPlayingUrl(url)
    setPlaying(track)
  }

  async function handleTogglePool(track: Media) {
    setTogglingId(track.id)
    await supabase.from('media').update({ is_in_shared_pool: !track.is_in_shared_pool }).eq('id', track.id)
    setTracks(prev => prev.map(t => t.id === track.id ? { ...t, is_in_shared_pool: !t.is_in_shared_pool } : t))
    setTogglingId(null)
  }

  async function handleDelete(track: Media) {
    if (!confirm('Xoá bài này?')) return
    if (track.source !== 'youtube') {
      await supabase.storage.from('private-media').remove([track.url])
    }
    await supabase.from('media').delete().eq('id', track.id)
    setTracks(prev => prev.filter(t => t.id !== track.id))
    if (playing?.id === track.id) { setPlaying(null); setPlayingUrl(null) }
  }

  function handleAdded(newTrack: Media) {
    setTracks(prev => [newTrack, ...prev])
    setShowAdd(false)
  }

  const filtered = filter === 'pool' ? tracks.filter(t => t.is_in_shared_pool) : tracks

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 24px', paddingBottom: playing ? 120 : 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            🎵 Kho nhạc {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {tracks.length} bài · {poolCount} bài trong khu chung
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          + Thêm nhạc
        </button>
      </div>

      <div style={{ background: 'linear-gradient(135deg, #faf5ff, ' + accentBg + ')', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🎲</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', margin: 0 }}>Khu chung — Random nhạc</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>Bật toggle để bài vào pool random khi mở OurSpace</p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>{poolCount}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>bài trong pool</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[
          { v: 'all', l: 'Tất cả (' + tracks.length + ')' },
          { v: 'pool', l: '🎲 Khu chung (' + poolCount + ')' },
        ].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v as typeof filter)} style={{
            padding: '6px 16px', borderRadius: 99, fontSize: 13,
            border: '1.5px solid ' + (filter === f.v ? accent : '#e5e7eb'),
            background: filter === f.v ? accentBg : 'white',
            color: filter === f.v ? accent : '#6b7280',
            fontWeight: filter === f.v ? 600 : 400, cursor: 'pointer',
          }}>{f.l}</button>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎵</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            {filter === 'pool' ? 'Chưa có bài nào trong khu chung.' : 'Kho nhạc trống!'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Thêm nhạc
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((track, idx) => {
          const caption = (() => { try { return JSON.parse(track.caption ?? '{}') } catch { return {} } })()
          const isPlaying = playing?.id === track.id
          return (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 12, background: isPlaying ? accentBg : 'white', border: '1px solid ' + (isPlaying ? accent + '40' : '#f3f4f6'), transition: 'all .15s' }}>
              <div onClick={() => handlePlay(track)} style={{ width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {track.thumbnail_url ? <img src={track.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: 20 }}>🎵</span>}
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, opacity: isPlaying ? 1 : 0, transition: 'opacity .15s' }}>
                  <span style={{ color: 'white', fontSize: 14 }}>{isPlaying ? '⏸' : '▶'}</span>
                </div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: isPlaying ? 600 : 400, color: isPlaying ? accent : '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {caption.title || track.caption || 'Bài nhạc ' + (idx + 1)}
                </p>
                <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {caption.artist || (track.source === 'youtube' ? '🔗 YouTube' : '📁 Upload')}
                </p>
              </div>
              <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: track.source === 'youtube' ? '#fef3c7' : '#f0fdf4', color: track.source === 'youtube' ? '#b45309' : '#16a34a', flexShrink: 0 }}>
                {track.source === 'youtube' ? 'YouTube' : 'Upload'}
              </span>
              <div onClick={() => handleTogglePool(track)} style={{ width: 40, height: 22, borderRadius: 99, cursor: 'pointer', background: track.is_in_shared_pool ? '#7c3aed' : '#e5e7eb', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
                <div style={{ position: 'absolute', top: 2, left: track.is_in_shared_pool ? 20 : 2, width: 18, height: 18, borderRadius: '50%', background: 'white', boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s' }} />
              </div>
              <button onClick={() => handleDelete(track)} style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#ef4444', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}>🗑</button>
            </div>
          )
        })}
      </div>

      {showAdd && <AddTrackModal userId={userId} role={role} accent={accent} onClose={() => setShowAdd(false)} onAdded={handleAdded} />}
      {playing && playingUrl && (
        <MusicPlayer track={playing} signedUrl={playingUrl} accent={accent}
          onClose={() => { setPlaying(null); setPlayingUrl(null) }}
          onNext={() => { const idx = tracks.findIndex(t => t.id === playing.id); const next = tracks[(idx + 1) % tracks.length]; if (next) handlePlay(next) }}
          onPrev={() => { const idx = tracks.findIndex(t => t.id === playing.id); const prev = tracks[(idx - 1 + tracks.length) % tracks.length]; if (prev) handlePlay(prev) }}
        />
      )}
    </div>
  )
}
