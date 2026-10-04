import { AppRoutes } from '../src/app/routes'
import { renderToStaticMarkup } from 'react-dom/server'
import { createElement } from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { Origin01Invitation, Origin01Schedule, Origin01WeatherPanel } from '../src/features/invitations/origin01/Origin01Invitation'
import { Origin01Community } from '../src/features/invitations/origin01/Origin01Community'
import origin01Css from '../src/features/invitations/origin01/origin01.css?raw'
import { calculateCoverNameFittedSize } from '../src/features/invitations/origin01/origin01CoverNameFit'
import { origin01DemoData } from '../src/features/invitations/origin01/origin01DemoData'
import { maiaInvitationData } from '../src/features/invitations/origin01/maiaInvitationData'
import { origin01Template } from '../src/features/invitations/origin01/origin01Template'
import { origin01ThemeVariants } from '../src/features/invitations/origin01/origin01ThemeVariants'
import { origin01VisualMatrixViewports,
  resolveOrigin01VisualMatrixCase } from '../src/features/invitations/origin01/origin01VisualMatrix'
import { findOrigin01TypographyCombination, getOrigin01TypographyStylesheets, isOrigin01TypographyCombination,
  origin01TypographyCombinations } from '../src/features/invitations/origin01/origin01Typography'
import { getOrigin01WeatherAvailability, parseOrigin01WeatherForecast } from '../src/features/invitations/origin01/origin01Weather'
import { validateInvitationConfiguration } from '../src/features/invitations/engine/invitationValidation'
import { findInvitationTemplate } from '../src/features/invitations/engine/templateRegistry'
import { StudioInvitationRoute } from '../src/features/studio/StudioInvitationRoute'
import { StudioPublicationPreviewRoute } from '../src/features/studio/StudioPublicationPreviewRoute'
import { StudioPublicationPanel } from '../src/features/studio/StudioPublicationPanel'
import { StudioVisualMatrixCase } from '../src/features/studio/StudioVisualMatrixCase'
import { StudioTypographyEvaluation,
  StudioTypographyEvaluationStatus } from '../src/features/studio/StudioTypographyEvaluation'
import { canReuseEvaluationStylesheets,
  isTypographyEvaluationBusy, waitForTypographyEvaluationFonts } from '../src/features/studio/typographyEvaluationReadiness'
import { StudioPreview } from '../src/features/studio/StudioPreview'
import { getStudioPreviewMode, studioPreviewSceneSelectors } from '../src/features/studio/studioPreviewScenes'
import { StudioPreviewPane } from '../src/features/studio/StudioPreviewPane'
import { StudioReviewStage } from '../src/features/studio/StudioReviewStage'
import { StudioNavigationShell } from '../src/features/studio/StudioNavigationShell'
import { StudioReviewPanel } from '../src/features/studio/StudioReviewPanel'
import { StudioDesignStage, StudioMediaStage, StudioStageNavigation,
  StudioUnifiedWorkspace } from '../src/features/studio/StudioWorkspaceStages'
import { createStudioReturnToReview, studioWorkspaceStages } from '../src/features/studio/studioWorkspaceStages'
import { StudioTemplateStage } from '../src/features/studio/StudioTemplateStage'
import { StudioMusicManager } from '../src/features/studio/StudioMusicManager'
import { StudioActiveEditor } from '../src/features/studio/StudioActiveEditor'
import { useOrigin01StudioModel } from '../src/features/studio/useOrigin01StudioModel'
import { StudioSectionsStage } from '../src/features/studio/StudioSectionsStage'
import { StudioScenesContent } from '../src/features/studio/StudioScenesContent'
import { findStudioSceneByEditorId, getVisibleStudioScenes, selectSceneAfterExclusion, studioGeneralScene,
  studioPublicScenes, studioScenes } from '../src/features/studio/studioScenes'
import { studioDesktopMediaQuery } from '../src/features/studio/studioViewport'
import { createStudioTemplateGalleryState, createStudioTemplateOptions,
  transitionStudioTemplateGallery } from '../src/features/studio/studioTemplateGallery'
