import type { InvitationTemplateDefinition } from '../invitations/engine/templateTypes'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'
import { StudioClosingEditor } from './StudioClosingEditor'
import { StudioContentEditor } from './StudioContentEditor'
import { StudioDressCodeEditor } from './StudioDressCodeEditor'
import { StudioEventInformationEditor } from './StudioEventInformationEditor'
import { StudioEventLocationEditor } from './StudioEventLocationEditor'
import { StudioEventScheduleEditor } from './StudioEventScheduleEditor'
import { StudioGalleryEditor } from './StudioGalleryEditor'
import { StudioGiftsEditor } from './StudioGiftsEditor'
import { StudioModuleList } from './StudioModuleList'
import { StudioOpeningEditor } from './StudioOpeningEditor'
import { StudioRsvpEditor } from './StudioRsvpEditor'
import { StudioShareEditor } from './StudioShareEditor'
import { StudioStoryEditor } from './StudioStoryEditor'
import { StudioTriviaEditor } from './StudioTriviaEditor'
import { selectStudioIssueSummary } from './studioItemStatus'
import type { useOrigin01StudioModel } from './useOrigin01StudioModel'

import { resolveStudioActiveEditor } from './studioEditorContract'
import type { StudioEditorSlots } from './studioEditorContract'
import type { ReactNode } from 'react'

type StudioActiveEditorProps = {
  invitation: Origin01InvitationData
  template?: InvitationTemplateDefinition
  model: ReturnType<typeof useOrigin01StudioModel>
  editorId?: string
  reviewPanels?: Partial<Record<'review-status' | 'review-errors' | 'review-audiences', ReactNode>>
}

