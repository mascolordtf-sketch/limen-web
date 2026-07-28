import type { Origin01TriviaEditorialDraft } from './origin01StudioDraft'

export function isTriviaContentValid(trivia: Origin01TriviaEditorialDraft): boolean {
  const presentation = [
    trivia.introEyebrow, trivia.description, trivia.primaryActionLabel,
    trivia.questionMetaLabel, trivia.nextLabel, trivia.resultLabel,
    trivia.replayLabel, trivia.scoreTotalLabel, trivia.revealTitle, trivia.revealMessage,
  ]
  return presentation.every((text) => text.trim())
    && trivia.questions.every((question) => (
      Boolean(question.prompt.trim())
      && question.options.every((option) => Boolean(option.label.trim()))
      && Boolean(question.correctFeedback.trim())
      && (question.incorrectFeedback === undefined || Boolean(question.incorrectFeedback.trim()))
      && (question.isPrediction || (
        question.correctOptionId !== undefined
        && question.options.some((option) => option.id === question.correctOptionId)
      ))
    ))
    && trivia.resultTiers.every((tier) => Boolean(tier.title.trim() && tier.message.trim()))
}
