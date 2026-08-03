const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!

export function getPublicUrl(path: string, bucket = 'private-media'): string {
  if (!path) return ''
  // Nếu đã là full URL (YouTube embed) thì giữ nguyên
  if (path.startsWith('http')) return path
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`
}
