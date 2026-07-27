type DateTimeParts = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
}

const localValuePattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/

function getZonedParts(instant: Date, timeZone: string): DateTimeParts | null {
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
    }).formatToParts(instant)
    const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]))
    return {
      year: Number(values.year), month: Number(values.month), day: Number(values.day),
      hour: Number(values.hour), minute: Number(values.minute),
    }
  } catch {
    return null
  }
}

const pad = (value: number) => String(value).padStart(2, '0')

function partsToLocalValue(parts: DateTimeParts): string {
  return `${String(parts.year).padStart(4, '0')}-${pad(parts.month)}-${pad(parts.day)}T${pad(parts.hour)}:${pad(parts.minute)}`
}

function parseLocalValue(localValue: string): DateTimeParts | null {
  const match = localValuePattern.exec(localValue)
  if (!match) return null
  const parts: DateTimeParts = {
    year: Number(match[1]), month: Number(match[2]), day: Number(match[3]),
    hour: Number(match[4]), minute: Number(match[5]),
  }
  const check = new Date(Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute))
  return check.getUTCFullYear() === parts.year
    && check.getUTCMonth() === parts.month - 1 && check.getUTCDate() === parts.day
    && check.getUTCHours() === parts.hour && check.getUTCMinutes() === parts.minute
    ? parts : null
}

export function toDateTimeLocalValue(isoInstant: string, timeZone: string): string {
  const instant = new Date(isoInstant)
  if (Number.isNaN(instant.getTime())) return ''
  const parts = getZonedParts(instant, timeZone)
  return parts ? partsToLocalValue(parts) : ''
}

export function fromDateTimeLocalValue(localValue: string, timeZone: string): string | null {
  const desiredParts = parseLocalValue(localValue)
  if (!desiredParts) return null
  const desiredWallTime = Date.UTC(
    desiredParts.year, desiredParts.month - 1, desiredParts.day,
    desiredParts.hour, desiredParts.minute,
  )
  let instantTime = desiredWallTime

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const actualParts = getZonedParts(new Date(instantTime), timeZone)
    if (!actualParts) return null
    const actualWallTime = Date.UTC(
      actualParts.year, actualParts.month - 1, actualParts.day,
      actualParts.hour, actualParts.minute,
    )
    instantTime += desiredWallTime - actualWallTime
  }

  const instant = new Date(instantTime)
  const resolvedParts = getZonedParts(instant, timeZone)
  return resolvedParts && partsToLocalValue(resolvedParts) === localValue
    ? instant.toISOString() : null
}
