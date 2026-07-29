import { useMemo, useReducer } from 'react'

import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import { createStudioTemplateGalleryState, createStudioTemplateOptions, filterStudioTemplateOptions,
  transitionStudioTemplateGallery } from './studioTemplateGallery'
import type { StudioTemplateCelebration, StudioTemplateOption, StudioTemplateStyle } from './studioTemplateGallery'
import type { StudioTemplateGalleryState } from './studioTemplateGallery'

const celebrationFilters: readonly { value: StudioTemplateCelebration; label: string }[] = [
  { value: 'all', label: 'Todas' }, { value: 'cumpleanos', label: 'Cumpleaños' },
  { value: 'casamiento', label: 'Casamientos' }, { value: 'general', label: 'Otras celebraciones' },
]
const styleFilters: readonly { value: StudioTemplateStyle; label: string }[] = [
  { value: 'all', label: 'Todos' }, { value: 'narrativa', label: 'Narrativa' },
  { value: 'editorial', label: 'Editorial' }, { value: 'minimalista', label: 'Minimalista' },
]

function TemplateCard({ template, selected, onSelect }: {
  template: StudioTemplateOption
  selected: boolean
  onSelect: () => void
}) {
  const celebrationLabel = template.celebration === 'cumpleanos'
    ? 'Cumpleaños'
    : template.celebration === 'casamiento' ? 'Casamiento' : 'Celebración'
  const styleLabel = template.style === 'narrativa'
    ? 'Narrativa'
    : template.style === 'editorial' ? 'Editorial' : 'Minimalista'

  return <li className={`limen-studio__template-card${selected ? ' is-selected' : ''}`}>
    <div className={`limen-studio__template-art limen-studio__template-art--${template.style}`} aria-hidden="true">
      <span className="limen-studio__template-art-kicker">LIMEN · {styleLabel}</span>
      <span className="limen-studio__template-art-mark">{template.name.slice(0, 1)}</span>
      <span className="limen-studio__template-art-name">{template.name}</span>
      <i /><i />
    </div>
    <div className="limen-studio__template-card-copy">
      <div className="limen-studio__template-card-meta">
        <span>{celebrationLabel}</span><span>{styleLabel}</span>
      </div>
      <div className="limen-studio__template-card-title"><strong>{template.name}</strong>
        <small>{template.source === 'production' ? 'Plantilla disponible' : 'Dirección en exploración'}</small></div>
      <p>{template.description}</p>
      <button type="button" aria-pressed={selected} onClick={onSelect}>
        <span aria-hidden="true">{selected ? '✓' : '→'}</span>{selected ? 'Seleccionada' : 'Explorar plantilla'}
      </button>
    </div>
  </li>
}

export function StudioTemplateStage({ template, initialState, state: controlledState, onStateChange, onGalleryViewChange }: {
  template: InvitationTemplateDefinition
  initialState?: StudioTemplateGalleryState
  state?: StudioTemplateGalleryState
  onStateChange?: (state: StudioTemplateGalleryState) => void
  onGalleryViewChange?: (view: StudioTemplateGalleryState['view']) => void
}) {
  const templates = useMemo(() => createStudioTemplateOptions(template), [template])
  const [internalState, dispatch] = useReducer(transitionStudioTemplateGallery,
    initialState ?? createStudioTemplateGalleryState(template.id))
  const state = controlledState ?? internalState
  const transition = (action: Parameters<typeof transitionStudioTemplateGallery>[1]) => {
    if (controlledState) onStateChange?.(transitionStudioTemplateGallery(controlledState, action))
    else dispatch(action)
  }
  const selected = templates.find(({ id }) => id === state.selectedId) ?? templates[0]
  const visibleTemplates = filterStudioTemplateOptions(templates, state)

  const changeView = (view: StudioTemplateGalleryState['view']) => {
    transition({ type: view === 'gallery' ? 'open-gallery' : 'close-gallery' })
    onGalleryViewChange?.(view)
  }

  if (state.view === 'gallery') return <section className="limen-studio__template-stage" aria-labelledby="studio-template-gallery-title">
    <button className="limen-studio__template-back" type="button" onClick={() => changeView('main')}>← Volver</button>
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Plantilla</p>
      <h2 id="studio-template-gallery-title">Todas las plantillas</h2>
      <p>Explorá las direcciones disponibles. La elección es temporal y no cambia la invitación pública.</p></div>
    <div className="limen-studio__template-filters">
      <fieldset><legend>Tipo de celebración</legend>{celebrationFilters.map((filter) => <label key={filter.value}>
        <input type="radio" name="studio-template-celebration" value={filter.value}
          checked={state.celebration === filter.value}
          onChange={() => transition({ type: 'filter-celebration', celebration: filter.value })} />{filter.label}</label>)}</fieldset>
      <fieldset><legend>Estilo visual</legend>{styleFilters.map((filter) => <label key={filter.value}>
        <input type="radio" name="studio-template-style" value={filter.value} checked={state.style === filter.value}
          onChange={() => transition({ type: 'filter-style', style: filter.value })} />{filter.label}</label>)}</fieldset>
    </div>
    {visibleTemplates.length ? <ul className="limen-studio__template-grid">{visibleTemplates.map((option) => <TemplateCard
      key={option.id} template={option} selected={option.id === state.selectedId}
      onSelect={() => transition({ type: 'select', templateId: option.id })} />)}</ul>
      : <p role="status">No hay muestras para esta combinación de filtros.</p>}
  </section>

  return <section className="limen-studio__template-stage" aria-labelledby="studio-template-title">
    <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Plantilla</p>
      <h2 id="studio-template-title">Elegí el punto de partida</h2>
      <p>Cada plantilla propone una forma distinta de contar la celebración. Actualmente está seleccionada {selected?.name}.</p></div>
    <div className="limen-studio__collection-heading">
      <div><p className="limen-studio__eyebrow">Colección curada</p>
        <h3 className="limen-studio__subheading">Plantillas destacadas</h3></div>
      <p>Una selección breve de universos narrativos.</p>
    </div>
    <ul className="limen-studio__template-grid">{templates.filter(({ featured }) => featured).map((option) => <TemplateCard
      key={option.id} template={option} selected={option.id === state.selectedId}
      onSelect={() => transition({ type: 'select', templateId: option.id })} />)}</ul>
    <footer className="limen-studio__template-stage-footer">
      <button className="limen-studio__primary-link" type="button" onClick={() => changeView('gallery')}>
        Ver todas las plantillas <span aria-hidden="true">→</span>
      </button>
      <p className="limen-studio__quiet-note">La selección es temporal y no modifica la invitación pública.</p>
    </footer>
  </section>
}
