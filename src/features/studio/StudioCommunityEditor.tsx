import type { ChangeEvent } from 'react'

import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type CommunityContent = Origin01InvitationData['content']['community']

const describedBy = (id: string, error: string | null | undefined) => error ? `${id}-help ${id}-error` : `${id}-help`

export function StudioCommunityEditor({ value, canonicalValue, errors, onChange, onReset }: {
  value: CommunityContent
  canonicalValue: CommunityContent
  errors: Readonly<Record<string, string | null>>
  onChange: (value: CommunityContent) => void
  onReset: () => void
}) {
  const textField = (field: 'eyebrow' | 'heading' | 'introduction', label: string, multiline = false) => {
    const id = `studio-community-${field}`
    const error = errors[`community${field[0].toUpperCase()}${field.slice(1)}`]
    const common = {
      id, value: value[field], 'aria-invalid': error ? true as const : undefined,
      'aria-describedby': describedBy(id, error),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...value, [field]: event.target.value }),
    }
    return <div className="limen-studio__field-group">
      <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
      <p className="limen-studio__field-help" id={`${id}-help`}>Texto visible en la escena pública.</p>
      {multiline ? <textarea className="limen-studio__textarea" rows={3} {...common} />
        : <input className="limen-studio__text-input" type="text" {...common} />}
      {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  }

  const feature = <K extends 'instagram' | 'hashtag' | 'album'>(key: K, label: string, description: string) =>
    <label className="limen-studio__community-feature">
      <span><strong>{label}</strong><small>{description}</small></span>
      <input type="checkbox" role="switch" checked={value[key].enabled}
        onChange={(event) => onChange({ ...value, [key]: { ...value[key], enabled: event.currentTarget.checked } })} />
    </label>

  const input = (id: string, label: string, valueText: string, errorKey: string,
    onValue: (next: string) => void, type: 'text' | 'url' = 'text') => {
    const error = errors[errorKey]
    return <div className="limen-studio__field-group">
      <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
      <p className="limen-studio__field-help" id={`${id}-help`}>Se usa directamente en la invitación pública.</p>
      <input className="limen-studio__text-input" id={id} type={type} value={valueText}
        aria-invalid={error ? true : undefined} aria-describedby={describedBy(id, error)}
        onChange={(event) => onValue(event.currentTarget.value)} />
      {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  }

  return <section className="limen-studio__content-editor limen-studio__community-editor" aria-labelledby="studio-community-title">
    <div className="limen-studio__editor-heading">
      <div><p className="limen-studio__eyebrow">Experiencias</p><h2 id="studio-community-title" tabIndex={-1}>Comunidad del evento</h2></div>
      <button className="limen-studio__field-reset" type="button" onClick={onReset}
        disabled={JSON.stringify(value) === JSON.stringify(canonicalValue)}>Restablecer Comunidad</button>
    </div>
    <p className="limen-studio__editor-intro">Conectá a los invitados con destinos reales. LIMEN no accede a cuentas, publicaciones ni fotografías.</p>
    {textField('eyebrow', 'Texto superior')}
    {textField('heading', 'Título')}
    {textField('introduction', 'Presentación', true)}
    <fieldset className="limen-studio__community-options" id="studio-community-features"
      aria-invalid={errors.communityFeatures ? true : undefined}
      aria-describedby={errors.communityFeatures ? 'studio-community-features-error' : undefined}>
      <legend>Funciones incluidas</legend>
      {feature('instagram', 'Instagram', 'Enlace al perfil oficial del evento.')}
      {feature('hashtag', 'Hashtag', 'Texto listo para copiar y usar.')}
      {feature('album', 'Álbum compartido', 'Destino externo para subir fotos y videos.')}
      {errors.communityFeatures ? <p className="limen-studio__field-error" id="studio-community-features-error" role="alert">{errors.communityFeatures}</p> : null}
    </fieldset>
    {value.instagram.enabled ? <div className="limen-studio__community-group">
      <h3>Instagram</h3>
      {input('studio-community-instagram-handle', 'Usuario (sin @)', value.instagram.handle,
        'communityInstagramHandle', (handle) => onChange({ ...value, instagram: { ...value.instagram, handle } }))}
      {input('studio-community-instagram-action', 'Texto del enlace', value.instagram.actionLabel,
        'communityInstagramActionLabel', (actionLabel) => onChange({ ...value, instagram: { ...value.instagram, actionLabel } }))}
    </div> : null}
    {value.hashtag.enabled ? <div className="limen-studio__community-group">
      <h3>Hashtag</h3>
      {input('studio-community-hashtag', 'Hashtag oficial', value.hashtag.value,
        'communityHashtag', (next) => onChange({ ...value, hashtag: { ...value.hashtag, value: next } }))}
      {input('studio-community-hashtag-action', 'Texto para copiar', value.hashtag.actionLabel,
        'communityHashtagActionLabel', (actionLabel) => onChange({ ...value, hashtag: { ...value.hashtag, actionLabel } }))}
      {input('studio-community-hashtag-copied', 'Confirmación de copia', value.hashtag.copiedLabel,
        'communityHashtagCopiedLabel', (copiedLabel) => onChange({ ...value, hashtag: { ...value.hashtag, copiedLabel } }))}
    </div> : null}
    {value.album.enabled ? <div className="limen-studio__community-group">
      <h3>Álbum compartido</h3>
      {input('studio-community-album-url', 'Enlace HTTPS', value.album.url,
        'communityAlbumUrl', (url) => onChange({ ...value, album: { ...value.album, url } }), 'url')}
      {input('studio-community-album-invitation', 'Invitación a participar', value.album.invitation,
        'communityAlbumInvitation', (invitation) => onChange({ ...value, album: { ...value.album, invitation } }))}
      {input('studio-community-album-action', 'Texto del enlace', value.album.actionLabel,
        'communityAlbumActionLabel', (actionLabel) => onChange({ ...value, album: { ...value.album, actionLabel } }))}
    </div> : null}
    <aside className="limen-studio__weather-policy"><strong>Límite de esta fase</strong>
      <p>Los enlaces abren servicios externos. LIMEN todavía no almacena, modera ni muestra fotos aportadas por invitados.</p></aside>
  </section>
}
