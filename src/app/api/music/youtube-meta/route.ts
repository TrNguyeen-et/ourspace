import { NextResponse } from 'next/server'

function extractYouTubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/)
  return m ? m[1] : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')
  if (!url) return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  const videoId = extractYouTubeId(url)
  if (!videoId) return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
  try {
    const res = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`)
    if (!res.ok) throw new Error('oEmbed failed')
    const data = await res.json()
    return NextResponse.json({ videoId, title: data.title, artist: data.author_name, thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, embedUrl: `https://www.youtube.com/embed/${videoId}` })
  } catch {
    return NextResponse.json({ error: 'Could not fetch video info' }, { status: 500 })
  }
}
