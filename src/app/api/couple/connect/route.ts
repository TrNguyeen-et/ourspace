import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { inviteCode, startDate } = await req.json()

  if (!inviteCode || !startDate) {
    return NextResponse.json({ error: 'Thiếu thông tin.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Chưa đăng nhập.' }, { status: 401 })
  }

  // Kiểm tra user chưa có partner
  const { data: myProfile } = await supabase
    .from('profiles').select('partner_id, invite_code').eq('id', user.id).single()

  if (myProfile?.partner_id) {
    return NextResponse.json({ error: 'Tài khoản đã được kết nối.' }, { status: 400 })
  }

  // Tìm partner qua invite code
  const { data: partner } = await supabase
    .from('profiles')
    .select('id, partner_id')
    .eq('invite_code', inviteCode)
    .single()

  if (!partner) {
    return NextResponse.json({ error: 'Mã mời không hợp lệ.' }, { status: 404 })
  }

  if (partner.id === user.id) {
    return NextResponse.json({ error: 'Không thể kết nối với chính mình.' }, { status: 400 })
  }

  if (partner.partner_id) {
    return NextResponse.json({ error: 'Mã này đã được dùng rồi.' }, { status: 400 })
  }

  // Kết nối 2 người
  const [res1, res2] = await Promise.all([
    supabase.from('profiles').update({
      partner_id: partner.id,
      couple_start_date: startDate,
    }).eq('id', user.id),

    supabase.from('profiles').update({
      partner_id: user.id,
      couple_start_date: startDate,
    }).eq('id', partner.id),
  ])

  if (res1.error || res2.error) {
    return NextResponse.json({ error: 'Kết nối thất bại, thử lại nhé.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
