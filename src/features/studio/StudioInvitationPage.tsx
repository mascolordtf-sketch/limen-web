import { Link } from 'react-router-dom'

import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioNavigationShell } from './StudioNavigationShell'
import { StudioActiveEditor } from './StudioActiveEditor'
import { isStudioEditorId } from './studioEditorContract'
import { createOrigin01StudioDomains } from './origin01StudioConfiguration'
import { useStudioNavigation } from './useStudioNavigation'
import { StudioPreview } from './StudioPreview'
import { selectValidStudioPreview } from './origin01StudioValidation'
import { useOrigin01StudioModel } from './useOrigin01StudioModel'
import { useStudioPreviewAudience } from './useStudioPreviewAudience'
import './studio.css'

const lifecycleLabels = {
  draft: 'Borrador', awaiting_content: 'Esperando contenido', in_preparation: 'En preparación',
  review: 'En revisión', published: 'Publicada', completed: 'Finalizada', archived: 'Archivada',
} as const

type StudioInvitationPageProps = { invitation: Origin01InvitationData }

export function StudioInvitationPage({ invitation }: StudioInvitationPageProps) {
  const template = findInvitationTemplate(invitation.templateId)
  const model = useOrigin01StudioModel(invitation)
  const previewAudience = useStudioPreviewAudience('protagonist')
  const { draft, validation: studioValidation, previewInvitation } = model
  const canonicalProtagonistIdentity = invitation.identities.find(({ role }) => role === 'protagonist')
  const publicInvitationUrl = new URL(`/demo/${invitation.code}`, window.location.origin).toString()
  const eventDate = new Intl.DateTimeFormat('es-AR', { dateStyle: 'long', timeStyle: 'short',
    timeZone: invitation.event.timeZone }).format(new Date(invitation.event.startsAt))
  const domains = createOrigin01StudioDomains(template)
  const [navigation, navigate] = useStudioNavigation(domains)
  const editorResolvable = navigation.editorId === undefined || isStudioEditorId(navigation.editorId)
  const activeEditor = navigation.editorId
    ? <StudioActiveEditor invitation={invitation} template={template} model={model} editorId={navigation.editorId} />
    : null

  return (
    <div className="limen-studio">
      <div className="limen-studio__workspace">
        <header className="limen-studio__header">
          <div>
            <p className="limen-studio__eyebrow">LIMEN Studio</p>
            <h1>Espacio interno de composición</h1>
          </div>
          <Link className="limen-studio__back-link" to="/">Volver al sitio</Link>
        </header>

        <section className="limen-studio__summary" aria-labelledby="studio-invitation-title">
          <div className="limen-studio__summary-heading">
            <p className="limen-studio__eyebrow">Invitación</p>
            <h2 id="studio-invitation-title">{draft.protagonistName}</h2>
            <p className="limen-studio__technical">Borrador temporal · Código estable {invitation.code}</p>
            <p className="limen-studio__technical">{studioValidation.invitationValid
              ? 'Invitación válida' : 'Invitación con errores'} · Cambios no persistentes</p>
          </div>
          <dl className="limen-studio__metadata">
            <div><dt>Evento</dt><dd>{invitation.event.name}</dd></div>
            <div><dt>Celebración</dt><dd>{invitation.event.celebrationLabel}</dd></div>
            <div><dt>Fecha</dt><dd>{eventDate}</dd></div>
            <div><dt>Plantilla</dt><dd>Origin 01 <span>{invitation.templateId}</span></dd></div>
            <div><dt>Estado</dt><dd>{lifecycleLabels[invitation.lifecycleStatus]}</dd></div>
            <div><dt>Módulos configurados</dt><dd>{invitation.modules.length}</dd></div>
          </dl>
        </section>

        <section className="limen-studio__notice" aria-labelledby="studio-notice-title">
          <h2 id="studio-notice-title">Estado del prototipo</h2>
          <p><strong>Prototipo interno sin autenticación. No contiene persistencia.</strong></p>
          <p>Los cambios de configuración de este espacio son temporales y se restablecen al recargar.</p>
        </section>

        <StudioNavigationShell domains={domains} navigation={navigation}
          validation={studioValidation} editor={activeEditor} editorResolvable={editorResolvable}
          onNavigate={navigate} />
        <StudioPreview
          key={previewAudience.previewKey}
          invitation={canonicalProtagonistIdentity
            ? selectValidStudioPreview(studioValidation, previewInvitation) : null}
          audience={previewAudience.audience}
          publicInvitationUrl={publicInvitationUrl}
          onAudienceChange={previewAudience.changeAudience}
        />
      </div>
    </div>
  )
}
