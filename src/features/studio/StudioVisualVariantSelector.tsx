import {
  findOrigin01ThemeVariant,
  origin01ThemeVariants,
  type Origin01ThemeVariantId,
} from '../invitations/origin01/origin01ThemeVariants'

export function StudioVisualVariantSelector({
  value,
  initialValue,
  onChange,
}: {
  value: Origin01ThemeVariantId
  initialValue: Origin01ThemeVariantId
  onChange: (value: Origin01ThemeVariantId) => void
}) {
  const selected = findOrigin01ThemeVariant(value) ?? origin01ThemeVariants[0]

  return <section className="limen-studio__visual-variants" aria-labelledby="studio-visual-variants-title">
    <header>
      <div>
        <p className="limen-studio__eyebrow">Variante visual</p>
        <h3 id="studio-visual-variants-title">Elegí la atmósfera de Origin 01</h3>
        <p>La estructura y el relato permanecen iguales. Cambia el sistema de color completo de la experiencia.</p>
      </div>
      <button type="button" className="limen-studio__reset-button"
        disabled={value === initialValue} onClick={() => onChange(initialValue)}>
        Restablecer variante
      </button>
    </header>
    <div className="limen-studio__variant-grid" role="radiogroup" aria-label="Variantes visuales de Origin 01">
      {origin01ThemeVariants.map((variant) => {
        const checked = variant.id === value
        return <label className={`limen-studio__variant-card${checked ? ' limen-studio__variant-card--selected' : ''}`}
          key={variant.id}>
          <input type="radio" name="studio-origin01-variant" value={variant.id} checked={checked}
            onChange={() => onChange(variant.id)} />
          <span className="limen-studio__variant-card-topline">
            <strong>{variant.name}</strong><span>{checked ? 'Seleccionada' : 'Elegir'}</span>
          </span>
          <span className="limen-studio__variant-swatches" aria-hidden="true">
            {variant.palette.map((color) => <i key={color.role} style={{ background: color.value }} />)}
          </span>
          <small>{variant.description}</small>
        </label>
      })}
    </div>
    <p className="limen-studio__variant-summary" aria-live="polite">
      <strong>{selected.name}</strong><span>{selected.character}</span>
    </p>
  </section>
}
