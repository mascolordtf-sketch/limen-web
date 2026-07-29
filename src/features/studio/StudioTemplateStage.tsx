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
    <div><strong>{template.name}</strong>{template.source === 'isolated-example' && <small>Muestra de Studio</small>}</div>
    <p>{template.description}</p>
    <button type="button" aria-pressed={selected} onClick={onSelect}>{selected ? 'Plantilla seleccionada' : 'Seleccionar plantilla'}</button>
  </li>
}

export function StudioTemplateStage({ template, initialState, onGalleryViewChange }: {
  template: InvitationTemplateDefinition
  initialState?: StudioTemplateGalleryState
  onGalleryViewChange?: (view: StudioTemplateGalleryState['view']) => void
}) {
  const templates = useMemo(() => createStudioTemplateOptions(template), [template])
  const [state, dispatch] = useReducer(transitionStudioTemplateGallery,
    initialState ?? createStudioTemplateGalleryState(template.id))
  const selected = templates.find(({ id }) => id === state.selectedId) ?? templates[0]
  const visibleTemplates = filterStudioTemplateOptions(templates, state)

  const changeView = (view: StudioTemplateGalleryState['view']) => {
    dispatch({ type: view === 'gallery' ? 'open-gallery' : 'close-gallery' })
    onGalleryViewChange?.(view)
  }

  if (state.view === 'gallery') return <section className="limen-studio__template-stage" aria-labelledby="studio-template-gallery-title">
    <button className="limen-studio__template-back" type="button" onClick={() => changeView('main')}>← Volver</button>
    <h2 id="studio-template-gallery-title">Todas las plantillas</h2>
    <p>Explorá muestras temporales para elegir una dirección. Esta selección no cambia la invitación pública.</p>
    <div className="limen-studio__template-filters">
      <fieldset><legend>Tipo de celebración</legend>{celebrationFilters.map((filter) => <label key={filter.value}>
        <input type="radio" name="studio-template-celebration" value={filter.value}
          checked={state.celebration === filter.value}
          onChange={() => dispatch({ type: 'filter-celebration', celebration: filter.value })} />{filter.label}</label>)}</fieldset>
      <fieldset><legend>Estilo visual</legend>{styleFilters.map((filter) => <label key={filter.value}>
        <input type="radio" name="studio-template-style" value={filter.value} checked={state.style === filter.value}
          onChange={() => dispatch({ type: 'filter-style', style: filter.value })} />{filter.label}</label>)}</fieldset>
    </div>
    {visibleTemplates.length ? <ul className="limen-studio__template-grid">{visibleTemplates.map((option) => <TemplateCard
      key={option.id} template={option} selected={option.id === state.selectedId}
      onSelect={() => dispatch({ type: 'select', templateId: option.id })} />)}</ul>
      : <p role="status">No hay muestras para esta combinación de filtros.</p>}
  </section>

  return <section className="limen-studio__template-stage" aria-labelledby="studio-template-title">
    <p className="limen-studio__eyebrow">Plantilla seleccionada</p>
    <h2 id="studio-template-title">{selected?.name}</h2>
    <p>{selected?.description}</p>
    <p className="limen-studio__template-note">La selección es temporal y no modifica la invitación pública.</p>
    <h3>Plantillas destacadas</h3>
    <ul className="limen-studio__template-grid">{templates.filter(({ featured }) => featured).map((option) => <TemplateCard
      key={option.id} template={option} selected={option.id === state.selectedId}
      onSelect={() => dispatch({ type: 'select', templateId: option.id })} />)}</ul>
    <button className="limen-studio__primary-link" type="button" onClick={() => changeView('gallery')}>Ver todas las plantillas</button>
  </section>
}
