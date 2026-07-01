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

  // Lấy profile của mình
  const { data: myRaw } = await supabase
    .from('profiles')
    .select('partner_id')
    .eq('id', user.id)
    .single()

  const myProfile = myRaw as { partner_id: string | null } | null
  if (myProfile?.partner_id) {
    return NextResponse.json({ error: 'Tài khoản đã được kết nối.' }, { status: 400 })
  }

  // Tìm partner qua invite code
  const { data: partnerRaw } = await supabase
    .from('profiles')
    .select('id, partner_id')
    .eq('invite_code', inviteCode)
    .single()

  const partner = partnerRaw as { id: string; partner_id: string | null } | null

  if (!partner) {
    return NextResponse.json({ error: 'Mã mời không hợp lệ.' }, { status: 404 })
  }
  if (partner.id === user.id) {
    return NextResponse.json({ error: 'Không thể kết nối với chính mình.' }, { status: 400 })
  }
  if (partner.partner_id) {
    return NextResponse.json({ error: 'Mã này đã được dùng rồi.' }, { status: 400 })
  }

  // Update cả 2 profile — dùng eslint-disable-next-line để tắt type check dòng này
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData = { partner_id: partner.id, couple_start_date: startDate } as any

  const { error: e1 } = await supabase
    .from('profiles')
    .update(updateData)
    .eq('id', user.id)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData2 = { partner_id: user.id, couple_start_date: startDate } as any

  const { error: e2 } = await supabase
    .from('profiles')
    .update(updateData2)
    .eq('id', partner.id)

  if (e1 || e2) {
    return NextResponse.json({ error: 'Kết nối thất bại, thử lại nhé.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}