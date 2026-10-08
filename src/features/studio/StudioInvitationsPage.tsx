import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import { StudioIcon } from './StudioIcon'
import { filterStudioInvitationSummaries, loadStudioInvitationSummaries,
  sortStudioInvitationSummaries } from './studioInvitationIndex'
import type { StudioInvitationFilter, StudioInvitationSort,
  StudioInvitationSummary } from './studioInvitationIndex'
import { applyStudioInvitationLifecycleResult, getStudioInvitationLifecycleOptions,
  updateStudioInvitationLifecycle } from './studioInvitationLifecycle'
import type { StudioInvitationLifecycleAction,
  StudioInvitationLifecycleOption } from './studioInvitationLifecycle'
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

type InvitationRowProps = {
  readonly invitation: StudioInvitationSummary
  readonly onLifecycleAction: (projectId: string, action: StudioInvitationLifecycleAction) => Promise<void>
}

function InvitationRow({ invitation, onLifecycleAction }: InvitationRowProps) {
  const menuRef = useRef<HTMLDetailsElement>(null)
  const [confirmation, setConfirmation] = useState<StudioInvitationLifecycleOption>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const lifecycleOptions = getStudioInvitationLifecycleOptions(invitation)

  const confirmLifecycleAction = async () => {
    if (!confirmation || busy) return
    setBusy(true)
    setError(undefined)
    try {
      await onLifecycleAction(invitation.projectId, confirmation.action)
      setConfirmation(undefined)
      menuRef.current?.removeAttribute('open')
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : 'No pudimos actualizar la invitación.')
    } finally {
      setBusy(false)
    }
  }

  return <li className="limen-studio-index__row">
    <div className="limen-studio-index__identity">
      <InvitationThumbnail invitation={invitation} />
      <div>
        <span className="limen-studio-index__management-label">Nombre de la invitación</span>
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
      <details className="limen-studio-index__menu" ref={menuRef}
        onToggle={(event) => {
          if (!event.currentTarget.open && !busy) {
            setConfirmation(undefined)
            setError(undefined)
          }
        }}>
        <summary aria-label={`Más acciones para ${invitation.internalName}`}>•••</summary>
        <div>
          <a href={`/invitacion/${invitation.code}`} target="_blank" rel="noreferrer">Ver invitación</a>
          <div className="limen-studio-index__menu-divider" />
          {lifecycleOptions.map((option) => <button key={option.action} type="button"
            className={option.destructive ? 'limen-studio-index__menu-action--destructive' : undefined}
            disabled={busy} onClick={() => { setConfirmation(option); setError(undefined) }}>
            {option.label}
          </button>)}
          {confirmation && <div className="limen-studio-index__confirmation" role="group"
            aria-label={`Confirmar: ${confirmation.label}`}>
            <strong>{confirmation.label}</strong>
            <p>{confirmation.confirmation}</p>
            {error && <p className="limen-studio-index__action-error" role="alert">{error}</p>}
            <div>
              <button type="button" disabled={busy} onClick={() => setConfirmation(undefined)}>Cancelar</button>
              <button type="button" disabled={busy} data-emphasis={confirmation.destructive ? 'danger' : 'primary'}
                onClick={() => void confirmLifecycleAction()}>{busy ? 'Actualizando…' : 'Confirmar'}</button>
            </div>
          </div>}
        </div>
      </details>
    </div>
  </li>
}

type StudioInvitationsViewProps = {
  readonly email?: string
  readonly invitations: readonly StudioInvitationSummary[]
  readonly onSignOut: () => void
  readonly onLifecycleAction: (projectId: string, action: StudioInvitationLifecycleAction) => Promise<void>
  readonly refreshNotice?: string
}

