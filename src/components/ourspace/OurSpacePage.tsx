'use client'

import { useState } from 'react'
import type { Profile, DiaryEntry, Media, MoodCheckin } from '@/types/database'
import LoveCounter from './LoveCounter'
import MoodSync from './MoodSync'
import SharedMusicPlayer from './SharedMusicPlayer'
import SharedDiary from './SharedDiary'
import SharedAlbum from './SharedAlbum'

type Tab = 'home' | 'diary' | 'album'

export default function OurSpacePage({
  profile, partner, sharedDiaries, sharedMedia, musicPool, moods, currentUserId
}: {
  profile: Profile
  partner: Profile
  sharedDiaries: DiaryEntry[]
  sharedMedia: Media[]
  musicPool: Media[]
  moods: MoodCheckin[]
  currentUserId: string
}) {
  const [activeTab, setActiveTab] = useState<Tab>('home')

  const myMood = moods.find(m => m.user_id === currentUserId)
  const partnerMood = moods.find(m => m.user_id === partner.id)

  const tabs: { v: Tab; icon: string; label: string }[] = [
    { v: 'home', icon: '✨', label: 'Tổng quan' },
    { v: 'diary', icon: '📔', label: 'Nhật ký chung' },
    { v: 'album', icon: '🖼️', label: 'Album chung' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #fdf4ff 0%, #fff 40%, #fce7f3 100%)' }}>

      {/* Music player — always visible */}
      <SharedMusicPlayer
        musicPool={musicPool}
        profile={profile}
        partner={partner}
        currentUserId={currentUserId}
      />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 40px' }}>

        {/* Hero header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💑</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1a1a2e', margin: '0 0 4px', background: 'linear-gradient(135deg, #a855f7, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OurSpace
          </h1>
          <p style={{ fontSize: 14, color: '#9ca3af', margin: 0 }}>
            {profile.name} & {partner.name}
          </p>
        </div>

        {/* Love counter */}
        {profile.couple_start_date && (
          <LoveCounter startDate={profile.couple_start_date} />
        )}

        {/* Mood sync */}
        <MoodSync
          myMood={myMood ?? null}
          partnerMood={partnerMood ?? null}
          myName={profile.name ?? 'Bạn'}
          partnerName={partner.name ?? 'Người yêu'}
          currentUserId={currentUserId}
        />

        {/* Tab nav */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 14, padding: 4, gap: 2, marginBottom: 24, boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #f0e8ff' }}>
          {tabs.map(t => (
            <button
              key={t.v}
              onClick={() => setActiveTab(t.v)}
              style={{
                flex: 1, padding: '9px 12px', borderRadius: 10, border: 'none',
                background: activeTab === t.v ? 'linear-gradient(135deg, #a855f7, #ec4899)' : 'transparent',
                color: activeTab === t.v ? 'white' : '#6b7280',
                fontWeight: activeTab === t.v ? 600 : 400,
                fontSize: 13, cursor: 'pointer', transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'home' && (
          <HomeTab
            sharedDiaries={sharedDiaries}
            sharedMedia={sharedMedia}
            profile={profile}
            partner={partner}
            currentUserId={currentUserId}
            onGoAlbum={() => setActiveTab('album')}
            onGoDiary={() => setActiveTab('diary')}
          />
        )}
        {activeTab === 'diary' && (
          <SharedDiary
            entries={sharedDiaries}
            profile={profile}
            partner={partner}
            currentUserId={currentUserId}
          />
        )}
        {activeTab === 'album' && (
          <SharedAlbum
            media={sharedMedia}
            profile={profile}
            partner={partner}
            currentUserId={currentUserId}
          />
        )}
      </div>
    </div>
  )
}

function HomeTab({ sharedDiaries, sharedMedia, profile, partner, currentUserId, onGoAlbum, onGoDiary }: {
  sharedDiaries: DiaryEntry[]
  sharedMedia: Media[]
  profile: Profile
  partner: Profile
  currentUserId: string
  onGoAlbum: () => void
  onGoDiary: () => void
}) {
  // Latest 3 entries + latest 6 photos preview
  const latestDiaries = sharedDiaries.slice(0, 3)
  const latestPhotos = sharedMedia.filter(m => m.type === 'photo').slice(0, 6)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Latest diary entries */}
      <Section
        title="📔 Nhật ký gần đây"
        action={sharedDiaries.length > 3 ? { label: 'Xem tất cả →', onClick: onGoDiary } : undefined}
      >
        {latestDiaries.length === 0 ? (
          <EmptyHint icon="📝" text="Chưa có nhật ký nào được chia sẻ." />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {latestDiaries.map(entry => {
              const isMe = entry.user_id === currentUserId
              const author = isMe ? profile : partner
              return (
                <div key={entry.id} style={{ background: '#fafafa', borderRadius: 12, padding: '14px 16px', border: '1px solid #f0e8ff' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: isMe ? 'linear-gradient(135deg,#a855f7,#3b82f6)' : 'linear-gradient(135deg,#ec4899,#f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: 'white', fontWeight: 700 }}>
                      {author.name?.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#6b7280' }}>{author.name}</span>
                    {entry.mood && <span style={{ fontSize: 14 }}>{moodEmoji(entry.mood)}</span>}
                    <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>
                      {entry.shared_at ? new Date(entry.shared_at).toLocaleDateString('vi-VN') : ''}
                    </span>
                  </div>
                  {entry.title && <p style={{ fontSize: 14, fontWeight: 600, color: '#1a1a2e', margin: '0 0 4px' }}>{entry.title}</p>}
                  <p style={{ fontSize: 13, color: '#6b7280', margin: 0, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {entry.content?.replace(/<[^>]*>/g, '').slice(0, 120)}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {/* Photo preview grid */}
      <Section
        title="🖼️ Ảnh chung gần đây"
        action={sharedMedia.length > 6 ? { label: 'Xem album →', onClick: onGoAlbum } : undefined}
      >
        {latestPhotos.length === 0 ? (
          <EmptyHint icon="📸" text="Chưa có ảnh nào trong album chung." />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {latestPhotos.map(photo => (
              <div key={photo.id} style={{ aspectRatio: '1', borderRadius: 10, overflow: 'hidden', background: '#f3f4f6' }}>
                <img
                  src={`/api/media/signed-urls`}
                  alt={photo.caption ?? ''}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.style.display = 'none' }}
                />
                {/* We load signed URL via SharedAlbum; here show placeholder */}
                <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #fdf4ff, #fce7f3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
                  🖼️
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

    </div>
  )
}

function Section({ title, action, children }: { title: string; action?: { label: string; onClick: () => void }; children: React.ReactNode }) {
  return (
    <div style={{ background: 'white', borderRadius: 18, padding: '20px', boxShadow: '0 2px 16px rgba(168,85,247,0.06)', border: '1px solid #f0e8ff' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a1a2e', margin: 0 }}>{title}</h2>
        {action && (
          <button onClick={action.onClick} style={{ fontSize: 12, color: '#a855f7', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}>
            {action.label}
          </button>
        )}
      </div>
      {children}
    </div>
  )
}

function EmptyHint({ icon, text }: { icon: string; text: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '24px 0', color: '#9ca3af', fontSize: 13 }}>
      <div style={{ fontSize: 32, marginBottom: 8 }}>{icon}</div>
      {text}
    </div>
  )
}

function moodEmoji(mood: string): string {
  const map: Record<string, string> = { happy: '😊', love: '🥰', sad: '😢', tired: '😴', angry: '😤', miss: '🥺', excited: '🤩', calm: '😌' }
  return map[mood] ?? '📝'
}
