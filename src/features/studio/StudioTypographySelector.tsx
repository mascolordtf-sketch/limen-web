import { useState } from 'react'
import type { CSSProperties } from 'react'

import { Origin01TypographyAssets } from '../invitations/origin01/Origin01TypographyAssets'
import { defaultOrigin01TypographyCombination, findOrigin01TypographyCombination,
  origin01TypographyCombinations } from '../invitations/origin01/origin01Typography'
import type { Origin01TypographyCombination, Origin01TypographyCombinationId } from '../invitations/origin01/origin01Typography'

const recommendedTypographyIds = [
  'romantica-clasica',
  'gala-moderna',
  'garden-antigua',
  'quince-moderno',
] as const satisfies readonly Origin01TypographyCombinationId[]

const recommendedTypography = recommendedTypographyIds.map((id) =>
  findOrigin01TypographyCombination(id) ?? defaultOrigin01TypographyCombination)

const typographyStyles = (combination: Origin01TypographyCombination) => ({
  '--studio-type-protagonist': `'${combination.protagonist.family}', cursive`,
  '--studio-type-cover-name': `'${combination.coverName.family}', cursive`,
  '--studio-type-editorial': `'${combination.editorial.family}', serif`,
  '--studio-type-functional': `'${combination.functional.family}', sans-serif`,
}) as CSSProperties

export function StudioTypographySelector({ value, initialValue, protagonistName, onChange }: {
  value: Origin01TypographyCombinationId
  initialValue: Origin01TypographyCombinationId
  protagonistName: string
  onChange: (value: Origin01TypographyCombinationId) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const selected = findOrigin01TypographyCombination(value) ?? defaultOrigin01TypographyCombination
  const compactOptions = recommendedTypography.some(({ id }) => id === selected.id)
    ? recommendedTypography
    : [selected, ...recommendedTypography.filter(({ id }) => id !== selected.id)].slice(0, 4)
  const options = expanded ? origin01TypographyCombinations : compactOptions

  return <section className="limen-studio__typography-selector" aria-labelledby="studio-typography-title">
    {options.map((combination) => <Origin01TypographyAssets key={`assets-${combination.id}`} combination={combination} />)}
    <header>
      <div>
        <h3 id="studio-typography-title">Tipografía</h3>
        <p>Elegí una voz completa para el nombre, los títulos y los textos funcionales.</p>
      </div>
      <button type="button" className="limen-studio__secondary-button" aria-expanded={expanded}
        onClick={() => setExpanded((current) => !current)}>
        {expanded ? 'Ver recomendadas' : `Ver todas (${origin01TypographyCombinations.length})`}
      </button>
    </header>
    <div className="limen-studio__typography-options" role="radiogroup" aria-label="Combinaciones tipográficas">
      {options.map((combination) => {
        const checked = combination.id === selected.id
        return <label className={`limen-studio__typography-option${checked ? ' is-selected' : ''}`}
          key={combination.id} style={typographyStyles(combination)}>
          <input type="radio" name="studio-typography" value={combination.id} checked={checked}
            onChange={() => onChange(combination.id)} />
          <span className="limen-studio__typography-option-heading">
            <strong>{combination.name}</strong><small>{checked ? 'Elegida' : ''}</small>
          </span>
          <span className="limen-studio__typography-sample">
            <span className="limen-studio__typography-sample-name">{protagonistName.trim() || 'Nombre'}</span>
            <span><strong>Una noche para recordar</strong><small>17 de octubre · 21:30 h</small></span>
          </span>
          <small className="limen-studio__typography-families">
            {combination.coverName.family} · {combination.editorial.family} · {combination.functional.family}
          </small>
        </label>
      })}
    </div>
    <footer style={typographyStyles(selected)}>
      <div><strong>{selected.name}</strong><span>Aplicada a la vista previa</span></div>
      <button type="button" disabled={value === initialValue} onClick={() => onChange(initialValue)}>
        Restablecer tipografía
      </button>
    </footer>
  </section>
}
