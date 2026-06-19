'use client'

import { useState, useRef, useCallback } from 'react'

const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ACCEPTED = ['image/jpeg', 'image/png', 'image/heic', 'image/webp', 'video/mp4', 'video/quicktime', 'video/webm']

export default function UploadZone({ onUpload, onClose, uploading, accent }: {
  onUpload: (files: File[], captions: Record<string, string>) => Promise<void>
  onClose: () => void
  uploading: boolean
  accent: string
}) {
  const [files, setFiles] = useState<File[]>([])
  const [captions, setCaptions] = useState<Record<string, string>>({})
  const [dragging, setDragging] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const addFiles = useCallback((newFiles: FileList | null) => {
    if (!newFiles) return
    const errs: string[] = []
    const valid: File[] = []
    Array.from(newFiles).forEach(f => {
      if (!ACCEPTED.includes(f.type)) { errs.push(f.name + ': định dạng không hỗ trợ'); return }
      if (f.size > MAX_FILE_SIZE) { errs.push(f.name + ': file quá lớn (tối đa 100MB)'); return }
      valid.push(f)
    })
    setErrors(errs)
    setFiles(prev => [...prev, ...valid.filter(f => !prev.find(p => p.name === f.name && p.size === f.size))])
  }, [])

  function removeFile(idx: number) {
    setFiles(prev => { const n = [...prev]; n.splice(idx, 1); return n })
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault(); setDragging(false)
    addFiles(e.dataTransfer.files)
  }

  function getPreview(file: File) {
    return URL.createObjectURL(file)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 20, width: '100%', maxWidth: 580, maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>Upload ảnh & video</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            style={{
              border: '2px dashed ' + (dragging ? accent : '#d1d5db'),
              borderRadius: 14, padding: '32px 20px', textAlign: 'center',
              cursor: 'pointer', background: dragging ? '#faf5ff' : '#fafafa',
              transition: 'all .15s', marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 40, marginBottom: 10 }}>📁</div>
            <p style={{ fontSize: 15, fontWeight: 500, color: '#374151', margin: '0 0 4px' }}>
              Kéo thả ảnh / video vào đây
            </p>
            <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>
              hoặc click để chọn · JPG, PNG, HEIC, MP4, MOV · Tối đa 100MB/file
            </p>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              style={{ display: 'none' }}
              onChange={e => addFiles(e.target.files)}
            />
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 10, padding: '10px 14px', marginBottom: 14 }}>
              {errors.map((e, i) => <p key={i} style={{ fontSize: 12, color: '#e11d48', margin: '2px 0' }}>⚠️ {e}</p>)}
            </div>
          )}

          {/* File list with caption input */}
          {files.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {files.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', gap: 12, alignItems: 'center', background: '#f9f7ff', borderRadius: 10, padding: '10px 12px' }}>
                  {/* Thumbnail */}
                  <div style={{ width: 52, height: 52, borderRadius: 8, overflow: 'hidden', flexShrink: 0, background: '#e5e7eb' }}>
                    {file.type.startsWith('video/') ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1a1a2e', fontSize: 20 }}>🎬</div>
                    ) : (
                      <img src={getPreview(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    )}
                  </div>

                  {/* Info + caption */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 12, fontWeight: 500, color: '#374151', margin: '0 0 4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {file.name}
                    </p>
                    <p style={{ fontSize: 11, color: '#9ca3af', margin: '0 0 6px' }}>
                      {(file.size / 1024 / 1024).toFixed(1)} MB · {file.type.startsWith('video/') ? 'Video' : 'Ảnh'}
                    </p>
                    <input
                      type="text"
                      placeholder="Thêm caption... (không bắt buộc)"
                      value={captions[file.name] || ''}
                      onChange={e => setCaptions(prev => ({ ...prev, [file.name]: e.target.value }))}
                      style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <button onClick={() => removeFile(idx)} style={{ border: 'none', background: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af', flexShrink: 0 }}>✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid #f3f4f6', display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '10px', borderRadius: 10, border: '1px solid #e5e7eb', background: 'white', color: '#6b7280', fontSize: 14, cursor: 'pointer' }}>
            Huỷ
          </button>
          <button
            onClick={() => onUpload(files, captions)}
            disabled={files.length === 0 || uploading}
            style={{ flex: 2, padding: '10px', borderRadius: 10, border: 'none', background: files.length === 0 ? '#f3f4f6' : 'linear-gradient(135deg, #a855f7, ' + accent + ')', color: files.length === 0 ? '#9ca3af' : 'white', fontSize: 14, fontWeight: 600, cursor: files.length === 0 ? 'not-allowed' : 'pointer' }}
          >
            {uploading ? 'Đang upload...' : 'Upload ' + files.length + ' file' + (files.length > 1 ? 's' : '')}
          </button>
        </div>
      </div>
    </div>
  )
}
