'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email hoặc mật khẩu không đúng.')
      setLoading(false)
      return
    }

    // Kiểm tra đã kết nối chưa
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles').select('partner_id').eq('id', user.id).single()
      if (!profile?.partner_id) {
        router.push('/connect')
        return
      }
    }
    router.push('/ourspace')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #eff6ff 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 400,
        background: 'white', borderRadius: 20,
        padding: '2.5rem 2rem',
        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💑</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>OurSpace</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 6 }}>Không gian riêng của hai người</p>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="email@example.com"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1.5px solid #e5e7eb', fontSize: 14,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {error && (
            <div style={{
              background: '#fff1f2', border: '1px solid #fecdd3',
              borderRadius: 8, padding: '8px 12px',
              fontSize: 13, color: '#e11d48',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading || !email || !password}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#d8b4fe' : 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4, transition: 'opacity .15s',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: '1.5rem' }}>
          Chưa có tài khoản?{' '}
          <Link href="/register" style={{ color: '#a855f7', fontWeight: 500, textDecoration: 'none' }}>
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  )
}
