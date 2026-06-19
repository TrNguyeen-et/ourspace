import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'OurSpace',
  description: 'Không gian riêng của hai người',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  )
}