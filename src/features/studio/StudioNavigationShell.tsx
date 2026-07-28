import { useEffect, useRef } from 'react'
import type { ReactNode } from 'react'

import type { Origin01StudioValidation } from './origin01StudioValidation'
import { selectStudioItemStatus } from './studioItemStatus'
import type { StudioVisibleItemStatus } from './studioItemStatus'
import type { StudioDomainDefinition, StudioNavigationItem, StudioNavigationState } from './studioNavigation'
import type { StudioNavigationAction } from './studioNavigation'

type Props = {
  domains: readonly StudioDomainDefinition[]
  navigation: StudioNavigationState
  validation: Origin01StudioValidation
  editor: ReactNode
  editorResolvable: boolean
  onNavigate: (action: StudioNavigationAction) => void
  preview?: ReactNode
  previewCollapsed?: boolean
  previewAudience: string
  previewStatus: string
  previewDedicated?: boolean
  onOpenPreview: () => void
  onShowPreview: () => void
  correctionReturn?: boolean
  onReturnToErrors: () => void
}

function statusText(status?: StudioVisibleItemStatus) {
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
  editorResolvable, onNavigate, preview, previewCollapsed, previewAudience, previewStatus, previewDedicated, onOpenPreview, onShowPreview,
  correctionReturn, onReturnToErrors }: Props) {
  const activeDomain = domains.find(({ id }) => id === navigation.domainId) ?? domains[0]
  const activeItem = activeDomain?.items.find(({ id }) => id === navigation.itemId)
  const editorTitle = useRef<HTMLHeadingElement>(null)
  const explicitNavigation = useRef(false)
  const navigate = (action: StudioNavigationAction) => { explicitNavigation.current = true; onNavigate(action) }
  useEffect(() => {
    if (navigation.mobileLevel === 'editor' && explicitNavigation.current) editorTitle.current?.focus()
    explicitNavigation.current = false
  }, [navigation.domainId, navigation.itemId, navigation.mobileLevel])

  const itemStatus = (item: StudioNavigationItem) => selectStudioItemStatus(validation, item, activeDomain.id)
  return <div className={`limen-studio__shell limen-studio__shell--${navigation.mobileLevel} ${previewCollapsed ? 'limen-studio__shell--preview-collapsed' : ''}`}>
    <nav className="limen-studio__primary-nav" aria-label="Dominios de la invitación" inert={previewDedicated ? true : undefined}>
      <h2>Índice general</h2>
      <button className="limen-studio__mobile-preview-action" type="button" onClick={onOpenPreview}>Ver preview</button>
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

    <nav className="limen-studio__secondary-nav" aria-label={`Secciones de ${activeDomain?.label ?? 'dominio'}`} inert={previewDedicated ? true : undefined}>
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

    <main className="limen-studio__active-editor" inert={previewDedicated ? true : undefined}>
      <div className="limen-studio__mobile-context">
        <button type="button" onClick={() => navigate({ type: 'show-domain-index' })}>← {activeDomain?.label}</button>
        <button type="button" onClick={() => navigate({ type: 'show-general-index' })}>Índice</button>
      </div>
      <button className="limen-studio__mobile-preview-action" type="button" onClick={onOpenPreview}>Ver preview</button>
      <p className="limen-studio__breadcrumb" aria-label="Ubicación">Invitación / {activeDomain?.label} / {activeItem?.label}</p>
      <h2 className="limen-studio__editor-title" ref={editorTitle} tabIndex={-1}>{activeItem?.label ?? 'Elegí una sección'}</h2>
      {correctionReturn && <button className="limen-studio__return-errors" type="button" onClick={onReturnToErrors}>← Volver a Errores</button>}
      {activeItem && <p>{activeItem.description}</p>}
      {activeItem && <p className="limen-studio__section-status" role="status">{statusText(itemStatus(activeItem))}</p>}
      {!activeItem ? <section className="limen-studio__panel">
        <h3>Elegí una sección</h3><p>Seleccioná una unidad de {activeDomain?.label} para comenzar.</p>
      </section> : editorResolvable ? editor : <section className="limen-studio__panel" role="alert">
        <h3>Editor no disponible</h3><p>Esta sección tiene un destino explícito, pero todavía no posee un editor compatible.</p>
      </section>}
    </main>
    <aside className={`limen-studio__desktop-preview ${previewDedicated ? 'limen-studio__desktop-preview--dedicated' : ''}`}
      aria-labelledby={previewDedicated ? 'studio-preview-renderer-title' : undefined} aria-label={previewDedicated ? undefined : 'Preview de la invitación'}>
      {previewCollapsed && <div className="limen-studio__preview-collapsed"><strong>Preview</strong><span>{previewAudience}</span><span>{previewStatus}</span>
        <button type="button" onClick={onShowPreview}>Mostrar preview</button></div>}
      <div hidden={previewCollapsed} inert={previewCollapsed ? true : undefined}>{preview}</div>
    </aside>
  </div>
}
