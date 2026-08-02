import { NextResponse } from 'next/server'

const PINS: Record<string, string> = {
  him: '291206',
  her: '280605',
}

export async function POST(req: Request) {
  const { role, pin } = await req.json()

  if (!role || !PINS[role]) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  }

  if (pin !== PINS[role]) {
    return NextResponse.json({ error: 'Wrong PIN' }, { status: 401 })
  }

  const res = NextResponse.json({ success: true, role })

  // Set cookie 30 ngày
  res.cookies.set('ourspace_role', role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  return res
}
