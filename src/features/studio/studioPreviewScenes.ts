import type { StudioSceneId } from './studioScenes'

export const studioPreviewSceneSelectors: Readonly<Record<StudioSceneId, string>> = {
  general: '.origin01-hero',
  cover: '.origin01-hero',
  countdown: '.origin01-countdown-panel',
  story: '.origin01-message',
  'event-details': '.origin01-info',
  schedule: '.origin01-schedule',
  weather: '.origin01-weather',
  'dress-code': '.origin01-dress',
  gallery: '.origin01-gallery',
  community: '.origin01-community',
  trivia: '.origin01-trivia',
  gifts: '.origin01-gift',
  rsvp: '.origin01-rsvp',
  closing: '.origin01-closing',
}

export const getStudioPreviewMode = (scene?: StudioSceneId) => scene ? 'contextual' : 'full'