import { StudioStoryEditor } from '../src/features/studio/StudioStoryEditor'
import studioCss from '../src/features/studio/studio.css?raw'
import { StudioContentEditor } from '../src/features/studio/StudioContentEditor'
import { StudioEventScheduleEditor } from '../src/features/studio/StudioEventScheduleEditor'
import { StudioScheduleEditor } from '../src/features/studio/StudioScheduleEditor'
import { StudioWeatherEditor } from '../src/features/studio/StudioWeatherEditor'
import { StudioCommunityEditor } from '../src/features/studio/StudioCommunityEditor'
import { validateOrigin01Community } from '../src/features/studio/studioCommunityValidation'
import { isTriviaContentValid } from '../src/features/studio/studioTriviaValidation'
import { StudioDressCodeEditor } from '../src/features/studio/StudioDressCodeEditor'
import { StudioGiftsEditor } from '../src/features/studio/StudioGiftsEditor'
import { getStudioEditorResolution, isStudioEditorId } from '../src/features/studio/studioEditorContract'
import { showsCountdownContent, showsEditorialContent, showsEventDetailsContent,
  showsOperationalContent } from '../src/features/studio/studioEditorVisibility'
import { deriveOrigin01PreviewInvitation } from '../src/features/studio/origin01StudioDerivations'
import {
  createOrigin01StudioMediaState,
  getOrigin01StudioMusic,
  origin01MediaSlots,
  validateOrigin01StudioMedia,
} from '../src/features/studio/origin01StudioMedia'
import {
  createOrigin01StudioDraft,
  createOrigin01StudioDraftFromDocument,
  getOrigin01StudioDraftSessionId,
  isOrigin01StudioDraftDirty,
  resetOrigin01StudioConfiguration,
  resetOrigin01StudioField,
  resetOrigin01StudioGroup,
  resetOrigin01StudioScene,
  updateOrigin01StudioDraftField,
  updateOrigin01StudioDraftGroup,
  updateOrigin01StudioModule,
} from '../src/features/studio/origin01StudioDraft'
import { hasUnpersistedStudioMedia, isOrigin01InvitationDocument } from '../src/features/studio/studioPersistence'
import { shouldScheduleStudioAutosave, studioAutosaveDelayMs } from '../src/features/studio/studioAutosave'
import { getStudioPublicationBlockReason } from '../src/features/studio/studioPublication'
import { compareStudioPublicationToPublicBaseline } from '../src/features/studio/studioPublicationEquivalence'
import { createStudioMediaStorageKey, serializeStudioDocument } from '../src/features/studio/studioMediaStorage'
import { resolveStudioAudioMimeType } from '../src/features/studio/studioAudioSelection'
import {
  addOrigin01ScheduleMoment,
  moveOrigin01ScheduleMoment,
  removeOrigin01ScheduleMoment,
  studioScheduleMaxMoments,
  updateOrigin01ScheduleMoment,
  validateOrigin01Schedule,
} from '../src/features/studio/origin01StudioSchedule'
import {
  findStudioMediaById,
  getStudioMediaAssignments,
  normalizeInvitationMediaReference,
  projectRenderableMedia,
  replaceStudioMediaAssignment,
  validateStudioMediaContract,
} from '../src/features/studio/studioMedia'
import {
  addStudioPhotoItem,
  assignStudioPhoto,
  moveStudioGalleryPhoto,
  removeStudioPhotoAssignment,
  updateStudioPhotoAccessibility,
  updateStudioPhotoFocalPoint,
  updateStudioPhotoZoom,
} from '../src/features/studio/origin01StudioPhotos'
import {
  createPendingStudioPhoto,
  studioPhotoMaxBytes,
  validateStudioPhotoFile,
} from '../src/features/studio/studioPhotoProcessing'
import {
  createReadyStudioAudio,
  studioAudioMaxBytes,
  validateStudioAudioFile,
} from '../src/features/studio/studioAudioSelection'
import {
  addStudioAudioItem,
  assignStudioMusic,
  removeStudioMusicAssignment,
} from '../src/features/studio/origin01StudioMusic'
import { createOrigin01StudioDomains, origin01TriviaFlow } from '../src/features/studio/origin01StudioConfiguration'
import { selectValidStudioPreview, validateOrigin01StudioDraft } from '../src/features/studio/origin01StudioValidation'
import { selectStudioIssueSummary, selectStudioItemStatus } from '../src/features/studio/studioItemStatus'
import {
  createStudioPreviewAudienceState,
  getStudioPreviewKey,
  transitionStudioPreviewAudience,
} from '../src/features/studio/studioPreviewAudience'
import { createInitialStudioNavigation, transitionStudioNavigation } from '../src/features/studio/studioNavigation'
import { focusStudioEditorHeading, focusStudioIssueDestination, focusStudioReviewHeading, isStudioPreviewCloseKey,
  restoreStudioPreviewOpener } from '../src/features/studio/studioFocus'
