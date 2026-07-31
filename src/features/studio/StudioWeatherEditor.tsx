import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent } from 'react'

import { formatOrigin01WeatherLocation, searchOrigin01WeatherLocations } from '../invitations/origin01/origin01Weather'
import type { Origin01InvitationData } from '../invitations/origin01/origin01ContentTypes'

type WeatherContent = Origin01InvitationData['content']['weather']

const describedBy = (id: string, error: string | null) => error ? `${id}-help ${id}-error` : `${id}-help`

export function StudioWeatherEditor({ value, canonicalValue, errors, onChange, onReset }: {
  value: WeatherContent
  canonicalValue: WeatherContent
  errors: Readonly<Record<string, string | null>>
  onChange: (value: WeatherContent) => void
  onReset: () => void
}) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<readonly WeatherContent['location'][]>([])
  const [searchState, setSearchState] = useState<'idle' | 'loading' | 'empty' | 'error'>('idle')
  const controllerRef = useRef<AbortController | null>(null)

  useEffect(() => () => controllerRef.current?.abort(), [])

  const runSearch = async () => {
    const normalized = query.trim()
    if (normalized.length < 3) {
      setResults([])
      setSearchState('empty')
      return
    }
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    setSearchState('loading')
    try {
      const locations = await searchOrigin01WeatherLocations(normalized, controller.signal)
      setResults(locations)
      setSearchState(locations.length > 0 ? 'idle' : 'empty')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setResults([])
      setSearchState('error')
    }
  }

  const textField = (field: 'eyebrow' | 'heading' | 'introduction', label: string, multiline = false) => {
    const id = `studio-weather-${field}`
    const error = errors[`weather${field[0].toUpperCase()}${field.slice(1)}`]
    const common = {
      id, value: value[field], 'aria-invalid': error ? true as const : undefined,
      'aria-describedby': describedBy(id, error),
      onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
        onChange({ ...value, [field]: event.target.value }),
    }
    return <div className="limen-studio__field-group">
      <label className="limen-studio__field-label" htmlFor={id}>{label}</label>
      <p className="limen-studio__field-help" id={`${id}-help`}>Texto editorial; no modifica ningún dato meteorológico.</p>
      {multiline ? <textarea className="limen-studio__textarea" rows={3} {...common} />
        : <input className="limen-studio__text-input" type="text" {...common} />}
      {error ? <p className="limen-studio__field-error" id={`${id}-error`} role="alert">{error}</p> : null}
    </div>
  }

  const resetDisabled = JSON.stringify(value) === JSON.stringify(canonicalValue)
  const locationError = errors.weatherLocation

  return <section className="limen-studio__content-editor limen-studio__weather-editor" aria-labelledby="studio-weather-title">
    <div className="limen-studio__editor-heading">
      <div><p className="limen-studio__eyebrow">Experiencias</p><h2 id="studio-weather-title" tabIndex={-1}>Clima real</h2></div>
      <button className="limen-studio__field-reset" type="button" onClick={onReset} disabled={resetDisabled}>Restablecer Clima</button>
    </div>
    <p className="limen-studio__editor-intro">La invitación consulta Open-Meteo cuando el evento entra en el horizonte de 16 días. Temperaturas, lluvia, viento y actualización no son editables.</p>
    {textField('eyebrow', 'Texto superior')}
    {textField('heading', 'Título')}
    {textField('introduction', 'Presentación', true)}

    <div className="limen-studio__weather-location" aria-labelledby="studio-weather-location-title">
      <div><p className="limen-studio__eyebrow">Ubicación meteorológica</p>
        <h3 id="studio-weather-location-title" tabIndex={-1}>Localidad confirmada</h3></div>
      <div className="limen-studio__weather-current" aria-invalid={locationError ? true : undefined}
        aria-describedby={locationError ? 'studio-weather-location-error' : undefined}>
        <strong>{formatOrigin01WeatherLocation(value.location)}</strong>
        <span>{value.location.latitude.toFixed(4)}, {value.location.longitude.toFixed(4)} · {value.location.timezone}</span>
      </div>
      {locationError ? <p className="limen-studio__field-error" id="studio-weather-location-error" role="alert">{locationError}</p> : null}
      <div className="limen-studio__field-group">
        <label className="limen-studio__field-label" htmlFor="studio-weather-location-search">Buscar otra localidad</label>
        <p className="limen-studio__field-help" id="studio-weather-location-search-help">Buscá por ciudad o localidad. El pronóstico se resolverá por las coordenadas que confirmes.</p>
        <div className="limen-studio__weather-search-row">
          <input className="limen-studio__text-input" id="studio-weather-location-search" type="search"
            value={query} aria-describedby="studio-weather-location-search-help"
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); void runSearch() } }} />
          <button className="limen-studio__secondary-action" type="button" disabled={searchState === 'loading'}
            onClick={() => void runSearch()}>{searchState === 'loading' ? 'Buscando…' : 'Buscar'}</button>
        </div>
      </div>
      {searchState === 'empty' ? <p className="limen-studio__field-help" role="status">Ingresá al menos tres letras o probá una localidad más específica.</p> : null}
      {searchState === 'error' ? <p className="limen-studio__field-error" role="alert">No pudimos consultar las localidades. Intentá nuevamente.</p> : null}
      {results.length > 0 ? <ul className="limen-studio__weather-results" aria-label="Localidades encontradas">
        {results.map((location) => <li key={`${location.latitude}:${location.longitude}:${location.name}`}>
          <button type="button" onClick={() => {
            onChange({ ...value, location })
            setResults([])
            setQuery('')
            setSearchState('idle')
          }}><strong>{formatOrigin01WeatherLocation(location)}</strong><span>{location.timezone}</span></button>
        </li>)}
      </ul> : null}
    </div>
    <aside className="limen-studio__weather-policy"><strong>Regla de confianza LIMEN</strong>
      <p>Si todavía no existe un pronóstico o el proveedor falla, la experiencia lo informa claramente. Nunca completa el clima con valores manuales.</p></aside>
  </section>
}
