import type { ReactNode } from 'react'
import type { Origin01StudioDraft } from './origin01StudioDraft'
import { getVisibleStudioScenes, type StudioSceneId } from './studioScenes'

export function StudioScenesContent({ draft, selectedScene, onSceneSelect, editor,
  correctionReturn, onReturnToErrors,
  editorTabs, selectedEditorId, onEditorSelect }: {
  draft: Pick<Origin01StudioDraft, 'modules'>
  selectedScene: StudioSceneId
  onSceneSelect: (scene: StudioSceneId) => void
  editor: ReactNode
  correctionReturn?: boolean
  onReturnToErrors?: () => void
  editorTabs?: readonly { id: string; label: string }[]
  selectedEditorId?: string
  onEditorSelect?: (editorId: string) => void
}) {
  const scenes = getVisibleStudioScenes(draft)
  const selected = scenes.find(({ id }) => id === selectedScene) ?? scenes[0]
  const selectedIndex = scenes.findIndex(({ id }) => id === selected.id)
  const selectedKind = selected.id === 'general'
    ? 'Base compartida'
    : selected.required ? 'Escena esencial' : 'Escena opcional'
  const previousScene = selectedIndex > 0 ? scenes[selectedIndex - 1] : undefined
  const nextScene = selectedIndex < scenes.length - 1 ? scenes[selectedIndex + 1] : undefined
  return <section className="limen-studio__content-layout">
    <nav className="limen-studio__scene-navigation" aria-label="Escenas de contenido">
      <div className="limen-studio__scene-navigation-heading">
        <p className="limen-studio__eyebrow">Contenido</p><h2>Escena</h2>
      </div>
      <label className="limen-studio__scene-picker">
        <span className="limen-studio__visually-hidden">Escena de contenido</span>
        <select value={selected.id}
          onChange={(event) => onSceneSelect(event.currentTarget.value as StudioSceneId)}>
          {scenes.map((scene, index) => <option key={scene.id} value={scene.id}>
            {String(index + 1).padStart(2, '0')} · {scene.label}
          </option>)}
        </select>
      </label>
      <span className="limen-studio__scene-progress" aria-live="polite">
        {selectedIndex + 1} de {scenes.length}
      </span>
      <div className="limen-studio__scene-navigation-actions">
        <button type="button" disabled={!previousScene}
          onClick={() => previousScene && onSceneSelect(previousScene.id)}>Anterior</button>
        <button type="button" disabled={!nextScene}
          onClick={() => nextScene && onSceneSelect(nextScene.id)}>Siguiente</button>
      </div>
    </nav>
    <article className="limen-studio__contextual-editor" aria-labelledby="studio-contextual-editor-title">
      <header className="limen-studio__editor-heading">
        <span className="limen-studio__editor-scene-number" aria-hidden="true">
          {String(selectedIndex + 1).padStart(2, '0')}
        </span>
        <div><p className="limen-studio__eyebrow">Editando ahora</p>
          <h2 id="studio-contextual-editor-title" tabIndex={-1}>{selected.label}</h2>
          <p>{selected.description}</p></div>
        <span className="limen-studio__editor-scene-kind">{selectedKind}</span>
      </header>
      {editorTabs && <div className="limen-studio__editor-tab-region">
        <p>Áreas de edición</p>
        <nav className="limen-studio__editor-tabs" aria-label={`Configuraciones de ${selected.label}`}>
          {editorTabs.map((tab) => <button key={tab.id} type="button"
            aria-current={selectedEditorId === tab.id ? 'page' : undefined}
            onClick={() => onEditorSelect?.(tab.id)}>{tab.label}</button>)}
        </nav>
      </div>}
      {editor}
      {correctionReturn && <button className="limen-studio__return-errors" type="button"
        onClick={onReturnToErrors}>← Volver a Errores</button>}
    </article>
  </section>
}
