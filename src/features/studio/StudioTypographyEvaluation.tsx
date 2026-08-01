import { useEffect, useRef, useState } from 'react'

import { defaultOrigin01TypographyCombination, getOrigin01TypographyStylesheets,
  origin01TypographyCombinations } from '../invitations/origin01/origin01Typography'
import type { Origin01TypographyCombination } from '../invitations/origin01/origin01Typography'
import { canReuseEvaluationStylesheets, isTypographyEvaluationBusy } from './typographyEvaluationReadiness'
import type { TypographyReadiness } from './typographyEvaluationReadiness'

const evaluationStylesheets = [...new Set(origin01TypographyCombinations.flatMap(
  getOrigin01TypographyStylesheets))]
const evaluationFamilies = [...new Set(origin01TypographyCombinations.flatMap(
  ({ coverName, editorial, functional }) => [coverName.family, editorial.family, functional.family]))]
const evaluationStylesheetSelector = 'link[rel="stylesheet"][data-limen-font-owner="typography-evaluation"]'

function getEvaluationStylesheets() {
  return [...document.querySelectorAll<HTMLLinkElement>(evaluationStylesheetSelector)]
}

function invalidateEvaluationStylesheets() {
  getEvaluationStylesheets().forEach((stylesheet) => stylesheet.remove())
}

function loadEvaluationStylesheet(href: string) {
  const absoluteHref = new URL(href, document.baseURI).href
  const link = getEvaluationStylesheets()
    .find((candidate) => candidate.href === absoluteHref)

  if (link?.dataset.limenFontState === 'verified') return Promise.resolve()

  if (!link) {
    return new Promise<void>((resolve, reject) => {
      const stylesheet = document.createElement('link')
      stylesheet.rel = 'stylesheet'
      stylesheet.dataset.limenFontOwner = 'typography-evaluation'
      stylesheet.dataset.limenFontState = 'loading'
      stylesheet.addEventListener('load', () => {
        stylesheet.dataset.limenFontState = 'loaded'
        resolve()
      }, { once: true })
      stylesheet.addEventListener('error', () => {
        stylesheet.dataset.limenFontState = 'error'
        reject(new Error(`No se pudo cargar ${href}`))
      }, { once: true })
      stylesheet.href = absoluteHref
      document.head.append(stylesheet)
    })
  }

  const stylesheet = link
  if (stylesheet.sheet && stylesheet.dataset.limenFontState === 'loaded') return Promise.resolve()

  return new Promise<void>((resolve, reject) => {
    stylesheet.addEventListener('load', () => {
      stylesheet.dataset.limenFontState = 'loaded'
      resolve()
    }, { once: true })
    stylesheet.addEventListener('error', () => {
      stylesheet.dataset.limenFontState = 'error'
      reject(new Error(`No se pudo cargar ${href}`))
    }, { once: true })
  })
}

export function StudioTypographyEvaluationStatus({ readiness, onRetry }: {
  readiness: TypographyReadiness
  onRetry: () => void
}) {
  if (readiness === 'loading') {
    return <p className="limen-studio__typography-status" role="status">
      Cargando las tipografías reales para comparar…
    </p>
  }

  if (readiness === 'error') {
    return <div className="limen-studio__typography-status" role="alert">
      <p>No pudimos cargar todas las tipografías. La evaluación permanece bloqueada para no mostrar fuentes de reemplazo.</p>
      <button type="button" onClick={onRetry}>Reintentar carga</button>
    </div>
  }

  return null
}

