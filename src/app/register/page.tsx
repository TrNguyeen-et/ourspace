'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' as 'him' | 'her' | '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleRegister() {
    if (!form.role) { setError('Hãy chọn bạn là ai.'); return }
    setLoading(true)
    setError(null)

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message === 'User already registered'
        ? 'Email này đã được đăng ký.'
        : 'Đăng ký thất bại. Thử lại nhé.')
      setLoading(false)
      return
    }

    if (data.user) {
      // Tạo profile
      await supabase.from('profiles').upsert({
        id: data.user.id,
        name: form.name,
        role: form.role,
      })
    }

    router.push('/connect')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #fdf4ff 0%, #fce7f3 50%, #eff6ff 100%)',
      padding: '1rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 400, background: 'white',
        borderRadius: 20, padding: '2.5rem 2rem',
        boxShadow: '0 4px 40px rgba(0,0,0,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>💑</div>
          <h1 style={{ fontSize: 26, fontWeight: 600, color: '#1a1a2e', margin: 0 }}>Tạo tài khoản</h1>
          <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 6 }}>Bắt đầu hành trình của hai người</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Tên */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Tên của bạn</label>
            <input
              type="text" value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="Nhập tên..."
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Email */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Email</label>
            <input
              type="email" value={form.email} onChange={e => set('email', e.target.value)}
              placeholder="email@example.com"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Password */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 6 }}>Mật khẩu</label>
            <input
              type="password" value={form.password} onChange={e => set('password', e.target.value)}
              placeholder="Ít nhất 6 ký tự"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #e5e7eb', fontSize: 14, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = '#a855f7'}
              onBlur={e => e.target.style.borderColor = '#e5e7eb'}
            />
          </div>

          {/* Role picker */}
          <div>
            <label style={{ fontSize: 13, fontWeight: 500, color: '#374151', display: 'block', marginBottom: 8 }}>Bạn là...</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {(['him', 'her'] as const).map(r => (
                <button
                  key={r}
                  onClick={() => set('role', r)}
                  style={{
                    padding: '14px 10px', borderRadius: 12, border: '2px solid',
                    borderColor: form.role === r ? '#a855f7' : '#e5e7eb',
                    background: form.role === r ? '#faf5ff' : 'white',
                    cursor: 'pointer', transition: 'all .15s',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 28 }}>{r === 'him' ? '👦' : '👧'}</span>
                  <span style={{ fontSize: 13, fontWeight: 500, color: form.role === r ? '#7c3aed' : '#6b7280' }}>
                    {r === 'him' ? 'Bạn nam' : 'Bạn nữ'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ background: '#fff1f2', border: '1px solid #fecdd3', borderRadius: 8, padding: '8px 12px', fontSize: 13, color: '#e11d48' }}>
              {error}
            </div>
          )}

          <button
            onClick={handleRegister}
            disabled={loading || !form.name || !form.email || !form.password || !form.role}
            style={{
              width: '100%', padding: '11px',
              background: loading ? '#d8b4fe' : 'linear-gradient(135deg, #a855f7, #ec4899)',
              color: 'white', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>
        </div>

        <p style={{ textAlign: 'center', fontSize: 13, color: '#9ca3af', marginTop: '1.5rem' }}>
          Đã có tài khoản?{' '}
          <Link href="/login" style={{ color: '#a855f7', fontWeight: 500, textDecoration: 'none' }}>
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  )
}