import { createStudioPreviewSurfaceState, isStudioPreviewEffectivelyCollapsed, selectStudioPreviewContextLabel,
  resolveStudioPreviewContextLabel,
  transitionStudioPreviewSurface } from '../src/features/studio/studioPreviewSurface'
import { commitStudioRenderablePreview, createStudioCommittedPreviewCell,
  selectStudioRenderablePreview } from '../src/features/studio/useStudioRenderablePreview'
import { createStudioIssueCorrectionContext, groupStudioIssues, resolveStudioCorrectionReturn,
  issueNeedsCorrectionReturn, resolveStudioIssueDestination, resolveStudioStructuralDestination } from '../src/features/studio/studioReviewIssues'
import { resolveStudioAvailability } from '../src/features/studio/studioAvailability'
import {
  createPublicationDocument,
  currentProjectSchemaVersion,
  isPublicationDocumentDetachedFromDraft,
  planHasCapability,
  type InvitationDraft,
  type InvitationPublication,
} from '../src/features/platform/dataModel'

let passed = 0
const assert = (condition: unknown, message: string) => {
  if (!condition) throw new Error(message)
  passed += 1
}

assert(studioDesktopMediaQuery === '(min-width: 76rem)',
  'Studio interpreta como escritorio el mismo breakpoint de 76rem usado por CSS')
assert(resolveStudioAvailability({ dev: true })
  && resolveStudioAvailability({ dev: false, explicitFlag: 'true' })
  && !resolveStudioAvailability({ dev: false })
  && !resolveStudioAvailability({ dev: false, explicitFlag: 'false' }),
  'Studio queda habilitado en desarrollo o mediante una bandera explícita, pero no en producción por defecto')

assert(studioAutosaveDelayMs === 2_000
  && shouldScheduleStudioAutosave({ dirty: true, hasTemporaryMedia: false, saveStatus: 'idle' })
  && shouldScheduleStudioAutosave({ dirty: true, hasTemporaryMedia: false, saveStatus: 'saved' }),
  'autosave espera dos segundos y sólo agenda borradores modificados que están listos para guardar')
for (const state of [
  { dirty: false, hasTemporaryMedia: false, saveStatus: 'idle' as const },
  { dirty: true, hasTemporaryMedia: true, saveStatus: 'idle' as const },
  { dirty: true, hasTemporaryMedia: false, saveStatus: 'saving' as const },
  { dirty: true, hasTemporaryMedia: false, saveStatus: 'error' as const },
  { dirty: true, hasTemporaryMedia: false, saveStatus: 'conflict' as const },
]) {
  assert(!shouldScheduleStudioAutosave(state),
    'autosave no agenda estados limpios, medios temporales, guardados activos, errores ni conflictos')
}

const publishableStudioRevision = {
  persisted: true,
  draftRevision: 3,
  dirty: false,
  hasTemporaryMedia: false,
  invitationValid: true,
  editoriallyConfirmed: true,
  saveStatus: 'saved' as const,
}
assert(getStudioPublicationBlockReason(publishableStudioRevision) === undefined,
  'una revisión guardada, válida y confirmada queda lista para crear un snapshot')
assert(getStudioPublicationBlockReason({ ...publishableStudioRevision, dirty: true })?.includes('autoguardado')
  && getStudioPublicationBlockReason({ ...publishableStudioRevision, invitationValid: false })?.includes('errores')
  && getStudioPublicationBlockReason({ ...publishableStudioRevision, editoriallyConfirmed: false })?.includes('revisión editorial')
  && getStudioPublicationBlockReason({
    ...publishableStudioRevision,
    latestPublication: { id: 'publication-1', revision: 1, draftRevision: 3, status: 'active',
      publishedAt: '2026-10-03T15:00:00Z' },
  })?.includes('ya tiene una publicación'),
  'publicar se bloquea ante cambios pendientes, errores, falta de revisión o una revisión ya publicada')

assert(currentProjectSchemaVersion === 1
  && planHasCapability('essential', 'general_public_link')
  && !planHasCapability('essential', 'native_rsvp')
  && planHasCapability('premium', 'host_dashboard')
  && !planHasCapability('premium', 'qr_access')
  && planHasCapability('premium_access', 'qr_access')
  && planHasCapability('premium_access', 'check_in'),
  'los planes conservan calidad visual y habilitan capacidades operativas acumulativas')

