import { useMemo, useReducer } from 'react'

import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import { createStudioTemplateGalleryState, createStudioTemplateOptions,
  transitionStudioTemplateGallery } from './studioTemplateGallery'
import type { StudioTemplateGalleryState, StudioTemplateOption } from './studioTemplateGallery'

function AvailableTemplateCard({ template, selected, onSelect }: {
  template: StudioTemplateOption
  selected: boolean
  onSelect: () => void
}) {
  return <article className={`limen-studio__template-card limen-studio__template-card--available${selected ? ' is-selected' : ''}`}
    aria-label={`${template.name}, ${selected ? 'seleccionada' : 'disponible'}`}>
    <div className="limen-studio__template-preview">
      <img src={template.preview.src} alt={template.preview.alt} />
      <span>Experiencia narrativa</span>
    </div>
    <div className="limen-studio__template-card-copy">
      <div className="limen-studio__template-card-meta"><span>Colección {template.collection}</span>
        <strong><span aria-hidden="true">✓</span> {selected ? 'Seleccionada' : 'Disponible'}</strong></div>
      <div className="limen-studio__template-card-title"><h3>{template.name}</h3></div>
      <p>{template.description}</p>
      <ul className="limen-studio__template-highlights" aria-label="Escenas y capacidades destacadas">
        {template.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}
      </ul>
      <div className="limen-studio__template-actions">
        <button type="button" aria-pressed={selected} onClick={onSelect}>
          <span aria-hidden="true">{selected ? '✓' : '○'}</span> {selected ? 'Plantilla seleccionada' : 'Seleccionar plantilla'}
        </button>
        {template.demoPath && <a href={template.demoPath} target="_blank" rel="noopener noreferrer"
          aria-label={`Ver demostración completa de ${template.name} (se abre en una pestaña nueva)`}>
          Ver demostración <span aria-hidden="true">↗</span>
        </a>}
      </div>
    </div>
  </article>
}

function FutureTemplateCard({ template }: { template: StudioTemplateOption }) {
  return <li className="limen-studio__template-card limen-studio__template-card--future">
    <img src={template.preview.src} alt={template.preview.alt} />
    <div className="limen-studio__template-card-copy">
      <div className="limen-studio__template-card-meta"><span>{template.collection}</span><strong>Próximamente</strong></div>
      <h3>{template.name}</h3><p>{template.description}</p>
      <p className="limen-studio__quiet-note">Este anticipo todavía no se puede seleccionar.</p>
    </div>
  </li>
}

export function StudioTemplateStage({ template, demoPath, initialState, state: controlledState, onStateChange,
  onGalleryViewChange }: {
  template: InvitationTemplateDefinition
  demoPath?: string
  initialState?: StudioTemplateGalleryState
  state?: StudioTemplateGalleryState
  onStateChange?: (state: StudioTemplateGalleryState) => void
  onGalleryViewChange?: (view: StudioTemplateGalleryState['view']) => void
}) {
  const templates = useMemo(() => createStudioTemplateOptions(template, demoPath), [template, demoPath])
  const [internalState, dispatch] = useReducer(transitionStudioTemplateGallery,
    initialState ?? createStudioTemplateGalleryState(template.id))
  const state = controlledState ?? internalState
  const transition = (action: Parameters<typeof transitionStudioTemplateGallery>[1]) => {
    if (controlledState) onStateChange?.(transitionStudioTemplateGallery(controlledState, action))
    else dispatch(action)
  }
  const available = templates.find(({ selectable }) => selectable)!
  const selected = state.selectedId === available.id
  const changeView = (view: StudioTemplateGalleryState['view']) => {
    transition({ type: view === 'gallery' ? 'open-gallery' : 'close-gallery' }); onGalleryViewChange?.(view)
  }

  if (state.view === 'gallery') return <section className="limen-studio__template-stage" aria-labelledby="studio-template-gallery-title">
    <button className="limen-studio__template-back" type="button" onClick={() => changeView('main')}>← Volver a Origin 01</button>
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Exploraciones futuras</p>
      <h2 id="studio-template-gallery-title">Próximamente</h2>
      <p>Estas direcciones visuales son anticipos. No son plantillas funcionales y no modifican tu borrador.</p></div>
    <ul className="limen-studio__template-grid limen-studio__template-grid--future">
      {templates.filter(({ exploration }) => exploration).map((option) => <FutureTemplateCard key={option.id} template={option} />)}
    </ul>
  </section>

  return <section className="limen-studio__template-stage" aria-labelledby="studio-template-title">
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Plantilla</p>
      <h2 id="studio-template-title">Elegí cómo contar la celebración</h2>
      <p>Origin 01 es la plantilla disponible para este borrador.</p></div>
    <AvailableTemplateCard template={available} selected={selected}
      onSelect={() => transition({ type: 'select', templateId: available.id })} />
    <footer className="limen-studio__template-stage-footer">
      <button className="limen-studio__primary-link" type="button" onClick={() => changeView('gallery')}>Ver exploraciones futuras <span aria-hidden="true">→</span></button>
      <p className="limen-studio__quiet-note">Las opciones próximas no alteran el contenido ni la vista previa.</p>
    </footer>
  </section>
}
