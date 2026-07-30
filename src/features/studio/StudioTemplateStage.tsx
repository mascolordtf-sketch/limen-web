import { useMemo, useReducer } from 'react'

import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import { createStudioTemplateGalleryState, createStudioTemplateOptions,
  transitionStudioTemplateGallery } from './studioTemplateGallery'
import type { StudioTemplateGalleryState, StudioTemplateOption } from './studioTemplateGallery'

function OriginPreview({ template }: { template: StudioTemplateOption }) {
  if (template.preview.kind !== 'image') return null
  return <div className="limen-studio__template-preview">
    <img src={template.preview.src} alt={template.preview.alt} />
    <div className="limen-studio__template-preview-caption" aria-hidden="true">
      <small>Una invitación</small><span>Antes era un sueño.<br />Ahora empieza.</span>
    </div>
  </div>
}

function FutureTemplateCard({ template }: { template: StudioTemplateOption }) {
  if (template.preview.kind !== 'concept') return null
  return <li className="limen-studio__template-card limen-studio__template-card--future">
    <div className={`limen-studio__template-concept limen-studio__template-concept--${template.preview.motif}`}
      role="img" aria-label={template.preview.label}><i /><span>{template.name}</span><i /></div>
    <div className="limen-studio__template-card-copy">
      <div className="limen-studio__template-card-meta"><span>Exploración conceptual</span><strong>Próximamente</strong></div>
      <h4>{template.name}</h4><p>{template.description}</p>
      <p className="limen-studio__quiet-note">Todavía no disponible.</p>
    </div>
  </li>
}

export function StudioTemplateStage({ template, demoPath, initialState, state: controlledState, onStateChange }: {
  template: InvitationTemplateDefinition
  demoPath?: string
  initialState?: StudioTemplateGalleryState
  state?: StudioTemplateGalleryState
  onStateChange?: (state: StudioTemplateGalleryState) => void
}) {
  const templates = useMemo(() => createStudioTemplateOptions(template, demoPath), [template, demoPath])
  const available = templates.find(({ selectable }) => selectable)!
  const [internalState, dispatch] = useReducer(transitionStudioTemplateGallery,
    initialState ?? createStudioTemplateGalleryState(template.id, available.id))
  const state = controlledState ?? internalState
  const selected = state.selectedId === available.id
  const selectAvailable = () => {
    const action = { type: 'select', templateId: available.id, selectable: available.selectable } as const
    if (controlledState) onStateChange?.(transitionStudioTemplateGallery(controlledState, action))
    else dispatch(action)
  }

  return <section className="limen-studio__template-stage" aria-labelledby="studio-template-title">
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Plantilla</p>
      <h2 id="studio-template-title">Elegí cómo contar la celebración</h2>
      <p>Conocé la experiencia disponible y las direcciones que estamos explorando.</p></div>

    <article className={`limen-studio__template-feature${selected ? ' is-selected' : ''}`}
      aria-label={`${available.name}, ${selected ? 'seleccionada' : 'disponible'}`}>
      <OriginPreview template={available} />
      <div className="limen-studio__template-feature-copy">
        <p className="limen-studio__eyebrow">Universo {available.collection}</p>
        <h3>{available.name}</h3><p className="limen-studio__template-description">{available.description}</p>
        <p className="limen-studio__template-attributes">{available.highlights.join(' · ')}</p>
        <span className="limen-studio__template-selected" role="status">
          <span aria-hidden="true">✓</span> {selected ? 'Seleccionada' : 'Disponible'}
        </span>
        {!selected && <button type="button" onClick={selectAvailable}>Seleccionar plantilla</button>}
        {available.demoPath && <a className="limen-studio__template-demo" href={available.demoPath}
          target="_blank" rel="noopener noreferrer"
          aria-label={`Ver demostración completa de ${available.name} (se abre en una pestaña nueva)`}>
          Ver demostración <span aria-hidden="true">↗</span>
        </a>}
      </div>
    </article>

    <section className="limen-studio__template-future" aria-labelledby="studio-template-future-title">
      <div><p className="limen-studio__eyebrow">Exploraciones futuras</p>
        <h3 id="studio-template-future-title">Direcciones en estudio</h3>
        <p>Conceptos visuales todavía no disponibles. No modifican tu borrador.</p></div>
      <ul className="limen-studio__template-grid limen-studio__template-grid--future">
        {templates.filter(({ exploration }) => exploration).map((option) => <FutureTemplateCard key={option.id} template={option} />)}
      </ul>
    </section>
  </section>
}
