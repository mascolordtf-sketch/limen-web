import type { ReactNode } from 'react'
import type { Origin01StudioDraft } from './origin01StudioDraft'
import { getVisibleStudioScenes, type StudioSceneId } from './studioScenes'

export function StudioScenesContent({ draft, selectedScene, onSceneSelect, editor, preview,
  previewDedicated, previewCollapsed, onShowPreview, correctionReturn, onReturnToErrors,
  editorTabs, selectedEditorId, onEditorSelect }: {
  draft: Pick<Origin01StudioDraft, 'modules'>
  selectedScene: StudioSceneId
  onSceneSelect: (scene: StudioSceneId) => void
  editor: ReactNode
  preview: ReactNode
  previewDedicated: boolean
  previewCollapsed: boolean
  onShowPreview: () => void
  correctionReturn?: boolean
  onReturnToErrors?: () => void
  editorTabs?: readonly { id: string; label: string }[]
  selectedEditorId?: string
  onEditorSelect?: (editorId: string) => void
}) {
  const scenes = getVisibleStudioScenes(draft)
  const selected = scenes.find(({ id }) => id === selectedScene) ?? scenes[0]
  return <section className={`limen-studio__content-layout${previewCollapsed ? ' limen-studio__content-layout--preview-collapsed' : ''}`}>
    <nav className="limen-studio__scene-navigation" aria-label="Escenas de contenido" inert={previewDedicated ? true : undefined}>
      <header><p className="limen-studio__eyebrow">Contenido</p><h2>Escenas de la invitación</h2></header>
      <div className="limen-studio__scene-navigation-list">{scenes.map((scene, index) =>
        <button key={scene.id} type="button" aria-current={scene.id === selected.id ? 'page' : undefined}
          onClick={() => onSceneSelect(scene.id)}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <strong>{scene.label}</strong></button>)}</div>
    </nav>
    <article className="limen-studio__contextual-editor" aria-labelledby="studio-contextual-editor-title" inert={previewDedicated ? true : undefined}>
      <header><div><p className="limen-studio__eyebrow">Editando</p>
        <h2 id="studio-contextual-editor-title" tabIndex={-1}>{selected.label}</h2><p>{selected.description}</p></div>
      </header>
      {editorTabs && <nav className="limen-studio__editor-tabs" aria-label={`Configuraciones de ${selected.label}`}>
        {editorTabs.map((tab) => <button key={tab.id} type="button"
          aria-current={selectedEditorId === tab.id ? 'page' : undefined}
          onClick={() => onEditorSelect?.(tab.id)}>{tab.label}</button>)}
      </nav>}
      {editor}
      {correctionReturn && <button className="limen-studio__return-errors" type="button"
        onClick={onReturnToErrors}>← Volver a Errores</button>}
    </article>
    <aside className={`limen-studio__desktop-preview${previewDedicated ? ' limen-studio__desktop-preview--dedicated' : ''}`}
      aria-label="Vista previa de la invitación">
      {previewCollapsed && !previewDedicated && <div className="limen-studio__preview-collapsed">
        <span>La vista previa está contraída.</span><button type="button" onClick={onShowPreview}>Mostrar</button></div>}
      <div hidden={previewCollapsed && !previewDedicated}
        inert={previewCollapsed && !previewDedicated ? true : undefined}>{preview}</div>
    </aside>
  </section>
}
