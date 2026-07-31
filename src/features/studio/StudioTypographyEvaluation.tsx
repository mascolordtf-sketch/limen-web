import { useState } from 'react'

import { Origin01TypographyAssets } from '../invitations/origin01/Origin01TypographyAssets'
import { defaultOrigin01TypographyCombination, origin01TypographyCombinations } from '../invitations/origin01/origin01Typography'
import type { Origin01TypographyCombination } from '../invitations/origin01/origin01Typography'

export function StudioTypographyEvaluation({ demoPath }: { demoPath: string }) {
  const [selected, setSelected] = useState<Origin01TypographyCombination>(defaultOrigin01TypographyCombination)
  const demoUrl = `${demoPath}?tipografia=${selected.id}&inicio=invitacion`

  return <section className="limen-studio__typography-evaluation" aria-labelledby="studio-typography-title">
    {origin01TypographyCombinations.map((combination) =>
      <Origin01TypographyAssets key={combination.id} combination={combination} />)}
    <header>
      <div><p className="limen-studio__eyebrow">Laboratorio tipográfico</p>
        <h3 id="studio-typography-title">Compará las doce voces de Origin 01</h3>
        <p>Esta selección es temporal y no modifica la invitación publicada. Cada propuesta combina una voz protagonista, una editorial y una funcional.</p></div>
      <span>Evaluación · sin persistencia</span>
    </header>
    <div className="limen-studio__typography-grid" role="radiogroup" aria-label="Combinaciones tipográficas de Origin 01">
      {origin01TypographyCombinations.map((combination) => {
        const checked = selected.id === combination.id
        return <label className={`limen-studio__typography-card${checked ? ' is-selected' : ''}`} key={combination.id}
          style={{
            '--studio-type-protagonist': `'${combination.protagonist.family}', cursive`,
            '--studio-type-editorial': `'${combination.editorial.family}', serif`,
            '--studio-type-functional': `'${combination.functional.family}', sans-serif`,
          } as React.CSSProperties}>
          <input type="radio" name="studio-typography-combination" value={combination.id} checked={checked}
            onChange={() => setSelected(combination)} />
          <span className="limen-studio__typography-card-heading"><strong>{combination.name}</strong>
            <small>{checked ? 'Seleccionada' : 'Comparar'}</small></span>
          <span className="limen-studio__typography-protagonist">Valentina</span>
          <span className="limen-studio__typography-editorial">Una noche para recordar</span>
          <span className="limen-studio__typography-functional">18 · 10 · 2026 — Palacio del Lago</span>
          <span className="limen-studio__typography-roles">
            <small>Protagonista · {combination.protagonist.family}</small>
            <small>Editorial · {combination.editorial.family}</small>
            <small>Funcional · {combination.functional.family}</small>
          </span>
        </label>
      })}
    </div>
    <footer style={{
      '--studio-type-protagonist': `'${selected.protagonist.family}', cursive`,
      '--studio-type-editorial': `'${selected.editorial.family}', serif`,
      '--studio-type-functional': `'${selected.functional.family}', sans-serif`,
    } as React.CSSProperties}>
      <div><p>Combinación activa</p><strong>{selected.name}</strong>
        <span><i>{selected.protagonist.family}</i> · {selected.editorial.family} · {selected.functional.family}</span></div>
      <a href={demoUrl} target="_blank" rel="noreferrer">Probar en la invitación completa</a>
    </footer>
    <p className="limen-studio__typography-note">Abrí la prueba en escritorio y el mismo enlace desde un celular. La URL conserva la combinación elegida, pero no guarda cambios en Studio.</p>
  </section>
}