export function StudioTypographyEvaluation({ demoPath }: { demoPath: string }) {
  const [selected, setSelected] = useState<Origin01TypographyCombination>(defaultOrigin01TypographyCombination)
  const [readiness, setReadiness] = useState<TypographyReadiness>('loading')
  const [loadAttempt, setLoadAttempt] = useState(0)
  const currentAttempt = useRef(0)
  const demoUrl = `${demoPath}?tipografia=${selected.id}&inicio=invitacion`
  const ready = readiness === 'ready'

  useEffect(() => {
    const attempt = currentAttempt.current + 1
    currentAttempt.current = attempt
    let active = true

    async function prepareEvaluation() {
      try {
        const existingStylesheets = getEvaluationStylesheets()
        if (loadAttempt > 0
          || !canReuseEvaluationStylesheets(existingStylesheets, evaluationStylesheets.length)) {
          invalidateEvaluationStylesheets()
        }
        await Promise.all(evaluationStylesheets.map(loadEvaluationStylesheet))
        if (!document.fonts) {
          if (!active || currentAttempt.current !== attempt) return
          getEvaluationStylesheets().forEach((stylesheet) => {
            stylesheet.dataset.limenFontState = 'verified'
          })
          setReadiness('ready')
          return
        }

        const loadedFaces = await Promise.all(evaluationFamilies.map((family) =>
          document.fonts.load(`1em "${family.replaceAll('"', '\\"')}"`)))
        if (loadedFaces.some((faces) => faces.length === 0)) {
          throw new Error('Una o más familias no quedaron disponibles')
        }
        await document.fonts.ready
        if (!active || currentAttempt.current !== attempt) return
        getEvaluationStylesheets().forEach((stylesheet) => {
          stylesheet.dataset.limenFontState = 'verified'
        })
        setReadiness('ready')
      } catch {
        if (active && currentAttempt.current === attempt) setReadiness('error')
      }
    }

    void prepareEvaluation()
    return () => { active = false }
  }, [loadAttempt])

  return <section className={`limen-studio__typography-evaluation is-${readiness}`}
    aria-labelledby="studio-typography-title" aria-busy={isTypographyEvaluationBusy(readiness)}>
    <header>
      <div><p className="limen-studio__eyebrow">Laboratorio tipográfico</p>
        <h3 id="studio-typography-title">Compará las doce voces de Origin 01</h3>
        <p>Esta selección es temporal y no modifica la invitación publicada. Cada propuesta combina una tipografía para el nombre de portada, una editorial y una funcional.</p></div>
      <span>Evaluación · sin persistencia</span>
    </header>
    <StudioTypographyEvaluationStatus readiness={readiness} onRetry={() => {
      setReadiness('loading')
      setLoadAttempt((attempt) => attempt + 1)
    }} />
    <div className="limen-studio__typography-grid" role="radiogroup"
      aria-label="Combinaciones tipográficas de Origin 01" aria-hidden={!ready}>
      {origin01TypographyCombinations.map((combination) => {
        const checked = selected.id === combination.id
        return <label className={`limen-studio__typography-card${checked ? ' is-selected' : ''}`} key={combination.id}
          style={{
            '--studio-type-cover-name': `'${combination.coverName.family}', cursive`,
            '--studio-type-editorial': `'${combination.editorial.family}', serif`,
            '--studio-type-functional': `'${combination.functional.family}', sans-serif`,
          } as React.CSSProperties}>
          <input type="radio" name="studio-typography-combination" value={combination.id} checked={checked}
            disabled={!ready} onChange={() => setSelected(combination)} />
          <span className="limen-studio__typography-card-heading"><strong>{combination.name}</strong>
            <small>{checked ? 'Seleccionada' : 'Comparar'}</small></span>
          <span className="limen-studio__typography-protagonist">Valentina</span>
          <span className="limen-studio__typography-editorial">Una noche para recordar</span>
          <span className="limen-studio__typography-functional">18 · 10 · 2026 — Palacio del Lago</span>
          <span className="limen-studio__typography-roles">
            <small>Nombre de portada · {combination.coverName.family}</small>
            <small>Editorial · {combination.editorial.family}</small>
            <small>Funcional · {combination.functional.family}</small>
          </span>
        </label>
      })}
    </div>
    <footer style={{
      '--studio-type-cover-name': `'${selected.coverName.family}', cursive`,
      '--studio-type-editorial': `'${selected.editorial.family}', serif`,
      '--studio-type-functional': `'${selected.functional.family}', sans-serif`,
    } as React.CSSProperties}>
      <div><p>Combinación activa</p><strong>{selected.name}</strong>
        <span><i>{selected.coverName.family}</i> · {selected.editorial.family} · {selected.functional.family}</span></div>
      <a href={demoUrl} target="_blank" rel="noreferrer" aria-disabled={!ready} tabIndex={ready ? 0 : -1}
        onClick={(event) => { if (!ready) event.preventDefault() }}>Probar en la invitación completa</a>
    </footer>
    <p className="limen-studio__typography-note">Abrí la prueba en escritorio y el mismo enlace desde un celular. La URL conserva la combinación elegida, pero no guarda cambios en Studio.</p>
  </section>
}
