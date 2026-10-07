import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { findStudioInvitation } from './studioInvitationRegistry'
import { StudioInvitationPage } from './StudioInvitationPage'
import { StudioUnavailablePage } from './StudioUnavailablePage'
import { getOrigin01StudioDraftSessionId } from './origin01StudioDraft'
import { useStudioInvitationPersistence } from './useStudioInvitationPersistence'
import { loadStudioDraft } from './studioPersistence'
import type { LoadedStudioDraft } from './studioPersistence'

function StudioPersistenceMessage({ title, detail }: { title: string; detail: string }) {
  return <main className="limen-studio"><div className="limen-studio__workspace">
    <section className="limen-studio__panel limen-studio__persistence-message" aria-live="polite">
      <p className="limen-studio__eyebrow">LIMEN Studio</p>
      <h1>{title}</h1><p>{detail}</p>
    </section>
  </div></main>
}

type PersistedStudioInvitationRouteProps = {
  readonly invitation: Origin01InvitationData
  readonly initialLoad?: LoadedStudioDraft
  readonly onFirstPersist?: (code: string) => void
}

export function PersistedStudioInvitationRoute({ invitation, initialLoad, onFirstPersist }:
PersistedStudioInvitationRouteProps) {
  const persistence = useStudioInvitationPersistence(invitation, initialLoad)
  const persistInvitation = persistence.save
  const hasPersistedDraft = persistence.loadState.status === 'ready' && Boolean(persistence.loadState.persisted)
  const save = useCallback(async (document: Origin01InvitationData) => {
    const saved = await persistInvitation(document)
    if (saved && !hasPersistedDraft) onFirstPersist?.(document.code)
    return saved
  }, [hasPersistedDraft, onFirstPersist, persistInvitation])
  if (persistence.loadState.status === 'loading') {
    return <StudioPersistenceMessage title="Abriendo invitación…" detail="Estamos recuperando el último borrador guardado." />
  }
  if (persistence.loadState.status === 'error') {
    return <StudioPersistenceMessage title="No pudimos abrir el borrador" detail={persistence.loadState.message} />
  }

  return <StudioInvitationPage
    key={getOrigin01StudioDraftSessionId(invitation)}
    invitation={persistence.loadState.document}
    publicBaseline={invitation}
    persisted={Boolean(persistence.loadState.persisted)}
    requiresSave={persistence.loadState.requiresSave}
    revision={persistence.loadState.persisted?.revision}
    updatedAt={persistence.loadState.persisted?.updatedAt}
    saveState={persistence.saveState}
    publication={persistence.loadState.publication}
    publicationState={persistence.publicationState}
    onSave={save}
    onPublish={persistence.publish}
    onUploadMedia={persistence.uploadMedia}
    onEdit={persistence.clearSaveFeedback}
  />
}

type DynamicInvitationState =
  | { readonly status: 'loading' }
  | { readonly status: 'unavailable' }
  | { readonly status: 'error'; readonly message: string }
  | { readonly status: 'ready'; readonly invitation: Origin01InvitationData; readonly loaded: LoadedStudioDraft }

function DynamicStudioInvitationRoute({ code }: { readonly code: string }) {
  const [state, setState] = useState<DynamicInvitationState>({ status: 'loading' })

  useEffect(() => {
    let active = true
    void loadStudioDraft(code)
      .then((loaded) => {
        if (!active) return
        if (!loaded.persisted) setState({ status: 'unavailable' })
        else setState({ status: 'ready', invitation: loaded.persisted.document, loaded })
      })
      .catch((error: unknown) => {
        if (active) setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'No pudimos abrir esta invitación en Studio.',
        })
      })
    return () => { active = false }
  }, [code])

  if (state.status === 'loading') {
    return <StudioPersistenceMessage title="Abriendo invitación…" detail="Estamos recuperando el último borrador guardado." />
  }
  if (state.status === 'error') {
    return <StudioPersistenceMessage title="No pudimos abrir el borrador" detail={state.message} />
  }
  if (state.status === 'unavailable') return <StudioUnavailablePage code={code} />
  return <PersistedStudioInvitationRoute invitation={state.invitation} initialLoad={state.loaded} />
}

export function StudioInvitationRoute() {
  const { code } = useParams()
  const invitation = code ? findStudioInvitation(code) : undefined

  if (!code) return <StudioUnavailablePage />
  if (!invitation) return <DynamicStudioInvitationRoute code={code} />

  return <PersistedStudioInvitationRoute invitation={invitation} />
}
