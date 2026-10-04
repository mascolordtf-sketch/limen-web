import type { StudioPublicationSnapshot, StudioPublicationState } from './studioPublication'
import type { StudioPublicationEquivalence } from './studioPublicationEquivalence'

const publicationDateFormatter = new Intl.DateTimeFormat('es-AR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const publicationStatusLabels = {
  active: 'Activa',
  superseded: 'Reemplazada',
  paused: 'Pausada',
  expired: 'Vencida',
} as const

type Props = {
  readonly draftRevision?: number
  readonly publication?: StudioPublicationSnapshot
  readonly equivalence?: StudioPublicationEquivalence
  readonly state: StudioPublicationState
  readonly blockReason?: string
  readonly editoriallyConfirmed: boolean
  readonly onEditorialConfirmation: (confirmed: boolean) => void
  readonly onPublish: () => void
}

export function StudioPublicationPanel({
  draftRevision,
  publication,
  equivalence,
  state,
  blockReason,
  editoriallyConfirmed,
  onEditorialConfirmation,
  onPublish,
}: Props) {
  const publishing = state.status === 'publishing'
  return <section className="limen-studio__publication" aria-labelledby="studio-publication-title">
    <div className="limen-studio__publication-heading">
      <div>
        <h3 id="studio-publication-title">Publicación</h3>
        <p>La versión actual permanece activa hasta que publiques una nueva.</p>
      </div>
      <span className={`limen-studio__publication-status${publication
        ? ` limen-studio__publication-status--${publication.status}`
        : ''}`}>
        {publication ? `${publicationStatusLabels[publication.status]} · versión ${publication.revision}` : 'Sin publicaciones'}
      </span>
    </div>
    <label className="limen-studio__publication-confirmation">
      <input type="checkbox" checked={editoriallyConfirmed}
        onChange={(event) => onEditorialConfirmation(event.currentTarget.checked)} />
      <span>Confirmo que revisé el contenido y ambas vistas de esta versión.</span>
    </label>
    <div className="limen-studio__publication-action">
      <div className="limen-studio__publication-meta">
        {publication
          ? <><span>Última publicación: {publicationDateFormatter.format(new Date(publication.publishedAt))}</span>
            {equivalence && <span>{equivalence.equivalent
              ? 'Coincide con la invitación pública actual'
              : 'Tiene diferencias con la invitación pública actual'}</span>}</>
          : <span>Este proyecto todavía no tiene publicaciones.</span>}
      </div>
      <div className="limen-studio__publication-buttons">
        {publication?.document && <a href={`/studio/publicaciones/${publication.id}?inicio=invitacion`}
          target="_blank" rel="noreferrer">Ver versión publicada</a>}
        <button type="button" disabled={publishing || blockReason !== undefined} onClick={onPublish}>
          {publishing ? 'Publicando cambios…' : 'Publicar cambios'}
        </button>
      </div>
    </div>
    {blockReason && <p className="limen-studio__publication-block-reason">{blockReason}</p>}
    {state.message && <p className="limen-studio__publication-message"
      role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
    <details className="limen-studio__publication-details">
      <summary>Ver detalles e historial de publicaciones</summary>
      <div>
        {publication
          ? <p className="limen-studio__publication-history">
            La versión {publication.revision} se creó desde el borrador {publication.draftRevision} el{' '}
            {publicationDateFormatter.format(new Date(publication.publishedAt))}.
          </p>
          : <p className="limen-studio__publication-history">La primera publicación conservará
            {draftRevision ? ` el borrador ${draftRevision}` : ' este borrador'} como versión 1.</p>}
        {publication?.document && equivalence && <div className={`limen-studio__publication-equivalence${equivalence.equivalent
          ? ' limen-studio__publication-equivalence--exact'
          : ''}`}>
          <div><strong>{equivalence.equivalent ? 'Coincide con la invitación pública actual' : 'Hay diferencias con la invitación pública actual'}</strong>
            <span>{equivalence.equivalent
              ? 'El contenido visible de ambas versiones es equivalente.'
              : `Revisá: ${equivalence.changedSections.join(', ')}.`}</span></div>
          <div className="limen-studio__publication-links">
            <a href={`/invitacion/${publication.document.code}`} target="_blank" rel="noreferrer">
              Abrir invitación pública actual
            </a>
          </div>
        </div>}
        {publication && !publication.document && <div className="limen-studio__publication-equivalence">
          <div><strong>Snapshot histórico no compatible con este Studio</strong>
            <span>El borrador sigue disponible. La comparación y la vista privada de esta publicación quedan deshabilitadas.</span>
          </div>
        </div>}
        <p className="limen-studio__publication-note">
          Por ahora, publicar crea una versión segura en Studio. La invitación pública existente seguirá intacta hasta activar su lectura desde Supabase.
        </p>
      </div>
    </details>
  </section>
}
