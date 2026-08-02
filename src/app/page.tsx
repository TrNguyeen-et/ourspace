'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [role, setRole] = useState<'him' | 'her' | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  function handleRoleSelect(r: 'him' | 'her') {
    setRole(r); setPin(''); setError(false)
  }

  async function handleDigit(d: string) {
    if (pin.length >= 6 || loading) return
    const next = pin + d
    setPin(next); setError(false)
    if (next.length === 6) {
      setLoading(true)
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, pin: next }),
      })
      if (res.ok) {
        router.push(role === 'him' ? '/him/diary' : '/her/diary')
      } else {
        setShake(true); setError(true)
        setTimeout(() => { setPin(''); setShake(false); setLoading(false) }, 600)
      }
    }
  }

  function handleBack() { setPin(p => p.slice(0, -1)); setError(false) }

  const accent = role === 'him' ? '#3b82f6' : '#ec4899'
  const digits = ['1','2','3','4','5','6','7','8','9','','0','⌫']

  return (
    <div style={{
      minHeight: '100vh',
      background: role === 'him' ? 'linear-gradient(160deg,#eff6ff,#dbeafe)'
        : role === 'her' ? 'linear-gradient(160deg,#fdf2f8,#fce7f3)'
        : 'linear-gradient(160deg,#fdf4ff,#fce7f3 60%,#eff6ff)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, transition: 'background 0.5s',
    }}>
      <div style={{ width: '100%', maxWidth: 340, textAlign: 'center' }}>
        <div style={{ marginBottom: 36 }}>
          <div style={{ fontSize: 56, marginBottom: 8 }}>💑</div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: '#1a1a2e', margin: 0 }}>OurSpace</h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: '6px 0 0' }}>Không gian riêng của hai người</p>
        </div>

        {!role ? (
          <>
            <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 20, fontWeight: 500 }}>Bạn là ai?</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {(['him', 'her'] as const).map(r => (
                <button key={r} onClick={() => handleRoleSelect(r)} style={{
                  padding: '32px 16px', borderRadius: 22,
                  border: '2px solid ' + (r === 'him' ? '#bfdbfe' : '#fbcfe8'),
                  background: 'white', cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.07)',
                  transition: 'all .2s',
                }}>
                  <div style={{ fontSize: 48, marginBottom: 10 }}>{r === 'him' ? '👦' : '👧'}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: r === 'him' ? '#1d4ed8' : '#be185d' }}>
                    {r === 'him' ? 'Anh' : 'Em'}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 36, marginBottom: 6 }}>{role === 'him' ? '👦' : '👧'}</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: accent, margin: '0 0 2px' }}>
                {role === 'him' ? 'Xin chào anh! 💙' : 'Xin chào em! 💗'}
              </p>
              <p style={{ fontSize: 13, color: '#9ca3af', margin: 0 }}>Nhập mật mã 6 số</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, margin: '28px 0 8px', animation: shake ? 'shake 0.4s ease' : 'none' }}>
              <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-10px)}40%{transform:translateX(10px)}60%{transform:translateX(-6px)}80%{transform:translateX(6px)}}`}</style>
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: i < pin.length ? (error ? '#ef4444' : accent) : '#e5e7eb', transform: i < pin.length ? 'scale(1.2)' : 'scale(1)', transition: 'all 0.15s' }} />
              ))}
            </div>

            <div style={{ height: 24, marginBottom: 16 }}>
              {error && <p style={{ fontSize: 13, color: '#ef4444', margin: 0 }}>Mật mã không đúng 💔</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
              {digits.map((d, i) => (
                <button key={i}
                  onClick={() => d === '⌫' ? handleBack() : d !== '' ? handleDigit(d) : undefined}
                  disabled={d === '' || loading}
                  style={{
                    padding: '20px 0', borderRadius: 14, fontSize: d === '⌫' ? 20 : 22, fontWeight: 600,
                    border: 'none',
                    background: d === '' ? 'transparent' : d === '⌫' ? '#f3f4f6' : 'white',
                    color: d === '⌫' ? '#6b7280' : '#1a1a2e',
                    cursor: d === '' ? 'default' : 'pointer',
                    boxShadow: d === '' || d === '⌫' ? 'none' : '0 2px 10px rgba(0,0,0,0.08)',
                    opacity: loading ? 0.6 : 1,
                  }}
                >{d}</button>
              ))}
            </div>

            <button onClick={() => { setRole(null); setPin(''); setError(false) }}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#9ca3af', cursor: 'pointer' }}>
              ← Chọn lại
            </button>
          </>
        )}
      </div>
    </div>
  )
}