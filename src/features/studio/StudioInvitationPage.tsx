import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { updateInvitationModuleConfiguration } from '../invitations/engine/moduleConfiguration'
import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { origin01DemoData } from '../invitations/origin01/origin01DemoData'
import { StudioModuleList } from './StudioModuleList'
import { StudioPreview } from './StudioPreview'
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
  const template = findInvitationTemplate(invitation.templateId)
  const [modules, setModules] = useState<readonly InvitationModuleConfig[]>(
    () => invitation.modules.map((module) => ({ ...module })),
  )
  const [audience, setAudience] = useState<InvitationAudience>('protagonist')
  const validation = useMemo(
    () => validateInvitationConfiguration({ ...invitation, modules }, findInvitationTemplate),
    [invitation, modules],
  )
  const previewInvitation = useMemo<Origin01InvitationData>(
    () => ({ ...origin01DemoData, modules }),
    [modules],
  )
  const resetDisabled = modules.length === invitation.modules.length
    && modules.every((module, index) => {
      const originalModule = invitation.modules[index]
      return module.moduleId === originalModule.moduleId && module.enabled === originalModule.enabled
    })

  const handleModuleChange = (moduleId: InvitationModuleId, enabled: boolean) => {
    if (!template || template.requiredModules.includes(moduleId)) return

    setModules((currentModules) => (
      updateInvitationModuleConfiguration(currentModules, { [moduleId]: enabled })
    ))
  }

  const handleReset = () => {
    setModules(invitation.modules.map((module) => ({ ...module })))
  }
  const eventDate = new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: invitation.event.timeZone,
  }).format(new Date(invitation.event.startsAt))

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
          <p>Los cambios de configuración de este espacio son temporales y se restablecen al recargar.</p>
        </section>

        <div className="limen-studio__panel-grid">
          <section className="limen-studio__panel" aria-labelledby="studio-scenes-title">
            {template ? (
              <StudioModuleList
                template={template}
                modules={modules}
                validation={validation}
                onModuleChange={handleModuleChange}
                onReset={handleReset}
                resetDisabled={resetDisabled}
              />
            ) : (
              <>
                <h2 id="studio-scenes-title">Configuración de escenas</h2>
                <p>No pudimos cargar la plantilla de esta invitación. Revisá su configuración.</p>
              </>
            )}
          </section>
        </div>

        <StudioPreview
          invitation={validation.valid ? previewInvitation : null}
          audience={audience}
          onAudienceChange={setAudience}
        />
      </div>
    </div>
  )
}