const publicationDocument = createPublicationDocument(maiaInvitationData)
const dataFoundationDraft: InvitationDraft<typeof maiaInvitationData> = {
  id: 'draft-maia', projectId: 'project-maia', schemaVersion: 1, revision: 1,
  document: maiaInvitationData, updatedAt: '2026-10-02T16:00:00Z', updatedBy: 'admin',
}
const dataFoundationPublication: InvitationPublication<typeof maiaInvitationData> = {
  id: 'publication-maia', projectId: 'project-maia', publicCode: maiaInvitationData.code,
  schemaVersion: 1, revision: 1, draftRevision: 1, document: publicationDocument, status: 'active',
  publishedAt: '2026-10-02T16:00:00Z', publishedBy: 'admin',
}
assert(isPublicationDocumentDetachedFromDraft(dataFoundationDraft, dataFoundationPublication)
  && dataFoundationPublication.publicCode === 'LMN-015-002'
  && dataFoundationPublication.document.content.rsvp.recipientPhone === '5491178205507',
  'una publicación usa un snapshot separado y conserva el código y contenido aprobado')

const initial = createOrigin01StudioDraft(origin01DemoData)
assert(initial.themeVariant === 'origin01-wine'
  && origin01ThemeVariants.map(({ id }) => id).join('|') === origin01Template.supportedThemeVariants.join('|'),
  'inicializa la variante canónica y mantiene una única fuente de variantes admitidas')
const ivoryVariant = origin01ThemeVariants.find(({ id }) => id === 'origin01-ivory')
assert(ivoryVariant?.name === 'Marfil dorado'
  && ivoryVariant.palette.some(({ name, value }) => name === 'Dorado antiguo' && value === '#a9792b')
  && /\.origin01--theme-origin01-ivory\s*\{[^}]*--origin-ivory:\s*#fbf6ec;[^}]*--origin-accent:\s*#a9792b;/s.test(origin01Css)
  && /\.origin01--theme-origin01-ivory \.origin01-dress\s*\{[^}]*linear-gradient\(155deg,\s*var\(--origin-photo-surface\),\s*var\(--origin-ivory\)\)/s.test(origin01Css)
  && /\.origin01--theme-origin01-ivory \.origin01-rsvp\s*\{[^}]*linear-gradient\(145deg,\s*var\(--origin-photo-surface\),\s*var\(--origin-ivory\)\)/s.test(origin01Css),
  'Marfil dorado registra su identidad y aplica tokens beige y dorados en la experiencia real')
assert(maiaInvitationData.code === 'LMN-015-002'
  && maiaInvitationData.lifecycleStatus === 'review'
  && maiaInvitationData.themeVariant === 'origin01-ivory'
  && maiaInvitationData.event.startsAt === '2026-10-17T21:30:00-03:00'
  && maiaInvitationData.event.endsAt === '2026-10-18T04:00:00-03:00'
  && maiaInvitationData.content.rsvp.recipientPhone === '5491178205507'
  && maiaInvitationData.content.rsvp.description.includes('4 de octubre')
  && validateInvitationConfiguration(maiaInvitationData, findInvitationTemplate).valid,
  'la invitación de Maia conserva fecha, cruce de medianoche, tema y RSVP definitivo')
const dynamicDateInitial = createOrigin01StudioDraft(origin01DemoData, new Date(2026, 7, 30, 23, 45))
assert(dynamicDateInitial.event.start === '2026-09-06T21:00'
  && dynamicDateInitial.event.end === '2026-09-07T02:00',
  'Studio inicializa el evento a siete días de la fecha local y conserva sus horas y cruce de medianoche')

const persistenceBaseDraft = createOrigin01StudioDraftFromDocument(origin01DemoData)
const persistenceDraft = updateOrigin01StudioDraftGroup(persistenceBaseDraft, 'share', (share) => ({
  ...share,
  mode: 'custom',
  customMessage: 'Un mensaje guardado para compartir.',
  customMessageInitialized: true,
}))
const persistenceDocument = deriveOrigin01PreviewInvitation(origin01DemoData, persistenceDraft)
const hydratedDraft = createOrigin01StudioDraftFromDocument(persistenceDocument)
assert(hydratedDraft.event.start === '2027-03-20T21:00'
  && hydratedDraft.event.end === '2027-03-21T02:00'
  && hydratedDraft.share.mode === 'custom'
  && hydratedDraft.share.customMessage === 'Un mensaje guardado para compartir.',
  'un borrador persistido conserva fechas canónicas y el mensaje personalizado al reabrirse')
const suggestedShareDraft = updateOrigin01StudioDraftGroup(persistenceBaseDraf