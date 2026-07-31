import type { Origin01StudioDraft } from './origin01StudioDraft'
import { isStudioSceneIncluded, studioPublicScenes } from './studioScenes'
import type { StudioPublicScene } from './studioScenes'

const narrativeChapters = [
  {
    id: 'threshold',
    number: 'I',
    eyebrow: 'El umbral',
    title: 'Abrir la historia',
    description: 'La llegada, la expectativa y el primer gesto personal.',
    sceneIds: ['cover', 'countdown', 'story'],
  },
  {
    id: 'celebration',
    number: 'II',
    eyebrow: 'La celebración',
    title: 'Situar el encuentro',
    description: 'Todo lo que permite imaginar y preparar ese día.',
    sceneIds: ['event-details', 'schedule', 'weather', 'dress-code'],
  },
  {
    id: 'participation',
    number: 'III',
    eyebrow: 'La participación',
    title: 'Invitar a ser parte',
    description: 'Recuerdos, juego y gestos compartidos con los invitados.',
    sceneIds: ['gallery', 'trivia', 'gifts'],
  },
  {
    id: 'farewell',
    number: 'IV',
    eyebrow: 'La despedida',
    title: 'Cerrar el recorrido',
    description: 'La respuesta final y la última escena de la experiencia.',
    sceneIds: ['rsvp', 'closing'],
  },
] as const satisfies readonly {
  id: string
  number: string
  eyebrow: string
  title: string
  description: string
  sceneIds: readonly StudioPublicScene['id'][]
}[]

export function StudioSectionsStage({ draft, onSceneChange }: {
  draft: Pick<Origin01StudioDraft, 'modules'>
  onSceneChange: (scene: (typeof studioPublicScenes)[number], included: boolean) => void
}) {
  const requiredCount = studioPublicScenes.filter(({ required }) => required).length
  const optionalScenes = studioPublicScenes.filter(({ required }) => !required)
  const includedOptionalCount = optionalScenes.filter((scene) => isStudioSceneIncluded(draft, scene)).length

  return <section className="limen-studio__sections" aria-labelledby="studio-sections-title">
    <header className="limen-studio__sections-intro">
      <div className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Secciones</p>
        <h2 id="studio-sections-title" tabIndex={-1}>Armá el recorrido</h2>
        <p>Elegí qué momentos forman parte de la experiencia. Las escenas esenciales permanecen siempre incluidas.</p>
      </div>
      <dl className="limen-studio__sections-summary" aria-label="Composición actual del recorrido">
        <div><dt>Recorrido</dt><dd>{studioPublicScenes.length} escenas</dd></div>
        <div><dt>Estructura</dt><dd>{requiredCount} esenciales</dd></div>
        <div><dt>Elección</dt><dd>{includedOptionalCount} de {optionalScenes.length} opcionales</dd></div>
      </dl>
    </header>
    <div className="limen-studio__narrative-key" aria-label="Referencias del recorrido">
      <p><span className="is-essential" aria-hidden="true" />Estructura esencial</p>
      <p><span className="is-optional" aria-hidden="true" />Escena opcional</p>
      <small>El orden pertenece a Origin 01 y todavía no es editable.</small>
    </div>
    <ol className="limen-studio__narrative-chapters">{narrativeChapters.map((chapter) =>
      <li className="limen-studio__narrative-chapter" key={chapter.id}>
        <header>
          <span className="limen-studio__chapter-number" aria-hidden="true">{chapter.number}</span>
          <div><p>{chapter.eyebrow}</p><h3>{chapter.title}</h3><small>{chapter.description}</small></div>
        </header>
        <ol>{chapter.sceneIds.map((sceneId) => {
          const scene = studioPublicScenes.find(({ id }) => id === sceneId)
          if (!scene) return null
          const included = isStudioSceneIncluded(draft, scene)
          const sceneNumber = String(studioPublicScenes.indexOf(scene) + 1).padStart(2, '0')
          return <li key={scene.id}
            className={`limen-studio__narrative-scene${included || scene.required ? ' is-included' : ' is-excluded'}${scene.required ? ' is-required' : ' is-optional'}`}>
            <span className="limen-studio__scene-order" aria-hidden="true">
              <small>Escena</small><strong>{sceneNumber}</strong>
            </span>
            <div className="limen-studio__scene-copy">
              <span>{scene.required ? 'Estructura esencial' : 'Escena opcional'}</span>
              <h4>{scene.label}</h4><p>{scene.description}</p>
            </div>
            {scene.required
              ? <strong className="limen-studio__required-badge"><span aria-hidden="true">✓</span>Siempre incluida</strong>
              : <label className="limen-studio__scene-switch">
                <span><strong>{included ? 'Incluida' : 'No incluida'}</strong>
                  <small>{included ? 'Visible en la experiencia' : 'Fuera del recorrido'}</small></span>
                <input type="checkbox" role="switch" checked={included}
                  aria-label={`${included ? 'Excluir' : 'Incluir'} ${scene.label}`}
                  onChange={(event) => onSceneChange(scene, event.currentTarget.checked)} />
              </label>}
          </li>
        })}</ol>
      </li>)}</ol>
  </section>
}
