'use client'

import { useEffect } from 'react'
import type { Media } from '@/types/database'

export default function MediaViewer({ item, signedUrl, onClose, onPush, onDelete, pushing }: {
  item: Media
  signedUrl?: string
  onClose: () => void
  onPush: () => void
  onDelete: () => void
  pushing: boolean
}) {
  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)', zIndex: 200, display: 'flex', flexDirection: 'column' }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', flexShrink: 0 }}
        onClick={e => e.stopPropagation()}
      >
        <div>
          {item.caption && <p style={{ color: 'white', fontSize: 14, margin: 0, fontWeight: 500 }}>{item.caption}</p>}
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>
            {item.type === 'video' ? '🎬 Video' : '📷 Ảnh'}
            {item.is_in_shared_album ? ' · ✨ Đang chia sẻ' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={onPush}
            disabled={pushing}
            style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer', background: item.is_in_shared_album ? '#fde68a' : 'white', color: item.is_in_shared_album ? '#b45309' : '#7c3aed' }}
          >
            {pushing ? '...' : item.is_in_shared_album ? '↩ Bỏ chia sẻ' : '✨ Chia sẻ khu chung'}
          </button>
          {signedUrl && (
            <a href={signedUrl} download target="_blank" rel="noreferrer" onClick={e => e.stopPropagation()}>
              <button style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}>
                ⬇ Tải về
              </button>
            </a>
          )}
          <button
            onClick={() => { onDelete(); onClose() }}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, border: 'none', background: '#fee2e2', color: '#ef4444', cursor: 'pointer' }}
          >
            🗑 Xoá
          </button>
          <button
            onClick={onClose}
            style={{ padding: '7px 14px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: 'white', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Media content */}
      <div
        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 20px 20px', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {!signedUrl ? (
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 48 }}>
            {item.type === 'video' ? '🎬' : '🖼️'}
          </div>
        ) : item.type === 'video' ? (
          <video
            src={signedUrl}
            controls
            autoPlay
            style={{ maxWidth: '100%', maxHeight: '100%', borderRadius: 8 }}
          />
        ) : (
          <img
            src={signedUrl}
            alt={item.caption || ''}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8 }}
          />
        )}
      </div>
    </div>
  )
}
