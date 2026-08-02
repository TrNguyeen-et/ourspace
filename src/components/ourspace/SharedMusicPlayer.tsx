'use client'

import { useState, useRef, useEffect } from 'react'
import type { Media, Profile } from '@/types/database'

export default function SharedMusicPlayer({ musicPool, profile, partner, currentUserId }: {
  musicPool: Media[]
  profile: Profile
  partner: Profile
  currentUserId: string
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [current, setCurrent] = useState<Media | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [minimized, setMinimized] = useState(false)
  const [showYT, setShowYT] = useState(false)

  // Auto-pick random song on mount
  useEffect(() => {
    if (musicPool.length > 0 && !current) {
      pickRandom()
    }
  }, [musicPool.length])

  async function pickRandom(pool?: Media[]) {
    const source = pool ?? musicPool
    if (!source.length) return
    const pick = source[Math.floor(Math.random() * source.length)]
    setCurrent(pick)

    if (pick.source === 'youtube') {
      setSignedUrl(pick.url)
      setShowYT(true)
      return
    }

    // Get signed URL for upload
    const res = await fetch('/api/music/signed-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: pick.url }),
    })
    const { signedUrl: url } = await res.json()
    setSignedUrl(url)
    setShowYT(false)
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !signedUrl || current?.source === 'youtube') return
    audio.src = signedUrl
    audio.play().then(() => setPlaying(true)).catch(() => {})
    audio.ontimeupdate = () => setProgress(audio.currentTime)
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.onended = () => pickRandom()
  }, [signedUrl])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00'
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
  }

  if (!current || musicPool.length === 0) return null

  const caption = (() => { try { return JSON.parse(current.caption ?? '{}') } catch { return {} } })()
  const whoChose = current.user_id === currentUserId ? profile.name : partner.name
  const isYT = current.source === 'youtube'

  return (
    <>
      {/* YouTube iframe */}
      {isYT && showYT && !minimized && (
        <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 300, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 260, height: 148 }}>
          <iframe src={signedUrl + '?autoplay=1'} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" />
        </div>
      )}

      {/* Player bar */}
      <div style={{
        position: 'fixed', top: 0, left: 220, right: 0, zIndex: 150,
        background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid #f0e8ff',
        boxShadow: '0 2px 20px rgba(168,85,247,0.1)',
        padding: minimized ? '8px 20px' : '10px 20px',
        transition: 'padding .2s',
      }}>
        {!minimized && !isYT && (
          <input type="range" min={0} max={duration || 100} step={0.1} value={progress}
            onChange={e => { const t = Number(e.target.value); setProgress(t); if (audioRef.current) audioRef.current.currentTime = t }}
            style={{ width: '100%', height: 3, marginBottom: 8, accentColor: '#a855f7', cursor: 'pointer', display: 'block' }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Thumbnail */}
          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {current.thumbnail_url
              ? <img src={current.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 16 }}>🎵</span>}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {caption.title || 'Bài nhạc'}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
              {caption.artist && caption.artist + ' · '}
              <span style={{ color: '#a855f7' }}>do {whoChose} chọn</span>
              {!isYT && duration > 0 && ` · ${fmt(progress)}/${fmt(duration)}`}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {!isYT && (
              <button onClick={togglePlay} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#a855f7,#ec4899)', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {playing ? '⏸' : '▶'}
              </button>
            )}
            <button onClick={() => pickRandom()} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af' }} title="Random bài khác">🎲</button>
            {isYT && (
              <button onClick={() => setShowYT(v => !v)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}>
                {showYT ? 'Ẩn' : 'Video'}
              </button>
            )}
            <button onClick={() => setMinimized(v => !v)} style={{ border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', color: '#9ca3af' }}>
              {minimized ? '⌄' : '⌃'}
            </button>
          </div>
        </div>
      </div>

      {/* Spacer for fixed bar */}
      <div style={{ height: minimized ? 52 : (isYT ? 60 : 72) }} />

      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  )
}