export function StudioActiveEditor({ invitation, template, model, editorId, reviewPanels }: StudioActiveEditorProps) {
  const { draft, initialDraft, validation: studioValidation, configurationValidation,
    update, updateGroup, resetValue, resetField, resetScene,
    resetConfiguration, setModuleEnabled } = model
  const errors = studioValidation.fieldErrors

  const protagonistName = draft.protagonistName
  const canonicalProtagonistName = initialDraft.protagonistName
  const canonicalProtagonistIdentity = invitation.identities.find(({ role }) => role === 'protagonist')
  const setProtagonistName = (value: string) => update('protagonistName', value)
  const shareMode = draft.share.mode
  const customShareMessage = draft.share.customMessage
  const defaultShareMessage = `${protagonistName} está por vivir una noche muy especial y quiere compartirla con vos.\nAntes era un sueño. Ahora empieza.`
  const setCustomShareMessage = (value: string) => updateGroup('share', (current) => ({ ...current, customMessage: value }))
  const handleShareModeChange = (mode: typeof shareMode) => updateGroup('share', (current) => ({
    ...current, mode,
    customMessage: mode === 'custom' && !current.customMessageInitialized ? defaultShareMessage : current.customMessage,
    customMessageInitialized: current.customMessageInitialized || mode === 'custom',
  }))
  const handleShareReset = () => update('share', { ...initialDraft.share, customMessage: defaultShareMessage, customMessageInitialized: true })

  const eventStart = draft.event.start
  const eventEnd = draft.event.end
  const venue = draft.event.venue
  const address = draft.event.address
  const setEventStart = (start: string) => updateGroup('event', (current) => ({ ...current, start }))
  const setEventEnd = (end: string) => updateGroup('event', (current) => ({ ...current, end }))
  const setVenue = (venue: string) => updateGroup('event', (current) => ({ ...current, venue }))
  const setAddress = (address: string) => updateGroup('event', (current) => ({ ...current, address }))

  const { title: dressCodeTitle, description: dressCodeDescription, note: dressCodeNote } = draft.dressCode
  const setDressCodeTitle = (title: string) => updateGroup('dressCode', (current) => ({ ...current, title }))
  const setDressCodeDescription = (description: string) => updateGroup('dressCode', (current) => ({ ...current, description }))
  const setDressCodeNote = (note: string) => updateGroup('dressCode', (current) => ({ ...current, note }))
  const { title: rsvpTitle, description: rsvpDescription, actionLabel: rsvpActionLabel, recipientPhone: rsvpRecipientPhone } = draft.rsvp
  const setRsvpTitle = (title: string) => updateGroup('rsvp', (current) => ({ ...current, title }))
  const setRsvpDescription = (description: string) => updateGroup('rsvp', (current) => ({ ...current, description }))
  const setRsvpActionLabel = (actionLabel: string) => updateGroup('rsvp', (current) => ({ ...current, actionLabel }))
  const setRsvpRecipientPhone = (recipientPhone: string) => updateGroup('rsvp', (current) => ({ ...current, recipientPhone }))
  const { title: giftsTitle, description: giftsDescription, demoNote: giftsNote, accountValue: giftsAccount } = draft.gifts
  const setGiftsTitle = (title: string) => updateGroup('gifts', (current) => ({ ...current, title }))
  const setGiftsDescription = (description: string) => updateGroup('gifts', (current) => ({ ...current, description }))
  const setGiftsNote = (demoNote: string) => updateGroup('gifts', (current) => ({ ...current, demoNote }))
  const setGiftsAccount = (accountValue: string) => updateGroup('gifts', (current) => ({ ...current, accountValue }))
  const { eyebrow: storyEyebrow, message: storyMessage } = draft.story
  const setStoryEyebrow = (eyebrow: string) => updateGroup('story', (current) => ({ ...current, eyebrow }))
  const setStoryMessage = (message: string) => updateGroup('story', (current) => ({ ...current, message }))
  const { preludeEyebrow, preludeBody, preludeReveal, preludeQuestion, preludeActionLabel,
    preludeSoundHint, heroPhrase, heroScrollHint } = draft.opening
  const setOpening = <K extends keyof typeof draft.opening>(key: K, value: (typeof draft.opening)[K]) =>
    updateGroup('opening', (current) => ({ ...current, [key]: value }))
  const { eyebrow: closingEyebrow, title: closingTitle, sharePrompt: closingSharePrompt,
    shareActionLabel: closingShareActionLabel } = draft.closing
  const setClosing = <K extends keyof typeof draft.closing>(key: K, value: (typeof draft.closing)[K]) =>
    updateGroup('closing', (current) => ({ ...current, [key]: value }))
  const trivia = draft.trivia
  const setTrivia = (value: typeof trivia) => update('trivia', value)
  const countdownCopy = draft.countdown
  const setCountdownCopy = (updater: (current: typeof countdownCopy) => typeof countdownCopy) => updateGroup('countdown', updater)
  const eventDetailsCopy = draft.eventDetails
  const setEventDetailsCopy = (updater: (current: typeof eventDetailsCopy) => typeof eventDetailsCopy) => updateGroup('eventDetails', updater)
  const galleryCopy = draft.gallery.copy
  const galleryCaptions = draft.gallery.captions
  const setGalleryCopy = (updater: (current: typeof galleryCopy) => typeof galleryCopy) =>
    updateGroup('gallery', (current) => ({ ...current, copy: updater(current.copy) }))
  const setGalleryCaptions = (updater: (current: readonly string[]) => readonly string[]) =>
    updateGroup('gallery', (current) => ({ ...current, captions: updater(current.captions) }))

  const canonicalEventStart = initialDraft.event.start
  const canonicalEventEnd = initialDraft.event.end
  const canonicalVenue = initialDraft.event.venue
  const canonicalAddress = initialDraft.event.address
  const canonicalDressCodeTitle = initialDraft.dressCode.title
  const canonicalDressCodeDescription = initialDraft.dressCode.description
  const canonicalDressCodeNote = initialDraft.dressCode.note
  const canonicalRsvpTitle = initialDraft.rsvp.title
  const canonicalRsvpDescription = initialDraft.rsvp.description
  const canonicalRsvpActionLabel = initialDraft.rsvp.actionLabel
  const canonicalRsvpRecipientPhone = initialDraft.rsvp.recipientPhone
  const canonicalGiftsTitle = initialDraft.gifts.title
  const canonicalGiftsDescription = initialDraft.gifts.description
  const canonicalGiftsNote = initialDraft.gifts.demoNote
  const canonicalGiftsAccount = initialDraft.gifts.accountValue
  const canonicalStoryEyebrow = initialDraft.story.eyebrow
  const canonicalStoryMessage = initialDraft.story.message
  const canonicalPreludeEyebrow = initialDraft.opening.preludeEyebrow
  const canonicalPreludeBody = initialDraft.opening.preludeBody
  const canonicalPreludeReveal = initialDraft.opening.preludeReveal
  const canonicalPreludeQuestion = initialDraft.opening.preludeQuestion
  const canonicalPreludeActionLabel = initialDraft.opening.preludeActionLabel
  const canonicalPreludeSoundHint = initialDraft.opening.preludeSoundHint
  const canonicalHeroPhrase = initialDraft.opening.heroPhrase
  const canonicalHeroScrollHint = initialDraft.opening.heroScrollHint
  const canonicalClosingEyebrow = initialDraft.closing.eyebrow
  const canonicalClosingTitle = initialDraft.closing.title
  const canonicalClosingSharePrompt = initialDraft.closing.sharePrompt
  const canonicalClosingShareActionLabel = initialDraft.closing.shareActionLabel
  const canonicalTrivia = initialDraft.trivia
  const canonicalCountdown = initialDraft.countdown
  const canonicalEventDetails = initialDraft.eventDetails
  const canonicalGallery = { ...invitation.content.gallery, ...initialDraft.gallery.copy }
  const canonicalGalleryCaptions = initialDraft.gallery.captions

  const protagonistNameError = errors.protagonistName
  const shareMessageError = errors.shareMessage
  const eventStartError = errors.eventStart
  const eventEndError = errors.eventEnd
  const venueError = errors.venue
  const addressError = errors.address
  const dressCodeTitleError = errors.dressCodeTitle
  const dressCodeDescriptionError = errors.dressCodeDescription
  const dressCodeNoteError = errors.dressCodeNote
  const rsvpTitleError = errors.rsvpTitle
  const rsvpDescriptionError = errors.rsvpDescription
  const rsvpActionLabelError = errors.rsvpActionLabel
  const rsvpRecipientPhoneError = errors.rsvpRecipientPhone
  const giftsTitleError = errors.giftsTitle
  const giftsDescriptionError = errors.giftsDescription
  const giftsNoteError = errors.giftsNote
  const giftsAccountError = errors.giftsAccount
  const storyEyebrowError = errors.storyEyebrow
  const storyMessageError = errors.storyMessage
  const preludeEyebrowError = errors.preludeEyebrow
  const preludeBodyError = errors.preludeBody
  const preludeRevealError = errors.preludeReveal
  const preludeQuestionError = errors.preludeQuestion
  const preludeActionLabelError = errors.preludeActionLabel
  const preludeSoundHintError = errors.preludeSoundHint
  const heroPhraseError = errors.heroPhrase
  const heroScrollHintError = errors.heroScrollHint
  const closingEyebrowError = errors.closingEyebrow
  const closingTitleError = errors.closingTitle
  const closingSharePromptError = errors.closingSharePrompt
  const closingShareActionLabelError = errors.closingShareActionLabel
  const countdownErrors = { eyebrow: errors.countdownEyebrow, heading: errors.countdownHeading,
    completedMessage: errors.countdownCompletedMessage }
  const eventDetailsErrors = { eyebrow: errors.eventDetailsEyebrow, heading: errors.eventDetailsHeading,
    venueLabel: errors.eventDetailsVenueLabel, mapActionLabel: errors.eventDetailsMapActionLabel,
    calendarActionLabel: errors.eventDetailsCalendarActionLabel,
    calendarDescription: errors.eventDetailsCalendarDescription }
  const galleryErrors = { eyebrow: errors.galleryEyebrow, heading: errors.galleryHeading }
  const modules = draft.modules
  const validation = configurationValidation
  const resetDisabled = modules.every((module, index) => module.moduleId === initialDraft.modules[index]?.moduleId
    && module.enabled === initialDraft.modules[index]?.enabled)
  const handleModuleChange = setModuleEnabled
  const handleReset = resetConfiguration

  const issueSummary = selectStudioIssueSummary(studioValidation)
  const editorSlots = {
    'identity': <div className="limen-studio__panel-grid">          {canonicalProtagonistIdentity ? (
            <StudioContentEditor
              value={protagonistName}
              canonicalValue={canonicalProtagonistName}
              error={protagonistNameError}
              onChange={setProtagonistName}
              onReset={() => resetValue('protagonistName')}
            />
          ) : (
            <section className="limen-studio__content-editor" aria-labelledby="studio-content-title">
              <h2 id="studio-content-title">Contenido principal</h2>
              <p className="limen-studio__field-error" role="alert">
                No encontramos la identidad de la protagonista en esta invitación.
              </p>
            </section>
          )}</div>,
    'identity-projections': <section className="limen-studio__panel"><h2>Proyecciones de identidad</h2><p>Los textos públicos usan automáticamente el nombre canónico actual. No existe una copia editable adicional.</p></section>,
    'event-canonical': <div className="limen-studio__panel-grid">          <StudioEventScheduleEditor
            startValue={eventStart}
            canonicalStartValue={canonicalEventStart}
            startError={eventStartError}
            endValue={eventEnd}
            canonicalEndValue={canonicalEventEnd}
            endError={eventEndError}
            timeZone={invitation.event.timeZone}
            onStartChange={setEventStart}
            onStartReset={() => resetField('event', 'start')}
            onEndChange={setEventEnd}
            onEndReset={() => resetField('event', 'end')}
          />          <StudioEventLocationEditor
            venueValue={venue}
            canonicalVenueValue={canonicalVenue}
            venueError={venueError}
            addressValue={address}
            canonicalAddressValue={canonicalAddress}
            addressError={addressError}
            onVenueChange={setVenue}
            onVenueReset={() => resetField('event', 'venue')}
            onAddressChange={setAddress}
            onAddressReset={() => resetField('event', 'address')}
          /></div>,
    'event-operations': <div className="limen-studio__panel-grid">          <StudioGiftsEditor mode="operational"
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
            onTitleReset={() => resetField('gifts', 'title')}
            onDescriptionChange={setGiftsDescription}
            onDescriptionReset={() => resetField('gifts', 'description')}
            onNoteChange={setGiftsNote}
            onNoteReset={() => resetField('gifts', 'demoNote')}
            onAccountChange={setGiftsAccount}
            onAccountReset={() => resetField('gifts', 'accountValue')}
          />          <StudioRsvpEditor mode="operational"
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
            onTitleReset={() => resetField('rsvp', 'title')}
            onDescriptionChange={setRsvpDescription}
            onDescriptionReset={() => resetField('rsvp', 'description')}
            onActionLabelChange={setRsvpActionLabel}
            onActionLabelReset={() => resetField('rsvp', 'actionLabel')}
            onRecipientPhoneChange={setRsvpRecipientPhone}
            onRecipientPhoneReset={() => resetField('rsvp', 'recipientPhone')}
          /></div>,
    'event-copy': <div className="limen-studio__panel-grid">          <StudioEventInformationEditor mode="event-details"
            countdown={{
              eyebrow: { value: countdownCopy.eyebrow, error: countdownErrors.eyebrow,
                onChange: (eyebrow) => setCountdownCopy((current) => ({ ...current, eyebrow })) },
              heading: { value: countdownCopy.heading, error: countdownErrors.heading,
                onChange: (heading) => setCountdownCopy((current) => ({ ...current, heading })) },
              completedMessage: { value: countdownCopy.completedMessage,
                error: countdownErrors.completedMessage,
                onChange: (completedMessage) => setCountdownCopy((current) => ({ ...current, completedMessage })) },
              resetDisabled: Object.keys(canonicalCountdown).every((key) =>
                countdownCopy[key as keyof typeof countdownCopy] === canonicalCountdown[key as keyof typeof canonicalCountdown]),
              onReset: () => resetScene('countdown'),
            }}
            eventDetails={{
              eyebrow: { value: eventDetailsCopy.eyebrow, error: eventDetailsErrors.eyebrow,
                onChange: (eyebrow) => setEventDetailsCopy((current) => ({ ...current, eyebrow })) },
              heading: { value: eventDetailsCopy.heading, error: eventDetailsErrors.heading,
                onChange: (heading) => setEventDetailsCopy((current) => ({ ...current, heading })) },
              venueLabel: { value: eventDetailsCopy.venueLabel, error: eventDetailsErrors.venueLabel,
                onChange: (venueLabel) => setEventDetailsCopy((current) => ({ ...current, venueLabel })) },
              mapActionLabel: { value: eventDetailsCopy.mapActionLabel,
                error: eventDetailsErrors.mapActionLabel,
                onChange: (mapActionLabel) => setEventDetailsCopy((current) => ({ ...current, mapActionLabel })) },
              calendarActionLabel: { value: eventDetailsCopy.calendarActionLabel,
                error: eventDetailsErrors.calendarActionLabel,
                onChange: (calendarActionLabel) => setEventDetailsCopy((current) => ({ ...current, calendarActionLabel })) },
              calendarDescription: { value: eventDetailsCopy.calendarDescription,
                error: eventDetailsErrors.calendarDescription,
                onChange: (calendarDescription) => setEventDetailsCopy((current) => ({ ...current, calendarDescription })) },
              resetDisabled: eventDetailsCopy.eyebrow === canonicalEventDetails.eyebrow
                && eventDetailsCopy.heading === canonicalEventDetails.heading
                && eventDetailsCopy.venueLabel === canonicalEventDetails.venueLabel
                && eventDetailsCopy.mapActionLabel === canonicalEventDetails.mapActionLabel
                && eventDetailsCopy.calendarActionLabel === canonicalEventDetails.calendarActionLabel
                && eventDetailsCopy.calendarDescription === canonicalEventDetails.calendarDescription,
              onReset: () => resetScene('eventDetails'),
            }}
          /></div>,
    'opening': <div className="limen-studio__panel-grid">          <StudioOpeningEditor
            preludeEyebrow={{ value: preludeEyebrow, canonicalValue: canonicalPreludeEyebrow,
              error: preludeEyebrowError, onChange: (value) => setOpening('preludeEyebrow', value),
              onReset: () => resetField('opening', 'preludeEyebrow') }}
            preludeBody={{ value: preludeBody, canonicalValue: canonicalPreludeBody,
              error: preludeBodyError, onChange: (value) => setOpening('preludeBody', value),
              onReset: () => resetField('opening', 'preludeBody') }}
            preludeReveal={{ value: preludeReveal, canonicalValue: canonicalPreludeReveal,
              error: preludeRevealError, onChange: (value) => setOpening('preludeReveal', value),
              onReset: () => resetField('opening', 'preludeReveal') }}
            preludeQuestion={{ value: preludeQuestion, canonicalValue: canonicalPreludeQuestion,
              error: preludeQuestionError, onChange: (value) => setOpening('preludeQuestion', value),
              onReset: () => resetField('opening', 'preludeQuestion') }}
            preludeActionLabel={{ value: preludeActionLabel,
              canonicalValue: canonicalPreludeActionLabel, error: preludeActionLabelError,
              onChange: (value) => setOpening('preludeActionLabel', value),
              onReset: () => resetField('opening', 'preludeActionLabel') }}
            preludeSoundHint={{ value: preludeSoundHint, canonicalValue: canonicalPreludeSoundHint,
              error: preludeSoundHintError, onChange: (value) => setOpening('preludeSoundHint', value),
              onReset: () => resetField('opening', 'preludeSoundHint') }}
            heroPhrase={{ value: heroPhrase, canonicalValue: canonicalHeroPhrase,
              error: heroPhraseError, onChange: (value) => setOpening('heroPhrase', value),
              onReset: () => resetField('opening', 'heroPhrase') }}
            heroScrollHint={{ value: heroScrollHint, canonicalValue: canonicalHeroScrollHint,
              error: heroScrollHintError, onChange: (value) => setOpening('heroScrollHint', value),
              onReset: () => resetField('opening', 'heroScrollHint') }}
          /></div>,
    'story': <div className="limen-studio__panel-grid">          <StudioStoryEditor
            eyebrowValue={storyEyebrow}
            canonicalEyebrowValue={canonicalStoryEyebrow}
            eyebrowError={storyEyebrowError}
            messageValue={storyMessage}
            canonicalMessageValue={canonicalStoryMessage}
            messageError={storyMessageError}
            onEyebrowChange={setStoryEyebrow}
            onEyebrowReset={() => resetField('story', 'eyebrow')}
            onMessageChange={setStoryMessage}
            onMessageReset={() => resetField('story', 'message')}
          /></div>,
    'closing': <div className="limen-studio__panel-grid">          <StudioClosingEditor
            eyebrow={{ value: closingEyebrow, canonicalValue: canonicalClosingEyebrow,
              error: closingEyebrowError, onChange: (value) => setClosing('eyebrow', value),
              onReset: () => resetField('closing', 'eyebrow') }}
            title={{ value: closingTitle, canonicalValue: canonicalClosingTitle,
              error: closingTitleError, onChange: (value) => setClosing('title', value),
              onReset: () => resetField('closing', 'title') }}
            sharePrompt={{ value: closingSharePrompt,
              canonicalValue: canonicalClosingSharePrompt, error: closingSharePromptError,
              onChange: (value) => setClosing('sharePrompt', value),
              onReset: () => resetField('closing', 'sharePrompt') }}
            shareActionLabel={{ value: closingShareActionLabel,
              canonicalValue: canonicalClosingShareActionLabel,
              error: closingShareActionLabelError, onChange: (value) => setClosing('shareActionLabel', value),
              onReset: () => resetField('closing', 'shareActionLabel') }}
          /></div>,
    'countdown': <div className="limen-studio__panel-grid">          <StudioEventInformationEditor mode="countdown"
            countdown={{
              eyebrow: { value: countdownCopy.eyebrow, error: countdownErrors.eyebrow,
                onChange: (eyebrow) => setCountdownCopy((current) => ({ ...current, eyebrow })) },
              heading: { value: countdownCopy.heading, error: countdownErrors.heading,
                onChange: (heading) => setCountdownCopy((current) => ({ ...current, heading })) },
              completedMessage: { value: countdownCopy.completedMessage,
                error: countdownErrors.completedMessage,
                onChange: (completedMessage) => setCountdownCopy((current) => ({ ...current, completedMessage })) },
              resetDisabled: Object.keys(canonicalCountdown).every((key) =>
                countdownCopy[key as keyof typeof countdownCopy] === canonicalCountdown[key as keyof typeof canonicalCountdown]),
              onReset: () => resetScene('countdown'),
            }}
            eventDetails={{
              eyebrow: { value: eventDetailsCopy.eyebrow, error: eventDetailsErrors.eyebrow,
                onChange: (eyebrow) => setEventDetailsCopy((current) => ({ ...current, eyebrow })) },
              heading: { value: eventDetailsCopy.heading, error: eventDetailsErrors.heading,
                onChange: (heading) => setEventDetailsCopy((current) => ({ ...current, heading })) },
              venueLabel: { value: eventDetailsCopy.venueLabel, error: eventDetailsErrors.venueLabel,
                onChange: (venueLabel) => setEventDetailsCopy((current) => ({ ...current, venueLabel })) },
              mapActionLabel: { value: eventDetailsCopy.mapActionLabel,
                error: eventDetailsErrors.mapActionLabel,
                onChange: (mapActionLabel) => setEventDetailsCopy((current) => ({ ...current, mapActionLabel })) },
              calendarActionLabel: { value: eventDetailsCopy.calendarActionLabel,
                error: eventDetailsErrors.calendarActionLabel,
                onChange: (calendarActionLabel) => setEventDetailsCopy((current) => ({ ...current, calendarActionLabel })) },
              calendarDescription: { value: eventDetailsCopy.calendarDescription,
                error: eventDetailsErrors.calendarDescription,
                onChange: (calendarDescription) => setEventDetailsCopy((current) => ({ ...current, calendarDescription })) },
              resetDisabled: eventDetailsCopy.eyebrow === canonicalEventDetails.eyebrow
                && eventDetailsCopy.heading === canonicalEventDetails.heading
                && eventDetailsCopy.venueLabel === canonicalEventDetails.venueLabel
                && eventDetailsCopy.mapActionLabel === canonicalEventDetails.mapActionLabel
                && eventDetailsCopy.calendarActionLabel === canonicalEventDetails.calendarActionLabel
                && eventDetailsCopy.calendarDescription === canonicalEventDetails.calendarDescription,
              onReset: () => resetScene('eventDetails'),
            }}
          /></div>,
    'dress-code': <div className="limen-studio__panel-grid">          <StudioDressCodeEditor
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
            onTitleReset={() => resetField('dressCode', 'title')}
            onDescriptionChange={setDressCodeDescription}
            onDescriptionReset={() => resetField('dressCode', 'description')}
            onNoteChange={setDressCodeNote}
            onNoteReset={() => resetField('dressCode', 'note')}
          /></div>,
    'gallery': <div className="limen-studio__panel-grid">          <StudioGalleryEditor
            eyebrow={{ value: galleryCopy.eyebrow, error: galleryErrors.eyebrow,
              onChange: (eyebrow) => setGalleryCopy((current) => ({ ...current, eyebrow })) }}
            heading={{ value: galleryCopy.heading, error: galleryErrors.heading,
              onChange: (heading) => setGalleryCopy((current) => ({ ...current, heading })) }}
            captions={galleryCaptions}
            copyResetDisabled={galleryCopy.eyebrow === canonicalGallery.eyebrow
              && galleryCopy.heading === canonicalGallery.heading}
            captionsResetDisabled={galleryCaptions.every(
              (caption, index) => caption === canonicalGalleryCaptions[index],
            )}
            onCaptionChange={(index, caption) => setGalleryCaptions((current) => (
              current.map((value, currentIndex) => currentIndex === index ? caption : value)
            ))}
            onCopyReset={() => resetField('gallery', 'copy')}
            onCaptionsReset={() => resetField('gallery', 'captions')}
          /></div>,
    'trivia': <div className="limen-studio__panel-grid">          <StudioTriviaEditor value={trivia} canonicalValue={canonicalTrivia} onChange={setTrivia} /></div>,
    'gifts': <div className="limen-studio__panel-grid">          <StudioGiftsEditor mode="editorial"
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
            onTitleReset={() => resetField('gifts', 'title')}
            onDescriptionChange={setGiftsDescription}
            onDescriptionReset={() => resetField('gifts', 'description')}
            onNoteChange={setGiftsNote}
            onNoteReset={() => resetField('gifts', 'demoNote')}
            onAccountChange={setGiftsAccount}
            onAccountReset={() => resetField('gifts', 'accountValue')}
          /></div>,
    'rsvp': <div className="limen-studio__panel-grid">          <StudioRsvpEditor mode="editorial"
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
            onTitleReset={() => resetField('rsvp', 'title')}
            onDescriptionChange={setRsvpDescription}
            onDescriptionReset={() => resetField('rsvp', 'description')}
            onActionLabelChange={setRsvpActionLabel}
            onActionLabelReset={() => resetField('rsvp', 'actionLabel')}
            onRecipientPhoneChange={setRsvpRecipientPhone}
            onRecipientPhoneReset={() => resetField('rsvp', 'recipientPhone')}
          /></div>,
    'review-scenes': <div className="limen-studio__panel-grid">          <section className="limen-studio__panel" aria-labelledby="studio-scenes-title">
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
          </section></div>,
    'share': <div className="limen-studio__panel-grid">          <StudioShareEditor
            mode={shareMode}
            defaultMessage={defaultShareMessage}
            customMessage={customShareMessage}
            error={shareMessageError}
            resetDisabled={shareMode === 'default' && customShareMessage === defaultShareMessage}
            onModeChange={handleShareModeChange}
            onCustomMessageChange={setCustomShareMessage}
            onReset={handleShareReset}
          /></div>,
    'review-status': reviewPanels?.['review-status'] ?? <section className="limen-studio__panel"><h2>Estado general</h2><p>{studioValidation.invitationValid ? 'Invitación válida' : 'Invitación con errores'}. La revisión editorial sigue pendiente y todavía no está lista para publicar.</p></section>,
    'review-errors': reviewPanels?.['review-errors'] ?? <section className="limen-studio__panel"><h2>Errores del borrador</h2>
      <p>{issueSummary.errorCount} errores relevantes · {issueSummary.warningCount} advertencias relevantes.</p>
      <p>{issueSummary.structurallyBlocked ? 'Existe un bloqueo estructural.' : 'Sin bloqueo estructural.'}</p></section>,
    'review-checklist': <section className="limen-studio__panel"><h2>Revisión editorial</h2><p>La revisión editorial está pendiente. La checklist funcional se incorporará en una fase posterior.</p></section>,
    'review-audiences': reviewPanels?.['review-audiences'] ?? <section className="limen-studio__panel"><h2>Audiencias</h2><p>Usá el selector de audiencia de la preview actual para revisar la invitación.</p></section>,
  } satisfies StudioEditorSlots
  return resolveStudioActiveEditor(editorId, editorSlots)
}
