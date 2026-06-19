'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database'

const NAV_HIM = [
  { href: '/him/diary', icon: '📔', label: 'Nhật ký' },
  { href: '/him/media', icon: '🖼️', label: 'Ảnh & Video' },
  { href: '/him/music', icon: '🎵', label: 'Kho nhạc' },
  { href: '/him/wishlist', icon: '🌠', label: 'Wishlist' },
  { href: '/him/dates', icon: '📅', label: 'Ngày đặc biệt' },
]

const NAV_HER = [
  { href: '/her/diary', icon: '📔', label: 'Nhật ký' },
  { href: '/her/media', icon: '🖼️', label: 'Ảnh & Video' },
  { href: '/her/music', icon: '🎵', label: 'Kho nhạc' },
  { href: '/her/wishlist', icon: '🌠', label: 'Wishlist' },
  { href: '/her/dates', icon: '📅', label: 'Ngày đặc biệt' },
]

export default function AppNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const isHim = profile.role === 'him'
  const navItems = isHim ? NAV_HIM : NAV_HER
  const zoneColor = isHim ? '#3b82f6' : '#ec4899'
  const zoneBg = isHim ? '#eff6ff' : '#fdf2f8'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, bottom: 0, width: 220,
      background: 'white', borderRight: '1px solid #f0e8ff',
      display: 'flex', flexDirection: 'column', zIndex: 50,
      boxShadow: '2px 0 12px rgba(168,85,247,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f5f0ff' }}>
        <Link href="/ourspace" style={{ textDecoration: 'none' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
            💑 OurSpace
          </div>
        </Link>
      </div>

      {/* Khu chung */}
      <div style={{ padding: '12px 10px 8px' }}>
        <NavItem
          href="/ourspace"
          icon="✨"
          label="Khu chung"
          active={pathname === '/ourspace'}
          activeColor="#7c3aed"
          activeBg="#faf5ff"
        />
      </div>

      {/* Khu riêng */}
      <div style={{ padding: '0 10px', flex: 1 }}>
        <div style={{
          fontSize: 10, fontWeight: 600, color: zoneColor, textTransform: 'uppercase',
          letterSpacing: '0.08em', padding: '8px 8px 6px',
        }}>
          {isHim ? 'Khu của anh' : 'Khu của em'}
        </div>
        {navItems.map(item => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname.startsWith(item.href)}
            activeColor={zoneColor}
            activeBg={zoneBg}
          />
        ))}
      </div>

      {/* Profile + logout */}
      <div style={{ padding: '12px 10px', borderTop: '1px solid #f5f0ff' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px', borderRadius: 10, marginBottom: 4,
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: 13, fontWeight: 600, flexShrink: 0,
          }}>
            {profile.name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.name}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af' }}>
              {isHim ? 'Bạn nam' : 'Bạn nữ'}
            </div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          style={{
            width: '100%', padding: '7px', borderRadius: 8,
            border: '1px solid #fee2e2', background: 'transparent',
            color: '#ef4444', fontSize: 12, cursor: 'pointer',
            transition: 'background .15s',
          }}
          onMouseOver={e => (e.currentTarget.style.background = '#fff5f5')}
          onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
        >
          Đăng xuất
        </button>
      </div>
    </nav>
  )
}

function NavItem({ href, icon, label, active, activeColor, activeBg }: {
  href: string, icon: string, label: string,
  active: boolean, activeColor: string, activeBg: string,
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 10px', borderRadius: 10, marginBottom: 2,
        background: active ? activeBg : 'transparent',
        transition: 'background .15s', cursor: 'pointer',
      }}
        onMouseOver={e => { if (!active) e.currentTarget.style.background = '#faf5ff' }}
        onMouseOut={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
      >
        <span style={{ fontSize: 16 }}>{icon}</span>
        <span style={{
          fontSize: 13, fontWeight: active ? 600 : 400,
          color: active ? activeColor : '#4b5563',
        }}>
          {label}
        </span>
      </div>
    </Link>
  )
}
