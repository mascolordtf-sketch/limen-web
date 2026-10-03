import { useParams } from 'react-router-dom'

import { findStudioInvitation } from './studioInvitationRegistry'
import { StudioInvitationPage } from './StudioInvitationPage'
import { StudioUnavailablePage } from './StudioUnavailablePage'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'
import { useStudioInvitationPersistence } from './useStudioInvitationPersistence'

function StudioPersistenceMessage({ title, detail }: { title: string; detail: string }) {
  return <main className="limen-studio"><div className="limen-studio__workspace">
    <section className="limen-studio__panel limen-studio__persistence-message" aria-live="polite">
      <p className="limen-studio__eyebrow">LIMEN Studio</p>
      <h1>{title}</h1><p>{detail}</p>
    </section>
  </div></main>
}

function PersistedStudioInvitationRoute({ invitation }: { invitation: NonNullable<ReturnType<typeof findStudioInvitation>> }) {
  const persistence = useStudioInvitationPersistence(invitation)
  if (persistence.loadState.status === 'loading') {
    return <StudioPersistenceMessage title="Abriendo invitación…" detail="Estamos recuperando el último borrador guardado." />
  }
  if (persistence.loadState.status === 'error') {
    return <StudioPersistenceMessage title="No pudimos abrir el borrador" detail={persistence.loadState.message} />
  }

  return <StudioInvitationPage
    key={getOrigin01StudioDraftSessionId(invitation)}
    invitation={persistence.loadState.document}
    persisted={Boolean(persistence.loadState.persisted)}
    revision={persistence.loadState.persisted?.revision}
    updatedAt={persistence.loadState.persisted?.updatedAt}
    saveState={persistence.saveState}
    onSave={persistence.save}
    onUploadMedia={persistence.uploadMedia}
    onEdit={persistence.clearSaveFeedback}
  />
}

export function StudioInvitationRoute() {
  const { code } = useParams()
  const invitation = code ? findStudioInvitation(code) : undefined

  if (!invitation) return <StudioUnavailablePage code={code} />

  return <PersistedStudioInvitationRoute invitation={invitation} />
}
