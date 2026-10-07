import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import { StudioIcon } from './StudioIcon'
import { filterStudioInvitationSummaries, loadStudioInvitationSummaries } from './studioInvitationIndex'
import type { StudioInvitationFilter, StudioInvitationSummary } from './studioInvitationIndex'
import './studio.css'
import './studioInvitationIndex.css'

type InvitationIndexState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly invitations: readonly StudioInvitationSummary[] }
  | { readonly status: 'error'; readonly message: string }

const availabilityLabels: Record<StudioInvitationSummary['availability'], string> = {
  online: 'En línea',
  paused: 'Pausada',
  offline: 'Sin publicar',
  archived: 'Archivada',
}

const updatedAtFormatter = new Intl.DateTimeFormat('es-AR', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Buenos_Aires',
})

const filters: readonly { readonly id: StudioInvitationFilter; readonly label: string }[] = [
  { id: 'all', label: 'Todas' },
  { id: 'online', label: 'En línea' },
  { id: 'paused', label: 'Pausadas' },
  { id: 'archived', label: 'Archivadas' },
]

function StudioBrand() {
  return <div className="limen-studio__brand limen-studio-index__brand">
    <h1><Link className="limen-studio__brand-home" to="/studio" aria-label="Volver al inicio de Studio">
      <span className="limen-studio__brand-name">LIMEN</span><span>Studio</span>
    </Link></h1>
  </div>
}

function InvitationThumbnail({ invitation }: { invitation: StudioInvitationSummary }) {
  if (invitation.thumbnailSrc) {
    return <img className="limen-studio-index__thumbnail" src={invitation.thumbnailSrc} alt="" />
  }
  return <span className="limen-studio-index__thumbnail limen-studio-index__thumbnail--fallback" aria-hidden="true">
    {invitation.internalName.trim().charAt(0).toLocaleUpperCase('es-AR')}
  </span>
}

function InvitationRow({ invitation }: { invitation: StudioInvitationSummary }) {
  return <li className="limen-studio-index__row">
    <div className="limen-studio-index__identity">
      <InvitationThumbnail invitation={invitation} />
      <div>
        <h2>{invitation.internalName}</h2>
        {invitation.eventLabel && <p>{invitation.eventLabel}</p>}
        <span className="limen-studio-index__code">{invitation.code}</span>
      </div>
    </div>
    <div className="limen-studio-index__metadata" data-label="Publicación">
      <strong className={`limen-studio-index__availability limen-studio-index__availability--${invitation.availability}`}>
        <span aria-hidden="true" />{availabilityLabels[invitation.availability]}
      </strong>
      <small>{invitation.sourceLabel}</small>
    </div>
    <div className="limen-studio-index__metadata" data-label="Trabajo">
      <strong className={`limen-studio-index__work-status limen-studio-index__work-status--${invitation.projectStatus}`}>
        {invitation.projectStatusLabel}
      </strong>
      <small>{invitation.draftRevision
        ? `Revisión ${invitation.draftRevision}`
        : invitation.publicationRevision
          ? `Versión ${invitation.publicationRevision}`
          : 'Sin borrador'}</small>
    </div>
    <div className="limen-studio-index__metadata" data-label="Actualizada">
      <strong>{updatedAtFormatter.format(new Date(invitation.updatedAt))}</strong>
      {invitation.hasUnpublishedChanges && <small className="limen-studio-index__pending">Cambios en edición</small>}
    </div>
    <div className="limen-studio-index__actions">
      {invitation.editable
        ? <Link className="limen-studio-index__open" to={`/studio/invitaciones/${invitation.code}`}>Abrir Studio</Link>
        : <button className="limen-studio-index__open" type="button" disabled>Editor no disponible</button>}
      <details className="limen-studio-index__menu">
        <summary aria-label={`Más acciones para ${invitation.internalName}`}>•••</summary>
        <div>
          <a href={`/invitacion/${invitation.code}`} target="_blank" rel="noreferrer">Ver invitación</a>
          <p>{invitation.sourceLabel === 'Ficha estable'
            ? 'Esta invitación continúa protegida por su ficha estable.'
            : 'Las operaciones públicas se incorporarán en la siguiente etapa.'}</p>
        </div>
      </details>
    </div>
  </li>
}

type StudioInvitationsViewProps = {
  readonly email?: string
  readonly invitations: readonly StudioInvitationSummary[]
  readonly onSignOut: () => void
}

