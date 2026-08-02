'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

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

export default function AppNav({ role }: { role: 'him' | 'her' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  const isHim = role === 'him'
  const navItems = isHim ? NAV_HIM : NAV_HER
  const accent = isHim ? '#3b82f6' : '#ec4899'
  const accentBg = isHim ? '#eff6ff' : '#fdf2f8'
  const gradient = isHim
    ? 'linear-gradient(135deg,#3b82f6,#a855f7)'
    : 'linear-gradient(135deg,#ec4899,#a855f7)'

  // Bottom nav items (mobile) — 5 items: ourspace + 4 main
  const bottomItems = [
    { href: '/ourspace', icon: '✨', label: 'Chung' },
    { href: navItems[0].href, icon: navItems[0].icon, label: 'Nhật ký' },
    { href: navItems[1].href, icon: navItems[1].icon, label: 'Ảnh' },
    { href: navItems[2].href, icon: navItems[2].icon, label: 'Nhạc' },
    { href: '#more', icon: '☰', label: 'Thêm' },
  ]

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <>
      <style>{`
        /* Desktop sidebar */
        .app-sidebar {
          position: fixed; top: 0; left: 0; bottom: 0; width: 220px;
          background: white; border-right: 1px solid #f0e8ff;
          display: flex; flex-direction: column; z-index: 50;
          box-shadow: 2px 0 12px rgba(168,85,247,0.06);
        }
        .app-bottom-nav { display: none; }
        .app-menu-overlay { display: none; }
        .app-menu-drawer { display: none; }

        /* Mobile & small tablet */
        @media (max-width: 768px) {
          .app-sidebar { display: none !important; }

          .app-bottom-nav {
            display: flex; position: fixed; bottom: 0; left: 0; right: 0;
            background: white; border-top: 1px solid #f0e8ff;
            box-shadow: 0 -4px 20px rgba(168,85,247,0.08);
            z-index: 100; padding: 6px 0 env(safe-area-inset-bottom, 6px);
          }

          .app-menu-overlay {
            display: block; position: fixed; inset: 0;
            background: rgba(0,0,0,0.4); z-index: 200;
            backdrop-filter: blur(2px);
          }

          .app-menu-drawer {
            display: flex; flex-direction: column;
            position: fixed; bottom: 0; left: 0; right: 0;
            background: white; border-radius: 24px 24px 0 0;
            padding: 12px 0 env(safe-area-inset-bottom, 20px);
            z-index: 201; box-shadow: 0 -8px 40px rgba(0,0,0,0.15);
          }
        }

        /* iPad landscape (768-1024) — compact sidebar */
        @media (min-width: 769px) and (max-width: 1024px) {
          .app-sidebar { width: 64px; }
          .sidebar-label { display: none; }
          .sidebar-section-title { display: none; }
          .sidebar-user-name { display: none; }
          .sidebar-logo-text { display: none; }
          .sidebar-logo-icon { margin: 0 auto; }
          .sidebar-nav-item { justify-content: center; padding: 10px !important; }
          .sidebar-logout { font-size: 0; padding: 8px !important; }
          .sidebar-logout::after { content: '🚪'; font-size: 18px; }
        }
      `}</style>

      {/* ─── DESKTOP SIDEBAR ─── */}
      <nav className="app-sidebar">
        {/* Logo */}
        <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #f5f0ff', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/ourspace" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="sidebar-logo-icon" style={{ fontSize: 22 }}>💑</span>
            <span className="sidebar-logo-text" style={{ fontSize: 18, fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.5px' }}>OurSpace</span>
          </Link>
        </div>

        {/* Khu chung */}
        <div style={{ padding: '12px 10px 4px' }}>
          <SidebarItem href="/ourspace" icon="✨" label="Khu chung"
            active={pathname === '/ourspace'} activeColor="#7c3aed" activeBg="#faf5ff" />
        </div>

        {/* Khu riêng */}
        <div style={{ padding: '0 10px', flex: 1 }}>
          <div className="sidebar-section-title" style={{ fontSize: 10, fontWeight: 600, color: accent, textTransform: 'uppercase', letterSpacing: '0.08em', padding: '10px 8px 6px' }}>
            {isHim ? 'Khu của anh' : 'Khu của em'}
          </div>
          {navItems.map(item => (
            <SidebarItem key={item.href} href={item.href} icon={item.icon} label={item.label}
              active={pathname.startsWith(item.href)} activeColor={accent} activeBg={accentBg} />
          ))}
        </div>

        {/* Profile + logout */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid #f5f0ff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', marginBottom: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
              {isHim ? '👦' : '👧'}
            </div>
            <div className="sidebar-user-name">
              <div style={{ fontSize: 13, fontWeight: 500, color: '#1a1a2e' }}>{isHim ? 'Anh' : 'Em'}</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>{isHim ? 'Him' : 'Her'}</div>
            </div>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} style={{ width: '100%', padding: '7px', borderRadius: 8, border: '1px solid #fee2e2', background: 'transparent', color: '#ef4444', fontSize: 12, cursor: 'pointer' }}>
            Đăng xuất
          </button>
        </div>
      </nav>

      {/* ─── MOBILE BOTTOM NAV ─── */}
      <nav className="app-bottom-nav">
        {bottomItems.map(item => {
          const isMore = item.href === '#more'
          const isActive = isMore ? menuOpen : (item.href === '/ourspace' ? pathname === '/ourspace' : pathname.startsWith(item.href))
          return (
            <button
              key={item.href}
              onClick={() => {
                if (isMore) { setMenuOpen(true); return }
                router.push(item.href)
              }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 2, padding: '6px 4px', border: 'none', background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? accent : '#9ca3af' }}>
                {item.label}
              </span>
              {isActive && !isMore && (
                <div style={{ width: 4, height: 4, borderRadius: '50%', background: accent }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* ─── MOBILE DRAWER MENU ─── */}
      {menuOpen && (
        <>
          <div className="app-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="app-menu-drawer">
            {/* Handle */}
            <div style={{ width: 36, height: 4, borderRadius: 2, background: '#e5e7eb', margin: '0 auto 16px' }} />

            {/* Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 20px 16px' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                {isHim ? '👦' : '👧'}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#1a1a2e' }}>{isHim ? 'Anh' : 'Em'}</div>
                <div style={{ fontSize: 12, color: '#9ca3af' }}>Khu {isHim ? 'của anh' : 'của em'}</div>
              </div>
            </div>

            <div style={{ height: 1, background: '#f3f4f6', margin: '0 20px 8px' }} />

            {/* Extra nav items */}
            {[
              { href: navItems[3].href, icon: navItems[3].icon, label: navItems[3].label },
              { href: navItems[4].href, icon: navItems[4].icon, label: navItems[4].label },
            ].map(item => (
              <button key={item.href} onClick={() => { router.push(item.href); setMenuOpen(false) }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', border: 'none', background: pathname.startsWith(item.href) ? accentBg : 'transparent', width: '100%', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 15, fontWeight: pathname.startsWith(item.href) ? 600 : 400, color: pathname.startsWith(item.href) ? accent : '#374151' }}>{item.label}</span>
              </button>
            ))}

            <div style={{ height: 1, background: '#f3f4f6', margin: '8px 20px' }} />

            <button onClick={handleLogout}
              style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', border: 'none', background: 'transparent', width: '100%', cursor: 'pointer', color: '#ef4444' }}>
              <span style={{ fontSize: 22 }}>🚪</span>
              <span style={{ fontSize: 15 }}>Đăng xuất</span>
            </button>
          </div>
        </>
      )}
    </>
  )
}

function SidebarItem({ href, icon, label, active, activeColor, activeBg }: {
  href: string, icon: string, label: string,
  active: boolean, activeColor: string, activeBg: string,
}) {
  return (
    <Link href={href} style={{ textDecoration: 'none' }}>
      <div className="sidebar-nav-item" style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '9px 10px', borderRadius: 10, marginBottom: 2,
        background: active ? activeBg : 'transparent',
        transition: 'background .15s',
      }}>
        <span style={{ fontSize: 17, flexShrink: 0 }}>{icon}</span>
        <span className="sidebar-label" style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? activeColor : '#4b5563' }}>
          {label}
        </span>
      </div>
    </Link>
  )
}
