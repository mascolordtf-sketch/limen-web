import type { ReactNode } from 'react'

export type StudioPreviewMode = 'visible' | 'collapsed' | 'dedicated'

export function StudioWorkspaceFrame({ background, preview, previewMode }: {
  background: ReactNode
  preview: ReactNode
  previewMode: StudioPreviewMode
}) {
  return <div className={`limen-studio__workspace-frame limen-studio__workspace-frame--preview-${previewMode}`}>
    <div className="limen-studio__workspace-background" inert={previewMode === 'dedicated' ? true : undefined}>
      {background}
    </div>
    <aside className="limen-studio__workspace-preview" aria-label="Vista previa de la invitación">
      {preview}
    </aside>
  </div>
}
