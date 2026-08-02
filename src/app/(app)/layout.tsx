import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import AppNav from '@/components/layout/AppNav'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const role = cookieStore.get('ourspace_role')?.value as 'him' | 'her' | undefined
  if (!role) redirect('/')

  return (
    <>
      <style>{`
        .app-main {
          margin-left: 220px;
          min-height: 100vh;
          background: #f9f7ff;
        }
        /* iPad compact sidebar */
        @media (min-width: 769px) and (max-width: 1024px) {
          .app-main { margin-left: 64px; }
        }
        /* Mobile — no sidebar, has bottom nav */
        @media (max-width: 768px) {
          .app-main {
            margin-left: 0;
            padding-bottom: calc(65px + env(safe-area-inset-bottom, 0px));
          }
        }
      `}</style>
      <AppNav role={role} />
      <main className="app-main">
        {children}
      </main>
    </>
  )
}
