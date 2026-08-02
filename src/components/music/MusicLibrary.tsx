'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Media } from '@/types/database'
import AddTrackModal from './AddTrackModal'
import MusicPlayer from './MusicPlayer'

export default function MusicLibrary({ tracks: initialTracks, role, userId }: {
  tracks: Media[], role: 'him' | 'her', userId: string
}) {
  const supabase = createClient()
  const [tracks, setTracks] = useState(initialTracks)
  const [playing, setPlaying] = useState<Media | null>(null)
  const [playingUrl, setPlayingUrl] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pool'>('all')
  const [showAdd, setShowAdd] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const isHim = role === 'him'
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'
  const poolCount = tracks.filter(t => t.is_in_shared_pool).length

  async function getSignedUrl(track: Media): Promise<string | null> {
    if (track.source === 'youtube') {
      // YouTube: dùng embed URL lưu trong url field
      return track.url
    }
    const res = await fetch('/api/music/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: track.url }),
    })
    const { signedUrl } = await res.json()
    return signedUrl || null
  }

  async function handlePlay(track: Media) {
    if (playing?.id === track.id) {
      setPlaying(null); setPlayingUrl(null); return
    }
    setLoadingId(track.id)
    const url = await getSignedUrl(track)
    setPlayingUrl(url)
    setPlaying(track)
    setLoadingId(null)
  }

  async function handleTogglePool(track: Media) {
    setTogglingId(track.id)
    await fetch('/api/music/toggle-pool', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackId: track.id, inPool: !track.is_in_shared_pool }),
    })
    setTracks(prev => prev.map(t =>
      t.id === track.id ? { ...t, is_in_shared_pool: !t.is_in_shared_pool } : t
    ))
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

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>
            🎵 Kho nhạc {isHim ? 'của anh' : 'của em'}
          </h1>
          <p style={{ color: '#9ca3af', fontSize: 14, margin: '4px 0 0' }}>
            {tracks.length} bài · {poolCount} bài trong khu chung
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          style={{ padding: '10px 20px', borderRadius: 12, background: 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: 'white', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
        >
          + Thêm nhạc
        </button>
      </div>

      {/* Pool info banner */}
      <div style={{ background: 'linear-gradient(135deg, #faf5ff, ' + accentBg + ')', borderRadius: 14, padding: '14px 18px', marginBottom: 24, border: '1px solid #e9d5ff', display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 24 }}>🎲</span>
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#7c3aed', margin: 0 }}>Khu chung — Random nhạc</p>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0' }}>
            Bật toggle <strong>Khu chung</strong> để bài nhạc vào pool random. Khi ai mở OurSpace, hệ thống sẽ random 1 bài từ pool của cả 2.
          </p>
        </div>
        <div style={{ marginLeft: 'auto', textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 22, fontWeight: 700, color: '#7c3aed' }}>{poolCount}</div>
          <div style={{ fontSize: 11, color: '#9ca3af' }}>bài trong pool</div>
        </div>
      </div>

      {/* Filter */}
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

      {/* Empty state */}
      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🎵</div>
          <p style={{ color: '#9ca3af', fontSize: 15 }}>
            {filter === 'pool' ? 'Chưa có bài nào trong khu chung.' : 'Kho nhạc trống. Thêm bài đầu tiên nhé!'}
          </p>
          {filter === 'all' && (
            <button onClick={() => setShowAdd(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: accent, color: 'white', border: 'none', fontSize: 14, cursor: 'pointer' }}>
              Thêm nhạc
            </button>
          )}
        </div>
      )}

      {/* Track list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map((track, idx) => (
          <TrackRow
            key={track.id}
            track={track}
            index={idx + 1}
            isPlaying={playing?.id === track.id}
            isLoading={loadingId === track.id}
            isToggling={togglingId === track.id}
            accent={accent}
            accentBg={accentBg}
            onPlay={() => handlePlay(track)}
            onTogglePool={() => handleTogglePool(track)}
            onDelete={() => handleDelete(track)}
          />
        ))}
      </div>

      {/* Modals */}
      {showAdd && (
        <AddTrackModal
          userId={userId}
          role={role}
          accent={accent}
          onClose={() => setShowAdd(false)}
          onAdded={handleAdded}
        />
      )}

      {/* Sticky player */}
      {playing && playingUrl && (
        <MusicPlayer
          track={playing}
          signedUrl={playingUrl}
          accent={accent}
          onClose={() => { setPlaying(null); setPlayingUrl(null) }}
          onNext={() => {
            const idx = tracks.findIndex(t => t.id === playing.id)
            const next = tracks[(idx + 1) % tracks.length]
            if (next) handlePlay(next)
          }}
          onPrev={() => {
            const idx = tracks.findIndex(t => t.id === playing.id)
            const prev = tracks[(idx - 1 + tracks.length) % tracks.length]
            if (prev) handlePlay(prev)
          }}
        />
      )}
    </div>
  )
}

