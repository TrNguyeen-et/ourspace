'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function ConnectPage() {
  const router = useRouter()
  const supabase = createClient()
  const [myCode, setMyCode] = useState('')
  const [partnerCode, setPartnerCode] = useState('')
  const [startDate, setStartDate] = useState('')
  const [step, setStep] = useState<'code' | 'date' | 'done'>('code')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchMyCode() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles').select('invite_code, partner_id').eq('id', user.id).single()

      // Đã có partner → vào app luôn
      if (profile?.partner_id) { router.push('/ourspace'); return }
      if (profile?.invite_code) setMyCode(profile.invite_code)
    }
    fetchMyCode()
  }, [])

  async function handleConnect() {
    if (!partnerCode.trim()) { setError('Nhập mã mời của người kia nhé.'); return }
    if (partnerCode.trim().toUpperCase() === myCode) { setError('Không thể nhập mã của chính mình.'); return }
    setStep('date')
    setError(null)
  }

  async function handleFinish() {
    if (!startDate) { setError('Chọn ngày bắt đầu yêu nhau nhé.'); return }
    setLoading(true)
    setError(null)

    const res = await fetch('/api/couple/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode: partnerCode.trim().toUpperCase(), startDate }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Mã không hợp lệ hoặc đã được dùng.')
      setLoading(false)
      setStep('code')
      return
    }

    setStep('done')
    setTimeout(() => router.push('/ourspace'), 2000)
  }

  function copyCode() {
    navigator.clipboard.writeText(myCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #eff6ff 100%)',
      padding: '1rem',
    }}>
      <div style={{ width: '100%', maxWidth: 440, background: 'white', borderRadius: 20, padding: '2.5rem 2rem', boxShadow: '0 4px 40px rgba(0,0,0,0.08)' }}>

        {step === 'done' ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: '0 0 8px' }}>Đã kết nối!</h2>
            <p style={{ color: '#9ca3af', fontSize: 14 }}>Đang đưa bạn vào OurSpace...</p>
          </div>
        ) : step === 'date' ? (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Ngày bắt đầu yêu</h2>
              <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 6 }}>Ngày hai người chính thức yêu nhau</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <input
                type="date"
                value={startDate}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setStartDate(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 15, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = '#a855f7'}
                onBlur={e => e.target.style.borderColor = '#e5e7eb'}
              />
              {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e11d48' }}>{error}</div>}
              <button
                onClick={handleFinish}
                disabled={loading || !startDate}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', color: 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: 'pointer' }}
              >
                {loading ? 'Đang kết nối...' : 'Bắt đầu hành trình ✨'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <div style={{ fontSize: 36, marginBottom: 8 }}>🔗</div>
              <h2 style={{ fontSize: 22, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Kết nối với người yêu</h2>
              <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 6 }}>Chia sẻ mã của bạn, rồi nhập mã của người kia</p>
            </div>

            {/* Mã của mình */}
            <div style={{ background: 'linear-gradient(135deg, #faf5ff, #fdf2f8)', borderRadius: 14, padding: '1.25rem', marginBottom: '1.5rem', border: '1px solid #e9d5ff' }}>
              <p style={{ fontSize: 12, fontWeight: 500, color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 10px' }}>Mã mời của bạn</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontSize: 32, fontWeight: 700, letterSpacing: '0.15em', color: '#1a1a2e', fontFamily: 'monospace' }}>
                  {myCode || '------'}
                </span>
                <button
                  onClick={copyCode}
                  style={{ padding: '8px 16px', borderRadius: 8, border: '1.5px solid #d8b4fe', background: copied ? '#a855f7' : 'white', color: copied ? 'white' : '#7c3aed', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all .2s', whiteSpace: 'nowrap' }}
                >
                  {copied ? '✓ Đã copy' : 'Copy'}
                </button>
              </div>
              <p style={{ fontSize: 12, color: '#9ca3af', margin: '10px 0 0' }}>Gửi mã này cho người yêu qua tin nhắn</p>
            </div>

            {/* Nhập mã đối phương */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Mã mời của người yêu</label>
                <input
                  type="text"
                  value={partnerCode}
                  onChange={e => setPartnerCode(e.target.value.toUpperCase())}
                  placeholder="VD: AB12CD"
                  maxLength={6}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 18, fontWeight: 600, letterSpacing: '0.12em', outline: 'none', boxSizing: 'border-box', textAlign: 'center', fontFamily: 'monospace', textTransform: 'uppercase' }}
                  onFocus={e => e.target.style.borderColor = '#a855f7'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {error && <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e11d48' }}>{error}</div>}

              <button
                onClick={handleConnect}
                disabled={partnerCode.length < 6}
                style={{ width: '100%', padding: '12px', background: partnerCode.length < 6 ? '#f3f4f6' : 'linear-gradient(135deg, #a855f7, #ec4899)', color: partnerCode.length < 6 ? '#9ca3af' : 'white', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: partnerCode.length < 6 ? 'not-allowed' : 'pointer', transition: 'all .15s' }}
              >
                Tiếp tục →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
