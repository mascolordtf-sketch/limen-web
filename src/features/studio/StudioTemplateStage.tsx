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
  return <li className="limen-studio__template-card">
    <div className={`limen-studio__template-art limen-studio__template-art--${template.style}`} aria-hidden="true">
      <span>{template.name.slice(0, 1)}</span><i /><i />
    </div>
    <div className="limen-studio__template-card-copy">
      <div><strong>{template.name}</strong>{template.source === 'isolated-example' && <small>Muestra de Studio</small>}</div>
      <p>{template.description}</p>
      <button type="button" aria-pressed={selected} onClick={onSelect}>{selected ? 'Seleccionada' : 'Elegir plantilla'}</button>
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
      <p>La plantilla define el lenguaje narrativo de la invitación. Actualmente está seleccionada {selected?.name}.</p></div>
    <h3 className="limen-studio__subheading">Plantillas destacadas</h3>
    <ul className="limen-studio__template-grid">{templates.filter(({ featured }) => featured).map((option) => <TemplateCard
      key={option.id} template={option} selected={option.id === state.selectedId}
      onSelect={() => transition({ type: 'select', templateId: option.id })} />)}</ul>
    <button className="limen-studio__primary-link" type="button" onClick={() => changeView('gallery')}>Ver todas las plantillas</button>
    <p className="limen-studio__quiet-note">La selección es temporal y no modifica la invitación pública.</p>
  </section>
}
