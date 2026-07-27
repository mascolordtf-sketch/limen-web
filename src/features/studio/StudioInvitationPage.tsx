import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { updateInvitationModuleConfiguration } from '../invitations/engine/moduleConfiguration'
import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioContentEditor } from './StudioContentEditor'
import { StudioEventDateEditor } from './StudioEventDateEditor'
import { StudioEventEndEditor } from './StudioEventEndEditor'
import { StudioModuleList } from './StudioModuleList'
import { StudioPreview } from './StudioPreview'
import { StudioShareEditor } from './StudioShareEditor'
import type { StudioShareMode } from './StudioShareEditor'
import { fromDateTimeLocalValue, toDateTimeLocalValue } from './studioDateTime'
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

type StudioInvitationPageProps = {
  invitation: Origin01InvitationData
}

export function StudioInvitationPage({ invitation }: StudioInvitationPageProps) {
  const template = findInvitationTemplate(invitation.templateId)
  const [modules, setModules] = useState<readonly InvitationModuleConfig[]>(
    () => invitation.modules.map((module) => ({ ...module })),
  )
  const [audience, setAudience] = useState<InvitationAudience>('protagonist')
  const canonicalProtagonistIdentity = invitation.identities.find(
    ({ role }) => role === 'protagonist',
  )
  const canonicalProtagonistName = canonicalProtagonistIdentity?.displayName ?? ''
  const [protagonistName, setProtagonistName] = useState<string>(
    () => canonicalProtagonistIdentity?.displayName ?? '',
  )
  const initialShareMessage = `${canonicalProtagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  const [shareMode, setShareMode] = useState<StudioShareMode>('default')
  const [customShareMessage, setCustomShareMessage] = useState<string>(() => initialShareMessage)
  const [customShareMessageInitialized, setCustomShareMessageInitialized] = useState(false)
  const canonicalEventStart = useMemo(
    () => toDateTimeLocalValue(invitation.event.startsAt, invitation.event.timeZone),
    [invitation.event.startsAt, invitation.event.timeZone],
  )
  const [eventStart, setEventStart] = useState<string>(() => canonicalEventStart)
  const canonicalEventEnd = useMemo(
    () => toDateTimeLocalValue(invitation.event.endsAt, invitation.event.timeZone),
    [invitation.event.endsAt, invitation.event.timeZone],
  )
  const [eventEnd, setEventEnd] = useState<string>(() => canonicalEventEnd)
  const temporaryStartsAt = useMemo(
    () => fromDateTimeLocalValue(eventStart, invitation.event.timeZone),
    [eventStart, invitation.event.timeZone],
  )
  const temporaryEndsAt = useMemo(
    () => fromDateTimeLocalValue(eventEnd, invitation.event.timeZone),
    [eventEnd, invitation.event.timeZone],
  )
  const eventStartError = temporaryStartsAt ? null : 'Ingresá una fecha y hora válidas.'
  const eventEndError = !temporaryEndsAt
    ? 'Ingresá una fecha y hora de finalización válidas.'
    : temporaryStartsAt && new Date(temporaryEndsAt).getTime() <= new Date(temporaryStartsAt).getTime()
      ? 'La finalización debe ser posterior al inicio.'
      : null
  const temporaryDateLabel = temporaryStartsAt
    ? new Intl.DateTimeFormat('es-AR', {
      day: 'numeric', month: 'long', year: 'numeric', timeZone: invitation.event.timeZone,
    }).format(new Date(temporaryStartsAt))
    : ''
  const temporaryTimeLabel = temporaryStartsAt
    ? new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: invitation.event.timeZone,
    }).format(new Date(temporaryStartsAt))
    : ''
  const defaultShareMessage = `${protagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  const shareMessageError = shareMode === 'custom' && customShareMessage.trim().length === 0
    ? 'Ingresá un mensaje para compartir.'
    : null
  const protagonistNameError = protagonistName.trim().length === 0
    ? 'Ingresá el nombre de la protagonista.'
    : null
  const validation = useMemo(
    () => validateInvitationConfiguration({ ...invitation, modules }, findInvitationTemplate),
    [invitation, modules],
  )
  const previewInvitation = useMemo<Origin01InvitationData>(
    () => ({
      ...invitation,
      modules,
      identities: invitation.identities.map((identity) => (
        identity.role === 'protagonist'
          ? { ...identity, displayName: protagonistName }
          : identity
      )),
      event: {
        ...invitation.event,
        name: protagonistName,
        startsAt: temporaryStartsAt ?? invitation.event.startsAt,
        endsAt: temporaryEndsAt ?? invitation.event.endsAt,
      },
      content: {
        ...invitation.content,
        prelude: {
          ...invitation.content.prelude,
          title: `Hola, ${protagonistName}.`,
        },
        hero: {
          ...invitation.content.hero,
          dateLabel: temporaryDateLabel,
        },
        eventDetails: {
          ...invitation.content.eventDetails,
          dateLabel: temporaryDateLabel,
          timeLabel: temporaryTimeLabel,
        },
        story: {
          ...invitation.content.story,
          signature: protagonistName,
        },
        trivia: {
          ...invitation.content.trivia,
          protagonistName,
          accessibleTitle: `Trivia sobre ${protagonistName}`,
          title: `¿Cuánto conocés de verdad a ${protagonistName}?`,
          revealSignature: protagonistName,
        },
        closing: {
          ...invitation.content.closing,
          signature: protagonistName,
          shareTitle: `Mis 15 de ${protagonistName}`,
          shareText: shareMode === 'default' ? defaultShareMessage : customShareMessage,
        },
      },
    }),
    [customShareMessage, defaultShareMessage, invitation, modules, protagonistName, shareMode,
      temporaryDateLabel, temporaryEndsAt, temporaryStartsAt, temporaryTimeLabel],
  )
  const publicInvitationUrl = new URL(`/demo/${invitation.code}`, window.location.origin).toString()
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
  const handleShareModeChange = (mode: StudioShareMode) => {
    if (mode === 'custom' && !customShareMessageInitialized) {
      setCustomShareMessage(defaultShareMessage)
      setCustomShareMessageInitialized(true)
    }
    setShareMode(mode)
  }

  const handleShareReset = () => {
    setShareMode('default')
    setCustomShareMessage(defaultShareMessage)
    setCustomShareMessageInitialized(true)
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
          {canonicalProtagonistIdentity ? (
            <StudioContentEditor
              value={protagonistName}
              canonicalValue={canonicalProtagonistName}
              error={protagonistNameError}
              onChange={setProtagonistName}
              onReset={() => setProtagonistName(canonicalProtagonistName)}
            />
          ) : (
            <section className="limen-studio__content-editor" aria-labelledby="studio-content-title">
              <h2 id="studio-content-title">Contenido principal</h2>
              <p className="limen-studio__field-error" role="alert">
                No encontramos la identidad de la protagonista en esta invitación.
              </p>
            </section>
          )}
          <StudioShareEditor
            mode={shareMode}
            defaultMessage={defaultShareMessage}
            customMessage={customShareMessage}
            error={shareMessageError}
            resetDisabled={shareMode === 'default' && customShareMessage === defaultShareMessage}
            onModeChange={handleShareModeChange}
            onCustomMessageChange={setCustomShareMessage}
            onReset={handleShareReset}
          />
          <StudioEventDateEditor
            value={eventStart}
            canonicalValue={canonicalEventStart}
            timeZone={invitation.event.timeZone}
            error={eventStartError}
            onChange={setEventStart}
            onReset={() => setEventStart(canonicalEventStart)}
          />
          <StudioEventEndEditor
            value={eventEnd}
            canonicalValue={canonicalEventEnd}
            timeZone={invitation.event.timeZone}
            error={eventEndError}
            onChange={setEventEnd}
            onReset={() => setEventEnd(canonicalEventEnd)}
          />
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
          invitation={validation.valid && canonicalProtagonistIdentity && !protagonistNameError
            && !shareMessageError && !eventStartError && !eventEndError
            ? previewInvitation
            : null}
          audience={audience}
          publicInvitationUrl={publicInvitationUrl}
          onAudienceChange={setAudience}
        />
      </div>
    </div>
  )
}
