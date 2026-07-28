import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import type { Origin01StudioValidation, StudioDomainStatus, StudioSceneStatus } from './origin01StudioValidation'
import type { StudioDomainDefinition, StudioNavigationItem, StudioNavigationState } from './studioNavigation'
import type { StudioNavigationAction } from './studioNavigation'

type Props = {
  domains: readonly StudioDomainDefinition[]
  navigation: StudioNavigationState
  validation: Origin01StudioValidation
  editor: ReactNode
  editorResolvable: boolean
  onNavigate: (action: StudioNavigationAction) => void
}

function statusText(status?: StudioDomainStatus | StudioSceneStatus) {
  if (!status) return 'Estado no disponible'
  const parts = [status.complete ? 'Completo' : 'Incompleto']
  if ('active' in status && !status.active) parts.splice(0, 1, 'Contenido inactivo')
  if (status.relevantErrorCount) parts.push(`${status.relevantErrorCount} ${status.relevantErrorCount === 1 ? 'error' : 'errores'}`)
  if (status.warningCount) parts.push(`${status.warningCount} ${status.warningCount === 1 ? 'advertencia' : 'advertencias'}`)
  if (status.hasContentPendingReview) parts.push('Revisión editorial pendiente')
  if (status.blocksPreview) parts.push('Error estructural')
  return parts.join(' · ')
}

export function StudioNavigationShell({ domains, navigation, validation, editor,
  editorResolvable, onNavigate }: Props) {
  const activeDomain = domains.find(({ id }) => id === navigation.domainId) ?? domains[0]
  const activeItem = activeDomain?.items.find(({ id }) => id === navigation.itemId)
  const editorTitle = useRef<HTMLHeadingElement>(null)
  const explicitNavigation = useRef(false)
  const navigate = (action: StudioNavigationAction) => { explicitNavigation.current = true; onNavigate(action) }
  useEffect(() => {
    if (navigation.mobileLevel === 'editor' && explicitNavigation.current) editorTitle.current?.focus()
    explicitNavigation.current = false
  }, [navigation.domainId, navigation.itemId, navigation.mobileLevel])

  const itemStatus = (item: StudioNavigationItem) => item.sceneId
    ? validation.sceneStatuses.find(({ sceneId }) => sceneId === item.sceneId)
    : undefined
  return <div className={`limen-studio__shell limen-studio__shell--${navigation.mobileLevel}`}>
    <nav className="limen-studio__primary-nav" aria-label="Dominios de la invitación">
      <h2>Índice general</h2>
      <div className="limen-studio__nav-list">
        {domains.map((domain) => {
          const status = validation.domainStatuses.find(({ domainId }) => domainId === domain.id)
          return <button key={domain.id} type="button" aria-current={domain.id === activeDomain?.id ? 'page' : undefined}
            aria-label={`${domain.label}. ${statusText(status)}`}
            onClick={() => navigate({ type: 'open-domain', domainId: domain.id })}>
            <strong>{domain.label}</strong><span>{statusText(status)}</span>
          </button>
        })}
      </div>
    </nav>

    <nav className="limen-studio__secondary-nav" aria-label={`Secciones de ${activeDomain?.label ?? 'dominio'}`}>
      <button className="limen-studio__mobile-back" type="button"
        onClick={() => navigate({ type: 'show-general-index' })}>← Índice general</button>
      <h2>{activeDomain?.label}</h2><p>{activeDomain?.description}</p>
      <div className="limen-studio__nav-list">
        {activeDomain?.items.map((item) => <button key={item.id} type="button"
          aria-current={item.id === activeItem?.id ? 'page' : undefined}
          onClick={() => navigate({ type: 'open-item', domainId: activeDomain.id, item })}>
          <strong>{item.label}</strong><span>{statusText(itemStatus(item))}</span>
        </button>)}
      </div>
    </nav>

    <main className="limen-studio__active-editor">
      <div className="limen-studio__mobile-context">
        <button type="button" onClick={() => navigate({ type: 'show-domain-index' })}>← {activeDomain?.label}</button>
        <button type="button" onClick={() => navigate({ type: 'show-general-index' })}>Índice</button>
      </div>
      <p className="limen-studio__breadcrumb" aria-label="Ubicación">Invitación / {activeDomain?.label} / {activeItem?.label}</p>
      <h2 className="limen-studio__editor-title" ref={editorTitle} tabIndex={-1}>{activeItem?.label ?? 'Elegí una sección'}</h2>
      {activeItem && <p>{activeItem.description}</p>}
      {activeItem && <p className="limen-studio__section-status" role="status">{statusText(itemStatus(activeItem))}</p>}
      {editorResolvable ? editor : <section className="limen-studio__panel" role="alert">
        <h3>Editor no disponible</h3><p>Esta sección tiene un destino explícito, pero todavía no posee un editor compatible.</p>
      </section>}
    </main>
  </div>
}
