import type { Origin01Content, Origin01ScheduleMoment } from '../invitations/origin01/origin01ContentTypes'

export const studioScheduleMinMoments = 1
export const studioScheduleMaxMoments = 8

export type Origin01ScheduleDraft = Origin01Content['schedule']

const scheduleTimePattern = /^(?:[01]\d|2[0-3]):[0-5]\d$/

const nextMomentId = (moments: readonly Origin01ScheduleMoment[]) => {
  const ids = new Set(moments.map(({ id }) => id))
  let suffix = 1
  while (ids.has(`moment-${suffix}`)) suffix += 1
  return `moment-${suffix}`
}

const nextMomentTime = (moments: readonly Origin01ScheduleMoment[]) => {
  const previous = moments.at(-1)?.time
  if (!previous || !scheduleTimePattern.test(previous)) return '00:00'
  const [hours, minutes] = previous.split(':').map(Number)
  const total = ((hours ?? 0) * 60 + (minutes ?? 0) + 60) % (24 * 60)
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function addOrigin01ScheduleMoment(schedule: Origin01ScheduleDraft): Origin01ScheduleDraft {
  if (schedule.moments.length >= studioScheduleMaxMoments) return schedule
  return {
    ...schedule,
    moments: [...schedule.moments, {
      id: nextMomentId(schedule.moments),
      time: nextMomentTime(schedule.moments),
      title: 'Nuevo momento',
    }],
  }
}

export function updateOrigin01ScheduleMoment(
  schedule: Origin01ScheduleDraft,
  momentId: string,
  update: (moment: Origin01ScheduleMoment) => Origin01ScheduleMoment,
): Origin01ScheduleDraft {
  return {
    ...schedule,
    moments: schedule.moments.map((moment) => moment.id === momentId ? update(moment) : moment),
  }
}

export function removeOrigin01ScheduleMoment(
  schedule: Origin01ScheduleDraft,
  momentId: string,
): Origin01ScheduleDraft {
  if (schedule.moments.length <= studioScheduleMinMoments) return schedule
  return { ...schedule, moments: schedule.moments.filter(({ id }) => id !== momentId) }
}

export function moveOrigin01ScheduleMoment(
  schedule: Origin01ScheduleDraft,
  momentId: string,
  direction: -1 | 1,
): Origin01ScheduleDraft {
  const index = schedule.moments.findIndex(({ id }) => id === momentId)
  const destination = index + direction
  if (index < 0 || destination < 0 || destination >= schedule.moments.length) return schedule
  const moments = [...schedule.moments]
  const [moment] = moments.splice(index, 1)
  if (!moment) return schedule
  moments.splice(destination, 0, moment)
  return { ...schedule, moments }
}

export function validateOrigin01Schedule(schedule: Origin01ScheduleDraft): Readonly<Record<string, string | null>> {
  const momentIds = schedule.moments.map(({ id }) => id)
  const uniqueMomentIds = new Set(momentIds)
  const errors: Record<string, string | null> = {
    scheduleEyebrow: schedule.eyebrow.trim() ? null : 'Ingresá el texto introductorio del cronograma.',
    scheduleHeading: schedule.heading.trim() ? null : 'Ingresá un título para el cronograma.',
    scheduleIntroduction: schedule.introduction.trim() ? null : 'Ingresá una presentación para el cronograma.',
    scheduleMoments: schedule.moments.length < studioScheduleMinMoments
      ? 'Agregá al menos un momento.'
      : schedule.moments.length > studioScheduleMaxMoments
        ? `El cronograma admite hasta ${studioScheduleMaxMoments} momentos.`
        : null,
    scheduleMomentIds: uniqueMomentIds.size === momentIds.length
      ? null : 'Cada momento del cronograma debe tener una identidad única.',
  }

  for (const moment of schedule.moments) {
    errors[`scheduleMoment-${moment.id}-time`] = scheduleTimePattern.test(moment.time)
      ? null : 'Ingresá un horario válido.'
    errors[`scheduleMoment-${moment.id}-title`] = moment.title.trim()
      ? null : 'Ingresá un título para este momento.'
  }

  return errors
}