function TrackRow({ track, index, isPlaying, isLoading, isToggling, accent, accentBg, onPlay, onTogglePool, onDelete }: {
  track: Media, index: number, isPlaying: boolean, isLoading: boolean, isToggling: boolean,
  accent: string, accentBg: string,
  onPlay: () => void, onTogglePool: () => void, onDelete: () => void
}) {
  const [hovered, setHovered] = useState(false)
  const caption = track.caption ? JSON.parse(track.caption) : {}

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px', borderRadius: 12,
        background: isPlaying ? accentBg : hovered ? '#fafafa' : 'white',
        border: '1px solid ' + (isPlaying ? accent + '40' : '#f3f4f6'),
        transition: 'all .15s',
      }}
    >
      {/* Thumbnail / Play button */}
      <div
        onClick={onPlay}
        style={{
          width: 44, height: 44, borderRadius: 8, overflow: 'hidden', flexShrink: 0,
          cursor: 'pointer', position: 'relative', background: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {track.thumbnail_url ? (
          <img src={track.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ fontSize: 20 }}>🎵</span>
        )}
        {/* Overlay */}
        {(hovered || isPlaying || isLoading) && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8 }}>
            <span style={{ color: 'white', fontSize: 14 }}>
              {isLoading ? '...' : isPlaying ? '⏸' : '▶'}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: 14, fontWeight: isPlaying ? 600 : 400, color: isPlaying ? accent : '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {caption.title || track.caption || 'Bài nhạc ' + index}
        </p>
        <p style={{ fontSize: 12, color: '#9ca3af', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {caption.artist || (track.source === 'youtube' ? '🔗 YouTube' : '📁 File upload')}
        </p>
      </div>

      {/* Source badge */}
      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 99, background: track.source === 'youtube' ? '#fef3c7' : '#f0fdf4', color: track.source === 'youtube' ? '#b45309' : '#16a34a', flexShrink: 0 }}>
        {track.source === 'youtube' ? 'YouTube' : 'Upload'}
      </span>

      {/* Pool toggle */}
      <div
        onClick={onTogglePool}
        title={track.is_in_shared_pool ? 'Bỏ khỏi khu chung' : 'Thêm vào khu chung'}
        style={{
          width: 40, height: 22, borderRadius: 99, cursor: isToggling ? 'wait' : 'pointer',
          background: track.is_in_shared_pool ? '#7c3aed' : '#e5e7eb',
          position: 'relative', flexShrink: 0, transition: 'background .2s',
        }}
      >
        <div style={{
          position: 'absolute', top: 2, left: track.is_in_shared_pool ? 20 : 2,
          width: 18, height: 18, borderRadius: '50%', background: 'white',
          boxShadow: '0 1px 4px rgba(0,0,0,0.2)', transition: 'left .2s',
        }} />
      </div>

      {/* Delete */}
      {hovered && (
        <button
          onClick={onDelete}
          style={{ padding: '4px 8px', borderRadius: 6, border: 'none', background: '#fee2e2', color: '#ef4444', fontSize: 12, cursor: 'pointer', flexShrink: 0 }}
        >
          🗑
        </button>
      )}
    </div>
  )
}
