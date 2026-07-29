import type { ReactNode } from 'react'
import type { Origin01StudioDraft } from './origin01StudioDraft'
import { getVisibleStudioScenes, type StudioSceneId } from './studioScenes'

export function StudioScenesContent({ draft, selectedScene, onSceneSelect, onManageSections, editor, preview,
  previewDedicated, previewCollapsed, onOpenPreview, onShowPreview, correctionReturn, onReturnToErrors }: {
  draft: Pick<Origin01StudioDraft, 'modules'>
  selectedScene: StudioSceneId
  onSceneSelect: (scene: StudioSceneId) => void
  onManageSections: () => void
  editor: ReactNode
  preview: ReactNode
  previewDedicated: boolean
  previewCollapsed: boolean
  onOpenPreview: (event: React.MouseEvent<HTMLButtonElement>) => void
  onShowPreview: () => void
  correctionReturn?: boolean
  onReturnToErrors?: () => void
}) {
  const scenes = getVisibleStudioScenes(draft)
  const selected = scenes.find(({ id }) => id === selectedScene) ?? scenes[0]
  return <section className={`limen-studio__content-layout${previewCollapsed ? ' limen-studio__content-layout--preview-collapsed' : ''}`}>
    <nav className="limen-studio__scene-navigation" aria-label="Escenas de contenido" inert={previewDedicated ? true : undefined}>
      <p className="limen-studio__eyebrow">Contenido</p><h2>Escenas</h2>
      <div className="limen-studio__scene-navigation-list">{scenes.map((scene) =>
        <button key={scene.id} type="button" aria-current={scene.id === selected.id ? 'page' : undefined}
          onClick={() => onSceneSelect(scene.id)}>{scene.label}</button>)}</div>
      <button className="limen-studio__manage-sections" type="button" onClick={onManageSections}>Agregar o quitar secciones</button>
    </nav>
    <article className="limen-studio__contextual-editor" aria-labelledby="studio-contextual-editor-title" inert={previewDedicated ? true : undefined}>
      <header><p className="limen-studio__eyebrow">Editando</p>
        <h2 id="studio-contextual-editor-title" tabIndex={-1}>{selected.label}</h2><p>{selected.description}</p></header>{editor}
      {correctionReturn && <button className="limen-studio__return-errors" type="button"
        onClick={onReturnToErrors}>← Volver a Errores</button>}
    </article>
    <button className="limen-studio__mobile-preview-action" type="button" onClick={onOpenPreview}>Ver invitación</button>
    <div className={`limen-studio__desktop-preview${previewDedicated ? ' limen-studio__desktop-preview--dedicated' : ''}`}>
      {previewCollapsed && !previewDedicated && <div className="limen-studio__preview-collapsed">
        <span>La vista previa está contraída.</span><button type="button" onClick={onShowPreview}>Mostrar</button></div>}
      <div hidden={previewCollapsed && !previewDedicated}
        inert={previewCollapsed && !previewDedicated ? true : undefined}>{preview}</div>
    </div>
  </section>
}
