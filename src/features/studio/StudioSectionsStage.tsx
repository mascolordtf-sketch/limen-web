import type { Origin01StudioDraft } from './origin01StudioDraft'
import { isStudioSceneIncluded, studioPublicScenes } from './studioScenes'

export function StudioSectionsStage({ draft, onSceneChange }: {
  draft: Pick<Origin01StudioDraft, 'modules'>
  onSceneChange: (scene: (typeof studioPublicScenes)[number], included: boolean) => void
}) {
  return <section className="limen-studio__sections" aria-labelledby="studio-sections-title">
    <header className="limen-studio__stage-heading"><p className="limen-studio__eyebrow">Secciones</p>
      <h2 id="studio-sections-title" tabIndex={-1}>Armá el recorrido</h2>
      <p>Elegí qué momentos forman parte de la experiencia. Las escenas esenciales permanecen siempre incluidas.</p></header>
    <ul>{studioPublicScenes.map((scene) => {
      const included = isStudioSceneIncluded(draft, scene)
      return <li key={scene.id} className={included || scene.required ? 'is-included' : undefined}>
        <span className="limen-studio__scene-order" aria-hidden="true">
          {String(studioPublicScenes.indexOf(scene) + 1).padStart(2, '0')}
        </span>
        <div><h3>{scene.label}</h3><p>{scene.description}</p></div>
        {scene.required ? <strong className="limen-studio__required-badge">Obligatoria</strong> :
          <label className="limen-studio__scene-switch"><span>{included ? 'Incluida' : 'No incluida'}</span>
            <input type="checkbox" role="switch" checked={included}
              aria-label={`${included ? 'Excluir' : 'Incluir'} ${scene.label}`}
              onChange={(event) => onSceneChange(scene, event.currentTarget.checked)} /></label>}
      </li>
    })}</ul>
  </section>
}