export function StudioInvitationsView({ email, invitations, onSignOut,
  onLifecycleAction, refreshNotice }: StudioInvitationsViewProps) {
  const location = useLocation()
  const [filter, setFilter] = useState<StudioInvitationFilter>('all')
  const [sort, setSort] = useState<StudioInvitationSort>('updated-desc')
  const [query, setQuery] = useState('')
  const visibleInvitations = useMemo(
    () => sortStudioInvitationSummaries(
      filterStudioInvitationSummaries(invitations, filter, query), sort,
    ),
    [filter, invitations, query, sort],
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
            <p>Creá, encontrá y administrá tus invitaciones.</p></div>
          <Link className="limen-studio-index__new" to="/studio/nueva" state={{ returnTo: location.pathname }}>
            <span aria-hidden="true">＋</span>Nueva invitación
          </Link>
        </header>

        <section className="limen-studio-index__panel" aria-labelledby="invitations-summary">
          {refreshNotice && <p className="limen-studio-index__refresh-notice" role="status">{refreshNotice}</p>}
          <div className="limen-studio-index__controls">
            <div className="limen-studio-index__summary" id="invitations-summary">
              <strong>{invitations.length} {invitations.length === 1 ? 'invitación' : 'invitaciones'}</strong>
              <span>{onlineCount} en línea{pendingCount > 0 ? ` · ${pendingCount} con cambios` : ''}</span>
            </div>

            <div className="limen-studio-index__toolbar">
              <label className="limen-studio-index__search">
                <span className="sr-only">Buscar invitaciones</span>
                <span aria-hidden="true">⌕</span>
                <input type="search" value={query} onChange={(event) => setQuery(event.target.value)}
                  placeholder="Buscar por nombre o código" />
              </label>
              <label className="limen-studio-index__sort">
                <span>Ordenar:</span>
                <select value={sort} onChange={(event) => setSort(event.target.value as StudioInvitationSort)}>
                  <option value="updated-desc">Más recientes</option>
                  <option value="name-asc">Nombre</option>
                  <option value="event-asc">Fecha del evento</option>
                </select>
              </label>
              <div className="limen-studio-index__filters" aria-label="Filtrar invitaciones">
                {filters.map(({ id, label }) => <button key={id} type="button" aria-pressed={filter === id}
                  onClick={() => setFilter(id)}>{label}
                  {id !== 'all' && <small>{invitations.filter(({ availability }) => availability === id).length}</small>}
                </button>)}
              </div>
            </div>
          </div>

          {visibleInvitations.length > 0 ? <>
            <div className="limen-studio-index__columns" aria-hidden="true">
              <span>Nombre de la invitación / código</span><span>Publicación</span><span>Trabajo</span><span>Actualizada</span><span />
            </div>
            <ul className="limen-studio-index__list">
              {visibleInvitations.map((invitation) => <InvitationRow key={invitation.projectId}
                invitation={invitation} onLifecycleAction={onLifecycleAction} />)}
            </ul>
          </> : <div className="limen-studio-index__empty">
            <h2>No encontramos invitaciones</h2>
            <p>Probá con otro nombre, código o estado.</p>
          </div>}
        </section>

        <p className="limen-studio-index__footnote">
          <span aria-hidden="true">✓</span>El nombre de la invitación es privado: sirve para organizar Studio y no aparece públicamente.
        </p>
      </main>
    </div>
  </div>
}

export function StudioInvitationsPage() {
  const { email, signOut } = useStudioAuth()
  const [state, setState] = useState<InvitationIndexState>({ status: 'loading' })
  const [requestKey, setRequestKey] = useState(0)
  const [refreshNotice, setRefreshNotice] = useState<string>()

  useEffect(() => {
    let active = true
    void loadStudioInvitationSummaries()
      .then((invitations) => {
        if (active) {
          setState({ status: 'ready', invitations })
          setRefreshNotice(undefined)
        }
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

  const handleLifecycleAction = async (projectId: string, action: StudioInvitationLifecycleAction) => {
    const result = await updateStudioInvitationLifecycle(projectId, action)
    setState((current) => current.status === 'ready'
      ? { status: 'ready', invitations: current.invitations.map((invitation) =>
        applyStudioInvitationLifecycleResult(invitation, result)) }
      : current)
    setRefreshNotice(undefined)
    try {
      const invitations = await loadStudioInvitationSummaries()
      setState({ status: 'ready', invitations })
    } catch {
      setRefreshNotice('El estado se actualizó correctamente, pero no pudimos refrescar todos los datos.')
    }
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
  return <StudioInvitationsView email={email} invitations={state.invitations}
    onSignOut={() => void signOut()} onLifecycleAction={handleLifecycleAction} refreshNotice={refreshNotice} />
}
