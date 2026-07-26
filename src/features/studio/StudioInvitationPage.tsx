import { Link } from 'react-router-dom'

import { origin01DemoData } from '../invitations/origin01/origin01DemoData'
import './studio.css'

const lifecycleLabels = {
  draft: 'Borrador',
  awaiting_content: 'Esperando contenido',
  in_preparation: 'En preparación',
  review: 'En revisión',
  published: 'Publicada',
  completed: 'Finalizada',
  archived: 'Archivada',
} as const

export function StudioInvitationPage() {
  const invitation = origin01DemoData
  const eventDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: invitation.event.timeZone,
  }).format(new Date(invitation.event.startsAt))

  return (
    <main className="limen-studio">
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
            <h2 id="studio-invitation-title">{invitation.internalName}</h2>
            <p className="limen-studio__technical">Código {invitation.code}</p>
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
          <p>Los cambios futuros de este espacio serán temporales hasta conectar el backend.</p>
          <p>Esta fase todavía no incluye controles editables.</p>
        </section>

        <div className="limen-studio__panel-grid">
          <section className="limen-studio__panel" aria-labelledby="studio-scenes-title">
            <h2 id="studio-scenes-title">Configuración de escenas</h2>
            <p>Los controles para activar y desactivar escenas se incorporarán en la próxima fase.</p>
          </section>
          <section className="limen-studio__panel" aria-labelledby="studio-preview-title">
            <h2 id="studio-preview-title">Vista previa</h2>
            <p>La vista previa real de la invitación se conectará en una fase posterior.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
