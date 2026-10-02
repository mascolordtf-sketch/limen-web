import { useEffect, useRef, useState } from 'react'

import type { Origin01InvitationData } from './origin01ContentTypes'

type CommunityContent = Origin01InvitationData['content']['community']

const instagramUrl = (handle: string) => `https://www.instagram.com/${encodeURIComponent(handle.replace(/^@/, ''))}/`

export function Origin01Community({ community }: { community: CommunityContent }) {
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'error'>('idle')
  const resetRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (resetRef.current) window.clearTimeout(resetRef.current)
  }, [])

  const copyHashtag = async () => {
    if (resetRef.current) window.clearTimeout(resetRef.current)
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard API unavailable')
      await navigator.clipboard.writeText(community.hashtag.value)
      setCopyState('copied')
    } catch {
      setCopyState('error')
    }
    resetRef.current = window.setTimeout(() => setCopyState('idle'), 2_400)
  }

  return <section className="origin01-section origin01-community" aria-labelledby="origin01-community-title">
    <div className="origin01-section-heading">
      <p className="origin01-kicker">{community.eyebrow}</p>
      <h2 id="origin01-community-title">{community.heading}</h2>
    </div>
    <p className="origin01-community__introduction">{community.introduction}</p>
    <div className="origin01-community__actions">
      {community.instagram.enabled ? <article className="origin01-community__card origin01-community__card--instagram">
        <p>Instagram</p><strong className="origin01-community__identifier">@{community.instagram.handle.replace(/^@/, '')}</strong>
        <a href={instagramUrl(community.instagram.handle)} target="_blank" rel="noreferrer">
          {community.instagram.actionLabel}
        </a>
      </article> : null}
      {community.hashtag.enabled ? <article className="origin01-community__card origin01-community__card--hashtag">
        <p>Hashtag oficial</p><strong className="origin01-community__identifier">{community.hashtag.value}</strong>
        <button type="button" onClick={() => void copyHashtag()} aria-live="polite">
          {copyState === 'copied' ? community.hashtag.copiedLabel
            : copyState === 'error' ? 'No se pudo copiar' : community.hashtag.actionLabel}
        </button>
      </article> : null}
      {community.album.enabled ? <article className="origin01-community__card origin01-community__card--album">
        <p>Álbum compartido</p><strong>La historia vista por todos.</strong>
        <span>{community.album.invitation}</span>
        <a href={community.album.url} target="_blank" rel="noreferrer">
          {community.album.actionLabel}
        </a>
      </article> : null}
    </div>
  </section>
}
