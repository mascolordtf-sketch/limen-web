import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

import { updateInvitationModuleConfiguration } from '../invitations/engine/moduleConfiguration'
import type { InvitationAudience } from '../invitations/engine/invitationTypes'
import type { InvitationModuleConfig, InvitationModuleId } from '../invitations/engine/moduleTypes'
import { findInvitationTemplate } from '../invitations/engine/templateRegistry'
import { validateInvitationConfiguration } from '../invitations/engine/invitationValidation'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioContentEditor } from './StudioContentEditor'
import { StudioDressCodeEditor } from './StudioDressCodeEditor'
import { StudioEventLocationEditor } from './StudioEventLocationEditor'
import { StudioEventScheduleEditor } from './StudioEventScheduleEditor'
import { StudioGiftsEditor } from './StudioGiftsEditor'
import { StudioModuleList } from './StudioModuleList'
import { StudioPreview } from './StudioPreview'
import { StudioRsvpEditor } from './StudioRsvpEditor'
import { StudioShareEditor } from './StudioShareEditor'
import type { StudioShareMode } from './StudioShareEditor'
import { StudioStoryEditor } from './StudioStoryEditor'
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
  const canonicalVenue = invitation.event.venue
  const [venue, setVenue] = useState<string>(() => canonicalVenue)
  const canonicalAddress = invitation.event.address
  const [address, setAddress] = useState<string>(() => canonicalAddress)
  const canonicalDressCodeTitle = invitation.content.dressCode.title
  const [dressCodeTitle, setDressCodeTitle] = useState<string>(() => canonicalDressCodeTitle)
  const canonicalDressCodeDescription = invitation.content.dressCode.description
  const [dressCodeDescription, setDressCodeDescription] = useState<string>(
    () => canonicalDressCodeDescription,
  )
  const canonicalDressCodeNote = invitation.content.dressCode.note
  const [dressCodeNote, setDressCodeNote] = useState<string>(() => canonicalDressCodeNote)
  const canonicalRsvpTitle = invitation.content.rsvp.title
  const [rsvpTitle, setRsvpTitle] = useState<string>(() => canonicalRsvpTitle)
  const canonicalRsvpDescription = invitation.content.rsvp.description
  const [rsvpDescription, setRsvpDescription] = useState<string>(() => canonicalRsvpDescription)
  const canonicalRsvpActionLabel = invitation.content.rsvp.actionLabel
  const [rsvpActionLabel, setRsvpActionLabel] = useState<string>(() => canonicalRsvpActionLabel)
  const canonicalRsvpRecipientPhone = invitation.content.rsvp.recipientPhone ?? ''
  const [rsvpRecipientPhone, setRsvpRecipientPhone] = useState<string>(
    () => canonicalRsvpRecipientPhone,
  )
  const canonicalGiftsTitle = invitation.content.gifts.title
  const [giftsTitle, setGiftsTitle] = useState<string>(() => canonicalGiftsTitle)
  const canonicalGiftsDescription = invitation.content.gifts.description
  const [giftsDescription, setGiftsDescription] = useState<string>(() => canonicalGiftsDescription)
  const canonicalGiftsNote = invitation.content.gifts.demoNote
  const [giftsNote, setGiftsNote] = useState<string>(() => canonicalGiftsNote)
  const canonicalGiftsAccount = invitation.content.gifts.accountValue
  const [giftsAccount, setGiftsAccount] = useState<string>(() => canonicalGiftsAccount)
  const canonicalStoryEyebrow = invitation.content.story.eyebrow
  const [storyEyebrow, setStoryEyebrow] = useState<string>(() => canonicalStoryEyebrow)
  const canonicalStoryMessage = invitation.content.story.message
  const [storyMessage, setStoryMessage] = useState<string>(() => canonicalStoryMessage)
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
  const timeFormatter = new Intl.DateTimeFormat('es-AR', {
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: invitation.event.timeZone,
    })
  const temporaryTimeLabel = temporaryStartsAt && temporaryEndsAt
    ? `${timeFormatter.format(new Date(temporaryStartsAt))} a ${timeFormatter.format(new Date(temporaryEndsAt))}`
    : ''
  const defaultShareMessage = `${protagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  const shareMessageError = shareMode === 'custom' && customShareMessage.trim().length === 0
    ? 'Ingresá un mensaje para compartir.'
    : null
  const protagonistNameError = protagonistName.trim().length === 0
    ? 'Ingresá el nombre de la protagonista.'
    : null
  const venueError = venue.trim().length === 0
    ? 'Ingresá el nombre del lugar.'
    : null
  const addressError = address.trim().length === 0
    ? 'Ingresá la dirección del evento.'
    : null
  const dressCodeTitleError = dressCodeTitle.trim().length === 0
    ? 'Ingresá el tipo de vestimenta.'
    : null
  const dressCodeDescriptionError = dressCodeDescription.trim().length === 0
    ? 'Ingresá una descripción del Dress Code.'
    : null
  const dressCodeNoteError = dressCodeNote.trim().length === 0
    ? 'Ingresá una nota destacada.'
    : null
  const rsvpTitleError = rsvpTitle.trim().length === 0
    ? 'Ingresá un título para la confirmación.'
    : null
  const rsvpDescriptionError = rsvpDescription.trim().length === 0
    ? 'Ingresá una descripción para la confirmación.'
    : null
  const rsvpActionLabelError = rsvpActionLabel.trim().length === 0
    ? 'Ingresá el texto del botón.'
    : null
  const trimmedRsvpRecipientPhone = rsvpRecipientPhone.trim()
  const rsvpRecipientDigits = trimmedRsvpRecipientPhone.replace(/\D/g, '')
  const rsvpRecipientPhoneError = !/^\+?[\d ()-]+$/.test(trimmedRsvpRecipientPhone)
    || rsvpRecipientDigits.length < 7 || rsvpRecipientDigits.length > 15
    ? 'Ingresá un número de WhatsApp válido.'
    : null
  const giftsTitleError = giftsTitle.trim().length === 0
    ? 'Ingresá un título para la sección de regalos.'
    : null
  const giftsDescriptionError = giftsDescription.trim().length === 0
    ? 'Ingresá una descripción para la sección de regalos.'
    : null
  const giftsNoteError = giftsNote.trim().length === 0 ? 'Ingresá una nota destacada.' : null
  const giftsAccountError = giftsAccount.trim().length === 0
    ? 'Ingresá el dato para regalar.'
    : null
  const storyEyebrowError = storyEyebrow.trim().length === 0
    ? 'Ingresá el texto introductorio.'
    : null
  const storyMessageError = storyMessage.trim().length === 0
    ? 'Ingresá el texto de la historia.'
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
        venue,
        address,
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
          eyebrow: storyEyebrow,
          message: storyMessage,
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
        dressCode: {
          ...invitation.content.dressCode,
          title: dressCodeTitle,
          description: dressCodeDescription,
          note: dressCodeNote,
        },
        rsvp: {
          ...invitation.content.rsvp,
          title: rsvpTitle,
          description: rsvpDescription,
          actionLabel: rsvpActionLabel,
          recipientPhone: rsvpRecipientDigits,
        },
        gifts: {
          ...invitation.content.gifts,
          title: giftsTitle,
          description: giftsDescription,
          demoNote: giftsNote,
          accountValue: giftsAccount,
        },
      },
    }),
    [address, customShareMessage, defaultShareMessage, dressCodeDescription, dressCodeNote,
      dressCodeTitle, giftsAccount, giftsDescription, giftsNote, giftsTitle, invitation, modules,
      protagonistName, shareMode, storyEyebrow, storyMessage, temporaryDateLabel,
      rsvpActionLabel, rsvpDescription, rsvpRecipientDigits, rsvpTitle, temporaryEndsAt,
      temporaryStartsAt, temporaryTimeLabel, venue],
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
          <StudioStoryEditor
            eyebrowValue={storyEyebrow}
            canonicalEyebrowValue={canonicalStoryEyebrow}
            eyebrowError={storyEyebrowError}
            messageValue={storyMessage}
            canonicalMessageValue={canonicalStoryMessage}
            messageError={storyMessageError}
            onEyebrowChange={setStoryEyebrow}
            onEyebrowReset={() => setStoryEyebrow(canonicalStoryEyebrow)}
            onMessageChange={setStoryMessage}
            onMessageReset={() => setStoryMessage(canonicalStoryMessage)}
          />
          <StudioEventScheduleEditor
            startValue={eventStart}
            canonicalStartValue={canonicalEventStart}
            startError={eventStartError}
            endValue={eventEnd}
            canonicalEndValue={canonicalEventEnd}
            endError={eventEndError}
            timeZone={invitation.event.timeZone}
            onStartChange={setEventStart}
            onStartReset={() => setEventStart(canonicalEventStart)}
            onEndChange={setEventEnd}
            onEndReset={() => setEventEnd(canonicalEventEnd)}
          />
          <StudioEventLocationEditor
            venueValue={venue}
            canonicalVenueValue={canonicalVenue}
            venueError={venueError}
            addressValue={address}
            canonicalAddressValue={canonicalAddress}
            addressError={addressError}
            onVenueChange={setVenue}
            onVenueReset={() => setVenue(canonicalVenue)}
            onAddressChange={setAddress}
            onAddressReset={() => setAddress(canonicalAddress)}
          />
          <StudioDressCodeEditor
            titleValue={dressCodeTitle}
            canonicalTitleValue={canonicalDressCodeTitle}
            titleError={dressCodeTitleError}
            descriptionValue={dressCodeDescription}
            canonicalDescriptionValue={canonicalDressCodeDescription}
            descriptionError={dressCodeDescriptionError}
            noteValue={dressCodeNote}
            canonicalNoteValue={canonicalDressCodeNote}
            noteError={dressCodeNoteError}
            onTitleChange={setDressCodeTitle}
            onTitleReset={() => setDressCodeTitle(canonicalDressCodeTitle)}
            onDescriptionChange={setDressCodeDescription}
            onDescriptionReset={() => setDressCodeDescription(canonicalDressCodeDescription)}
            onNoteChange={setDressCodeNote}
            onNoteReset={() => setDressCodeNote(canonicalDressCodeNote)}
          />
          <StudioGiftsEditor
            titleValue={giftsTitle}
            canonicalTitleValue={canonicalGiftsTitle}
            titleError={giftsTitleError}
            descriptionValue={giftsDescription}
            canonicalDescriptionValue={canonicalGiftsDescription}
            descriptionError={giftsDescriptionError}
            noteValue={giftsNote}
            canonicalNoteValue={canonicalGiftsNote}
            noteError={giftsNoteError}
            accountValue={giftsAccount}
            canonicalAccountValue={canonicalGiftsAccount}
            accountError={giftsAccountError}
            onTitleChange={setGiftsTitle}
            onTitleReset={() => setGiftsTitle(canonicalGiftsTitle)}
            onDescriptionChange={setGiftsDescription}
            onDescriptionReset={() => setGiftsDescription(canonicalGiftsDescription)}
            onNoteChange={setGiftsNote}
            onNoteReset={() => setGiftsNote(canonicalGiftsNote)}
            onAccountChange={setGiftsAccount}
            onAccountReset={() => setGiftsAccount(canonicalGiftsAccount)}
          />
          <StudioRsvpEditor
            titleValue={rsvpTitle}
            canonicalTitleValue={canonicalRsvpTitle}
            titleError={rsvpTitleError}
            descriptionValue={rsvpDescription}
            canonicalDescriptionValue={canonicalRsvpDescription}
            descriptionError={rsvpDescriptionError}
            actionLabelValue={rsvpActionLabel}
            canonicalActionLabelValue={canonicalRsvpActionLabel}
            actionLabelError={rsvpActionLabelError}
            recipientPhoneValue={rsvpRecipientPhone}
            canonicalRecipientPhoneValue={canonicalRsvpRecipientPhone}
            recipientPhoneError={rsvpRecipientPhoneError}
            onTitleChange={setRsvpTitle}
            onTitleReset={() => setRsvpTitle(canonicalRsvpTitle)}
            onDescriptionChange={setRsvpDescription}
            onDescriptionReset={() => setRsvpDescription(canonicalRsvpDescription)}
            onActionLabelChange={setRsvpActionLabel}
            onActionLabelReset={() => setRsvpActionLabel(canonicalRsvpActionLabel)}
            onRecipientPhoneChange={setRsvpRecipientPhone}
            onRecipientPhoneReset={() => setRsvpRecipientPhone(canonicalRsvpRecipientPhone)}
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
            && !shareMessageError && !eventStartError && !eventEndError && !venueError && !addressError
            && !dressCodeTitleError && !dressCodeDescriptionError && !dressCodeNoteError
            && !rsvpTitleError && !rsvpDescriptionError && !rsvpActionLabelError
            && !rsvpRecipientPhoneError
            && !giftsTitleError && !giftsDescriptionError && !giftsNoteError && !giftsAccountError
            && !storyEyebrowError && !storyMessageError
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