export function StudioInvitationsView({ email, invitations, onSignOut }: StudioInvitationsViewProps) {
  const [filter, setFilter] = useState<StudioInvitationFilter>('all')
  const [query, setQuery] = useState('')
  const visibleInvitations = useMemo(
    () => filterStudioInvitationSummaries(invitations, filter, query),
    [filter, invitations, query],
  )
  const onlineCount = invitations.filter(({ availability }) => availability === 'online').length
  const pendingCount = invitations.filter(({ hasUnpublishedChanges }) => hasUnpublishedChanges).length

  return <div className="limen-studio limen-studio--index">
    <div className="limen-studio-index">
      <header className="limen-studio__header limen-studio-index__app-header">
        <StudioBrand />
        <Link className="limen-studio-index__home-link" to="/studio">
          <StudioIcon name="home" />Inicio
        </Link>
        <div className="limen-studio-index__account">
          {email && <span>{email}</span>}
          <button className="limen-studio__back-link" type="button" onClick={onSignOut}>
            <StudioIcon name="exit" />Cerrar sesión
          </button>
        </div>
      </header>

      <main className="limen-studio-index__main">
        <header className="limen-studio-index__heading">
          <div><p className="limen-studio__eyebrow">Studio</p><h1>Invitaciones</h1>
            <p>Gestioná el trabajo y la disponibilidad pública desde un solo lugar.</p></div>
          <Link className="limen-studio-index__new" to="/studio/nueva">
            <span aria-hidden="true">＋</span>Nueva invitación
          </Link>
        </header>

        <section className="limen-studio-index__panel" aria-labelledby="invitations-summary">
          <div className="limen-studio-index__summary" id="invitations-summary">
            <strong>{invitations.length} {invitations.length === 1 ? 'invitación' : 'invitaciones'}</strong>
            <span aria-hidden="true">•</span><span>{onlineCount} en línea</span>
            {pendingCount > 0 && <><span aria-hidden="true">•</span>
              <span className="limen-studio-index__pending">{pendingCount} con cambios en edición</span></>}
          </div>

          <div className="limen-studio-index__toolbar">
            <label className="limen-studio-index__search">
              <span className="sr-only">Buscar invitaciones</span>
              <span aria-hidden="true">⌕</span>
              <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                placeholder="Buscar por nombre o código" />
            </label>
            <div className="limen-studio-index__filters" aria-label="Filtrar invitaciones">
              {filters.map(({ id, label }) => <button key={id} type="button" aria-pressed={filter === id}
                onClick={() => setFilter(id)}>{label}
                {id !== 'all' && <small>{invitations.filter(({ availability }) => availability === id).length}</small>}
              </button>)}
            </div>
          </div>

          {visibleInvitations.length > 0 ? <>
            <div className="limen-studio-index__columns" aria-hidden="true">
              <span>Invitación</span><span>Publicación</span><span>Trabajo</span><span>Actualizada</span><span />
            </div>
            <ul className="limen-studio-index__list">
              {visibleInvitations.map((invitation) => <InvitationRow key={invitation.projectId} invitation={invitation} />)}
            </ul>
          </> : <div className="limen-studio-index__empty">
            <h2>No encontramos invitaciones</h2>
            <p>Probá con otro nombre, código o estado.</p>
          </div>}
        </section>

        <p className="limen-studio-index__footnote">
          <span aria-hidden="true">✓</span>Las fichas estables siguen protegidas; no se modifica su entrega pública desde este panel.
        </p>
      </main>
    </div>
  </div>
}

export function StudioInvitationsPage() {
  const { email, signOut } = useStudioAuth()
  const [state, setState] = useState<InvitationIndexState>({ status: 'loading' })
  const [requestKey, setRequestKey] = useState(0)

  useEffect(() => {
    let active = true
    void loadStudioInvitationSummaries()
      .then((invitations) => {
        if (active) setState({ status: 'ready', invitations })
      })
      .catch((error: unknown) => {
        if (active) setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'No pudimos recuperar las invitaciones.',
        })
      })
    return () => { active = false }
  }, [requestKey])

  const retry = () => {
    setState({ status: 'loading' })
    setRequestKey((current) => current + 1)
  }

  if (state.status === 'loading') {
    return <main className="limen-studio limen-studio-index__state" aria-live="polite">
      <p className="limen-studio__eyebrow">LIMEN Studio</p><h1>Abriendo invitaciones…</h1>
      <p>Estamos recuperando los proyectos disponibles para tu cuenta.</p>
    </main>
  }
  if (state.status === 'error') {
    return <main className="limen-studio limen-studio-index__state" role="alert">
      <p className="limen-studio__eyebrow">LIMEN Studio</p><h1>No pudimos abrir el panel</h1>
      <p>{state.message}</p><button type="button" onClick={retry}>Reintentar</button>
    </main>
  }
  return <StudioInvitationsView email={email} invitations={state.invitations} onSignOut={() => void signOut()} />
}
