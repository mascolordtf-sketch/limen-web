import type { StudioPublicationState, StudioPublicationSummary } from './studioPublication'

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
  readonly publication?: StudioPublicationSummary
  readonly state: StudioPublicationState
  readonly blockReason?: string
  readonly editoriallyConfirmed: boolean
  readonly onEditorialConfirmation: (confirmed: boolean) => void
  readonly onPublish: () => void
}

export function StudioPublicationPanel({
  draftRevision,
  publication,
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
