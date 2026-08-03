'use client'

import { useState, useRef, useEffect } from 'react'
import type { Media } from '@/types/database'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getAudioUrl(track: Media): string {
  if (track.source === 'youtube') return track.url
  if (track.url.startsWith('http')) return track.url
  return `${SUPABASE_URL}/storage/v1/object/public/private-media/${track.url}`
}

export default function MusicPlayer({ track, signedUrl, accent, onClose, onNext, onPrev }: {
  track: Media, signedUrl: string, accent: string,
  onClose: () => void, onNext: () => void, onPrev: () => void
}) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [minimized, setMinimized] = useState(false)
  const [showYT, setShowYT] = useState(false)

  const isYT = track.source === 'youtube'
  const audioUrl = getAudioUrl(track)
  const caption = (() => { try { return JSON.parse(track.caption ?? '{}') } catch { return {} } })()

  useEffect(() => {
    if (isYT) { setShowYT(true); return }
    const audio = audioRef.current
    if (!audio) return
    audio.src = audioUrl
    audio.volume = volume
    audio.play().catch(() => setPlaying(false))
    setPlaying(true)
    audio.ontimeupdate = () => setProgress(audio.currentTime)
    audio.onloadedmetadata = () => setDuration(audio.duration)
    audio.onended = () => onNext()
    return () => { audio.pause() }
  }, [audioUrl, track.id])

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
    return Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
  }

  return (
    <>
      {/* YouTube iframe */}
      {isYT && showYT && !minimized && (
        <div style={{ position: 'fixed', bottom: 80, right: 20, zIndex: 300, borderRadius: 14, overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', width: 260, height: 148 }}>
          <iframe src={audioUrl + '?autoplay=1'} style={{ width: '100%', height: '100%', border: 'none' }} allow="autoplay" />
        </div>
      )}

      {/* Player bar */}
      <div style={{
        position: 'fixed', bottom: 0, left: 220, right: 0, zIndex: 200,
        background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid #f0e8ff',
        boxShadow: '0 -4px 24px rgba(168,85,247,0.1)',
        padding: minimized ? '8px 20px' : '10px 20px',
      }}>
        {!minimized && !isYT && duration > 0 && (
          <input type="range" min={0} max={duration} step={0.1} value={progress} onChange={seek}
            style={{ width: '100%', height: 3, marginBottom: 8, accentColor: accent, cursor: 'pointer', display: 'block' }} />
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Thumbnail */}
          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: 'hidden', background: 'linear-gradient(135deg,#a855f7,#ec4899)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {track.thumbnail_url
              ? <img src={track.thumbnail_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <span style={{ fontSize: 16 }}>🎵</span>}
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {caption.title || track.caption || 'Bài nhạc'}
            </p>
            <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
              {caption.artist && caption.artist + ' · '}
              {!isYT && duration > 0 && `${fmt(progress)} / ${fmt(duration)}`}
              {isYT && 'YouTube'}
            </p>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={onPrev} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>⏮</button>
            {!isYT && (
              <button onClick={togglePlay} style={{ width: 32, height: 32, borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg,#a855f7,' + accent + ')', color: 'white', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {playing ? '⏸' : '▶'}
              </button>
            )}
            <button onClick={onNext} style={{ border: 'none', background: 'none', fontSize: 18, cursor: 'pointer', color: '#9ca3af' }}>⏭</button>
            {!isYT && (
              <input type="range" min={0} max={1} step={0.05} value={volume}
                onChange={e => { const v = Number(e.target.value); setVolume(v); if (audioRef.current) audioRef.current.volume = v }}
                style={{ width: 60, accentColor: accent }} />
            )}
            {isYT && (
              <button onClick={() => setShowYT(v => !v)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', background: 'white', fontSize: 11, cursor: 'pointer', color: '#6b7280' }}>
                {showYT ? 'Ẩn' : 'Video'}
              </button>
            )}
            <button onClick={() => setMinimized(v => !v)} style={{ border: 'none', background: 'none', fontSize: 14, cursor: 'pointer', color: '#9ca3af' }}>
              {minimized ? '⌄' : '⌃'}
            </button>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
          </div>
        </div>
      </div>

      <div style={{ height: minimized ? 52 : 72 }} />
      <audio ref={audioRef} style={{ display: 'none' }} />
    </>
  )
}
