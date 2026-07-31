export const origin01WeatherForecastDays = 16

export type Origin01WeatherLocation = {
  readonly name: string
  readonly admin1?: string
  readonly country: string
  readonly latitude: number
  readonly longitude: number
  readonly timezone: string
}

export type Origin01WeatherForecast = {
  readonly date: string
  readonly weatherCode: number
  readonly condition: string
  readonly temperatureMin: number
  readonly temperatureMax: number
  readonly apparentTemperatureMin: number
  readonly apparentTemperatureMax: number
  readonly precipitationProbability: number
  readonly windSpeedMax: number
  readonly fetchedAt: string
}

export type Origin01WeatherAvailability =
  | { readonly kind: 'available'; readonly eventDate: string }
  | { readonly kind: 'future'; readonly eventDate: string; readonly availableFrom: string }
  | { readonly kind: 'past'; readonly eventDate: string }

type ForecastApiResponse = {
  readonly daily?: {
    readonly time?: readonly string[]
    readonly weather_code?: readonly number[]
    readonly temperature_2m_min?: readonly number[]
    readonly temperature_2m_max?: readonly number[]
    readonly apparent_temperature_min?: readonly number[]
    readonly apparent_temperature_max?: readonly number[]
    readonly precipitation_probability_max?: readonly number[]
    readonly wind_speed_10m_max?: readonly number[]
  }
}

type GeocodingApiResponse = {
  readonly results?: readonly {
    readonly name?: string
    readonly admin1?: string
    readonly country?: string
    readonly latitude?: number
    readonly longitude?: number
    readonly timezone?: string
  }[]
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/

function localIsoDate(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(date)
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? ''
  return `${value('year')}-${value('month')}-${value('day')}`
}

function addUtcDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00Z`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString().slice(0, 10)
}

export function getOrigin01WeatherAvailability(
  startsAt: string,
  timeZone: string,
  now = new Date(),
): Origin01WeatherAvailability {
  const eventDate = startsAt.slice(0, 10)
  if (!isoDatePattern.test(eventDate)) throw new Error('La fecha del evento no es válida para consultar el clima.')
  const today = localIsoDate(now, timeZone)
  if (eventDate < today) return { kind: 'past', eventDate }
  const lastForecastDate = addUtcDays(today, origin01WeatherForecastDays - 1)
  if (eventDate > lastForecastDate) {
    return { kind: 'future', eventDate, availableFrom: addUtcDays(eventDate, -(origin01WeatherForecastDays - 1)) }
  }
  return { kind: 'available', eventDate }
}

export function describeOrigin01WeatherCode(code: number): string {
  if (code === 0) return 'Cielo despejado'
  if (code === 1) return 'Mayormente despejado'
  if (code === 2) return 'Parcialmente nublado'
  if (code === 3) return 'Nublado'
  if (code === 45 || code === 48) return 'Con niebla'
  if ([51, 53, 55, 56, 57].includes(code)) return 'Con llovizna'
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return 'Con lluvia'
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'Con nieve'
  if ([95, 96, 99].includes(code)) return 'Con tormentas'
  return 'Condiciones variables'
}

const finiteNumber = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`El pronóstico no incluye ${field}.`)
  return value
}

export function parseOrigin01WeatherForecast(
  response: ForecastApiResponse,
  eventDate: string,
  fetchedAt = new Date().toISOString(),
): Origin01WeatherForecast {
  const daily = response.daily
  const index = daily?.time?.indexOf(eventDate) ?? -1
  if (!daily || index < 0) throw new Error('El proveedor no devolvió el día del evento.')
  const weatherCode = finiteNumber(daily.weather_code?.[index], 'la condición meteorológica')
  return {
    date: eventDate,
    weatherCode,
    condition: describeOrigin01WeatherCode(weatherCode),
    temperatureMin: finiteNumber(daily.temperature_2m_min?.[index], 'la temperatura mínima'),
    temperatureMax: finiteNumber(daily.temperature_2m_max?.[index], 'la temperatura máxima'),
    apparentTemperatureMin: finiteNumber(daily.apparent_temperature_min?.[index], 'la sensación térmica mínima'),
    apparentTemperatureMax: finiteNumber(daily.apparent_temperature_max?.[index], 'la sensación térmica máxima'),
    precipitationProbability: finiteNumber(daily.precipitation_probability_max?.[index], 'la probabilidad de lluvia'),
    windSpeedMax: finiteNumber(daily.wind_speed_10m_max?.[index], 'el viento máximo'),
    fetchedAt,
  }
}

export async function fetchOrigin01WeatherForecast(
  startsAt: string,
  location: Origin01WeatherLocation,
  signal?: AbortSignal,
): Promise<Origin01WeatherForecast> {
  const availability = getOrigin01WeatherAvailability(startsAt, location.timezone)
  if (availability.kind !== 'available') throw new Error('El evento está fuera del horizonte del pronóstico.')
  const params = new URLSearchParams({
    latitude: String(location.latitude),
    longitude: String(location.longitude),
    daily: [
      'weather_code', 'temperature_2m_min', 'temperature_2m_max',
      'apparent_temperature_min', 'apparent_temperature_max',
      'precipitation_probability_max', 'wind_speed_10m_max',
    ].join(','),
    timezone: location.timezone,
    forecast_days: String(origin01WeatherForecastDays),
  })
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal })
  if (!response.ok) throw new Error('El proveedor meteorológico no respondió correctamente.')
  return parseOrigin01WeatherForecast(await response.json() as ForecastApiResponse, availability.eventDate)
}

export async function searchOrigin01WeatherLocations(
  query: string,
  signal?: AbortSignal,
): Promise<readonly Origin01WeatherLocation[]> {
  const normalizedQuery = query.trim()
  if (normalizedQuery.length < 3) return []
  const params = new URLSearchParams({ name: normalizedQuery, count: '6', language: 'es', format: 'json' })
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { signal })
  if (!response.ok) throw new Error('No pudimos consultar las localidades en este momento.')
  const payload = await response.json() as GeocodingApiResponse
  return (payload.results ?? []).flatMap((result) => {
    if (!result.name || !result.country || !result.timezone
      || typeof result.latitude !== 'number' || typeof result.longitude !== 'number') return []
    return [{ name: result.name, admin1: result.admin1, country: result.country,
      latitude: result.latitude, longitude: result.longitude, timezone: result.timezone }]
  })
}

export function formatOrigin01WeatherLocation(location: Origin01WeatherLocation): string {
  return [location.name, location.admin1, location.country].filter(Boolean).join(', ')
}
