import { useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioInvitationsPage } from './StudioInvitationsPage'
import { createNewStudioInvitation } from './studioNewInvitation'
import { saveStudioDraft, StudioPersistenceError } from './studioPersistence'
import './studioNewInvitation.css'

type NewInvitationLocationState = { readonly returnTo?: string }

export function StudioNewInvitationRoute() {
  const { userId } = useStudioAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [error, setError] = useState<string>()
  const [creating, setCreating] = useState(false)
  const invitationRef = useRef<Origin01InvitationData | undefined>(undefined)
  const returnTo = (location.state as NewInvitationLocationState | null)?.returnTo ?? '/studio/invitaciones'

  const close = () => {
    if (!creating) navigate(returnTo, { replace: true })
  }

  const createInvitation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const invitationName = name.trim()
    if (!invitationName) {
      setError('Ingresá un nombre para identificar la invitación.')
      return
    }
    if (!userId || creating) return

    setCreating(true)
    setError(undefined)
    const invitation = invitationRef.current
      ? { ...invitationRef.current, internalName: invitationName }
      : createNewStudioInvitation(invitationName)
    invitationRef.current = invitation

    try {
      const saved = await saveStudioDraft({
        baseInvitation: invitation,
        document: invitation,
        userId,
      })
      navigate(`/studio/invitaciones/${saved.document.code}`, { replace: true })
    } catch (creationError) {
      setError(creationError instanceof StudioPersistenceError
        ? creationError.message
        : 'No pudimos crear la invitación. Intentá nuevamente.')
      setCreating(false)
    }
  }

  return <div className="limen-studio-new">
    <div className="limen-studio-new__background" inert aria-hidden="true">
      <StudioInvitationsPage />
    </div>
    <div className="limen-studio-new__backdrop" role="presentation"
      onKeyDown={(event) => { if (event.key === 'Escape') close() }}
      onMouseDown={(event) => { if (event.target === event.currentTarget) close() }}>
      <section className="limen-studio-new__dialog" role="dialog" aria-modal="true"
        aria-labelledby="studio-new-title" aria-describedby="studio-new-description">
        <button className="limen-studio-new__close" type="button" onClick={close}
          disabled={creating} aria-label="Cerrar">×</button>
        <p className="limen-studio__eyebrow">Nueva invitación</p>
        <h1 id="studio-new-title">Poné un nombre a tu invitación</h1>
        <p id="studio-new-description">Este nombre es privado y te ayudará a encontrarla en Studio.</p>
        <form onSubmit={(event) => void createInvitation(event)}>
          <label htmlFor="studio-new-invitation-name">Nombre de la invitación</label>
          <input id="studio-new-invitation-name" type="text" autoFocus maxLength={120}
            value={name} onChange={(event) => { setName(event.target.value); setError(undefined) }}
            placeholder="Ej.: 15 años de Maia" aria-invalid={error ? true : undefined}
            aria-describedby={error ? 'studio-new-name-help studio-new-name-error' : 'studio-new-name-help'} />
          <small id="studio-new-name-help">Podés cambiarlo más adelante.</small>
          {error && <p className="limen-studio-new__error" id="studio-new-name-error" role="alert">{error}</p>}
          <div className="limen-studio-new__actions">
            <button type="button" onClick={close} disabled={creating}>Cancelar</button>
            <button type="submit" disabled={creating || !name.trim()}>
              {creating ? 'Creando…' : 'Crear invitación'}
            </button>
          </div>
        </form>
      </section>
    </div>
  </div>
}
