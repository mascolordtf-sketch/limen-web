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
        <p className="limen-studio__eyebrow">Publicación</p>
        <h3 id="studio-publication-title">Crear una versión inmutable</h3>
      </div>
      {publication && <span className={`limen-studio__publication-status limen-studio__publication-status--${publication.status}`}>
        {publicationStatusLabels[publication.status]}
      </span>}
    </div>
    <p>La publicación copia la revisión guardada. Los cambios posteriores del borrador no modifican esa versión.</p>
    {publication
      ? <p className="limen-studio__publication-history">
        Última publicación: versión {publication.revision}, creada desde el borrador {publication.draftRevision} el{' '}
        {publicationDateFormatter.format(new Date(publication.publishedAt))}.
      </p>
      : <p className="limen-studio__publication-history">Este proyecto todavía no tiene publicaciones.</p>}
    {publication && equivalence && <div className={`limen-studio__publication-equivalence${equivalence.equivalent
      ? ' limen-studio__publication-equivalence--exact'
      : ''}`}>
      <div><strong>{equivalence.equivalent ? 'Coincide con la invitación pública actual' : 'Hay diferencias con la invitación pública actual'}</strong>
        <span>{equivalence.equivalent
          ? 'El contenido visible del snapshot y la versión pública estática es equivalente.'
          : `Revisá: ${equivalence.changedSections.join(', ')}.`}</span></div>
      <div className="limen-studio__publication-links">
        <a href={`/studio/publicaciones/${publication.id}?inicio=invitacion`} target="_blank" rel="noreferrer">
          Abrir snapshot privado
        </a>
        <a href={`/invitacion/${publication.document.code}`} target="_blank" rel="noreferrer">
          Abrir invitación pública actual
        </a>
      </div>
    </div>}
    <label className="limen-studio__publication-confirmation">
      <input type="checkbox" checked={editoriallyConfirmed}
        onChange={(event) => onEditorialConfirmation(event.currentTarget.checked)} />
      <span>Confirmo que revisé el contenido y la preview de esta versión.</span>
    </label>
    <div className="limen-studio__publication-action">
      <button type="button" disabled={publishing || blockReason !== undefined} onClick={onPublish}>
        {publishing
          ? 'Creando publicación…'
          : `Crear publicación${draftRevision ? ` · borrador ${draftRevision}` : ''}`}
      </button>
      {blockReason && <small>{blockReason}</small>}
    </div>
    {state.message && <p className="limen-studio__publication-message"
      role={state.status === 'error' ? 'alert' : 'status'}>{state.message}</p>}
    <p className="limen-studio__publication-note">
      En esta fase la ruta pública existente continúa intacta; el cambio de fuente se hará después de verificar equivalencia.
    </p>
  </section>
}
