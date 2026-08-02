'use client'

import { useState, useRef, useEffect } from 'react'
import type { Media } from '@/types/database'

export default function MusicPlayer({ track, signedUrl, accent, onClose, onNext, onPrev }: {
  track: Media, signedUrl: string, accent: string,
  onClose: () => void, onNext: () => void, onPrev: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showYT, setShowYT] = useState(false)

  const isYoutube = track.source === 'youtube'
  const caption = track.caption ? (() => { try { return JSON.parse(track.caption!) } catch { return {} } })() : {}
  const trackTitle = caption.title || track.caption || 'Bài nhạc'
  const trackArtist = caption.artist || ''

  useEffect(() => {
    if (isYoutube) { setShowYT(true); return }
    const audio = audioRef.current
    if (!audio) return
    audio.src = signedUrl
    audio.volume = volume
    audio.play().catch(() => setPlaying(false))
    setPlaying(true)
    audio.ontimeupdate = () => setProgress(audio.currentTime)
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.onended = () => onNext()
  }, [signedUrl, track.id])

  function togglePlay() {
    const audio = audioRef.current
    if (!audio) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const t = Number(e.target.value)
    if (audioRef.current) audioRef.current.currentTime = t
    setProgress(t)
  }

  function fmt(s: number) {
    if (!isFinite(s)) return '0:00'
    const m = Math.floor(s / 60), sec = Math.floor(s % 60)
    return m + ':' + String(sec).padStart(2, '0')
  }

  return (
    <>
      {/* YouTube embed (hidden iframe for audio) */}
      {isYoutube && showYT && (
        <div style={{ position: 'fixed', bottom: 90, right: 20, zIndex: 300, borderRadius: 12, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 280, height: 158 }}>
          <iframe
            src={signedUrl + '?autoplay=1&controls=1'}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
            allowFullScreen
          />
        </div>
      )}

      {/* Player bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 220, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderTop: '1px solid #f0e8ff',
        boxShadow: '0 -4px 24px rgba(168,85,247,0.1)',
        padding: '10px 24px',
      }}>
        {/* Progress bar */}
        {!isYoutube && (
          <input
            type="range" min={0} max={duration || 100} step={0.1} value={progress}
            onChange={seek}
            style={{ width: '100%', height: 3, marginBottom: 8, accentColor: accent, cursor: 'pointer' }}
          />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Thumbnail */}
          <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: '#f3f4f6', flexShrink: 0 }}>
            {track.thumbnail_url
              ? <img src={track.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎵</div>
            }
          </div>

          {/* Track info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {trackTitle}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
              {trackArtist}{!isYoutube && duration > 0 && ` · ${fmt(progress)} / ${fmt(duration)}`}
              {isYoutube && ' · YouTube'}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={onPrev} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>⏮</button>
            {!isYoutube && (
              <button onClick={togglePlay} style={{ width: 36, height: 36, borderRadius: '50%', border: 'none', background: accent, color: 'white', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {playing ? '⏸' : '▶'}
              </button>
            )}
            <button onClick={onNext} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>⏭</button>

            {/* Volume */}
            {!isYoutube && (
              <input type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v }}
                style={{ width: 70, accentColor: accent }} />
            )}

            {isYoutube && (
              <button onClick={() => setShowYT(v => !v)} style={{ padding: '5px 10px', borderRadius: 7, border: '1px solid #e5e7eb', background: 'white', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}>
                {showYT ? 'Ẩn' : 'Hiện'} video
              </button>
            )}

            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
          </div>
        </div>

        <audio ref={audioRef} style={{ display: 'none' }} />
      </div>
    </>
  )
}
