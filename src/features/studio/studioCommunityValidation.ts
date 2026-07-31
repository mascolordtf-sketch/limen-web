import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type CommunityContent = Origin01InvitationData['content']['community']

const required = (value: string, message: string) => value.trim() ? null : message

const validHttpsUrl = (value: string) => {
  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

export function validateOrigin01Community(value: CommunityContent): Readonly<Record<string, string | null>> {
  const enabledCount = [value.instagram.enabled, value.hashtag.enabled, value.album.enabled].filter(Boolean).length
  const handle = value.instagram.handle.trim().replace(/^@/, '')
  const hashtag = value.hashtag.value.trim()
  return {
    communityEyebrow: required(value.eyebrow, 'Ingresá el texto introductorio.'),
    communityHeading: required(value.heading, 'Ingresá un título para Comunidad.'),
    communityIntroduction: required(value.introduction, 'Ingresá una presentación para Comunidad.'),
    communityFeatures: enabledCount > 0 ? null : 'Activá al menos Instagram, hashtag o álbum compartido.',
    communityInstagramHandle: !value.instagram.enabled ? null
      : /^[A-Za-z0-9._]{1,30}$/.test(handle) ? null : 'Ingresá un usuario de Instagram válido, sin @.',
    communityInstagramActionLabel: !value.instagram.enabled ? null
      : required(value.instagram.actionLabel, 'Ingresá el texto del enlace a Instagram.'),
    communityHashtag: !value.hashtag.enabled ? null
      : /^#[\p{L}\p{N}_]+$/u.test(hashtag) && hashtag.length <= 100 ? null : 'Ingresá un hashtag válido que comience con #.',
    communityHashtagActionLabel: !value.hashtag.enabled ? null
      : required(value.hashtag.actionLabel, 'Ingresá el texto de la acción para copiar.'),
    communityHashtagCopiedLabel: !value.hashtag.enabled ? null
      : required(value.hashtag.copiedLabel, 'Ingresá el mensaje de confirmación.'),
    communityAlbumUrl: !value.album.enabled ? null
      : validHttpsUrl(value.album.url.trim()) ? null : 'Ingresá un enlace HTTPS válido para el álbum.',
    communityAlbumInvitation: !value.album.enabled ? null
      : required(value.album.invitation, 'Ingresá una invitación para compartir fotos.'),
    communityAlbumActionLabel: !value.album.enabled ? null
      : required(value.album.actionLabel, 'Ingresá el texto del enlace al álbum.'),
  }
}
