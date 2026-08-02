'use client'

import { useEffect, useState } from 'react'
import { differenceInSeconds, format } from 'date-fns'
import { vi } from 'date-fns/locale'

export default function LoveCounter({ startDate }: { startDate: string }) {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    const calc = () => {
      const start = new Date(startDate)
      setSeconds(differenceInSeconds(new Date(), start))
    }
    calc()
    const id = setInterval(calc, 1000)
    return () => clearInterval(id)
  }, [startDate])

  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  const startFormatted = format(new Date(startDate), "dd 'tháng' MM, yyyy", { locale: vi })

  return (
    <div style={{
      background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
      borderRadius: 20, padding: '24px 20px', marginBottom: 20,
      textAlign: 'center', boxShadow: '0 8px 32px rgba(168,85,247,0.25)',
    }}>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '0 0 12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        Yêu nhau từ {startFormatted}
      </p>

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 8 }}>
        {[
          { v: days, l: 'ngày' },
          { v: hours, l: 'giờ' },
          { v: mins, l: 'phút' },
          { v: secs, l: 'giây' },
        ].map(({ v, l }, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', gap: i < 3 ? 12 : 0 }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '10px 14px', minWidth: 56, textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>
                {String(v).padStart(2, '0')}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>{l}</div>
            </div>
            {i < 3 && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 20, fontWeight: 300 }}>:</span>}
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: '10px 0 0' }}>
        💕 {days} ngày hạnh phúc bên nhau
      </p>
    </div>
  )
}
