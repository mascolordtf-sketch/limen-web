import type { MouseEvent, ReactNode } from 'react'

type Props = {
  audienceLabel: string
  layerOpen: boolean
  preview: ReactNode
  publicInvitationUrl: string
  onClose: () => void
  onCollapse?: () => void
  onOpen: (event: MouseEvent<HTMLButtonElement>) => void
  onRestart: () => void
}

export function StudioPreviewPane({ audienceLabel, layerOpen, preview, publicInvitationUrl,
  onClose, onCollapse, onOpen, onRestart }: Props) {
  return <div className="limen-studio__preview-pane">
    <header className="limen-studio__preview-toolbar">
      <div><span>Vista previa</span><small>{audienceLabel}</small></div>
      <div>
        {layerOpen
          ? <button type="button" onClick={onClose}>Volver al editor</button>
          : <>
            <button type="button" onClick={onRestart}>Reiniciar</button>
            {onCollapse && <button type="button" onClick={onCollapse}>Contraer</button>}
            <button type="button" onClick={onOpen}>Ampliar</button>
          </>}
        <a href={publicInvitationUrl}>Abrir demo</a>
      </div>
    </header>
    {preview}
  </div>
}
