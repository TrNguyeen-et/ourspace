import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = ['/him', '/her', '/ourspace']
const PUBLIC = ['/']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const role = request.cookies.get('ourspace_role')?.value

  const isProtected = PROTECTED.some(p => pathname.startsWith(p))

  // Chưa có role → chưa đăng nhập → về trang chọn
  if (isProtected && !role) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // Đã có role → vào trang chủ → redirect vào app
  if (pathname === '/' && role) {
    return NextResponse.redirect(new URL(role === 'him' ? '/him/diary' : '/her/diary', request.url))
  }

  // Bảo vệ chéo: him không vào được her và ngược lại
  if (role === 'him' && pathname.startsWith('/her')) {
    return NextResponse.redirect(new URL('/him/diary', request.url))
  }
  if (role === 'her' && pathname.startsWith('/him')) {
    return NextResponse.redirect(new URL('/her/diary', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
