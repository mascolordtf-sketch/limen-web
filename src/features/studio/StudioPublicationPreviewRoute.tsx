import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'

import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { Origin01Invitation } from '../invitations/origin01/Origin01Invitation'
import { maiaInvitationData } from '../invitations/origin01/maiaInvitationData'
import { findOrigin01TypographyCombination } from '../invitations/origin01/origin01Typography'
import { loadStudioPublicationPreview, StudioPublicationError } from './studioPublication'

type PreviewState =
  | { readonly status: 'loading' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly invitation: Origin01InvitationData }

export function StudioPublicationPreviewRoute() {
  const { publicationId } = useParams()
  const [searchParams] = useSearchParams()
  const [state, setState] = useState<PreviewState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    if (!publicationId) return () => { active = false }
    void loadStudioPublicationPreview(publicationId)
      .then((invitation) => { if (active) setState({ status: 'ready', invitation }) })
      .catch((error: unknown) => {
        if (!active) return
        setState({
          status: 'error',
          message: error instanceof StudioPublicationError
            ? error.message
            : 'No pudimos abrir la publicación.',
        })
      })
    return () => { active = false }
  }, [publicationId])

  if (state.status !== 'ready') {
    return <main className="limen-studio"><section className="limen-studio__panel limen-studio__persistence-message"
      aria-live="polite"><p className="limen-studio__eyebrow">Snapshot privado</p>
      <h1>{state.status === 'loading' ? 'Abriendo publicación…' : 'No pudimos abrir la publicación'}</h1>
      {state.status === 'error' && <p>{state.message}</p>}
    </section></main>
  }

  const audience = searchParams.get('vista') === 'invitado' ? 'guest' : 'protagonist'
  const typography = state.invitation.code === maiaInvitationData.code
    ? findOrigin01TypographyCombination('romantica-clasica')
    : undefined
  return <Origin01Invitation invitation={state.invitation} audience={audience} typography={typography}
    startAtInvitation={searchParams.get('inicio') === 'invitacion'} />
}
