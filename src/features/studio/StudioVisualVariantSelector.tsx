import {
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
  return <section className="limen-studio__visual-variants" aria-labelledby="studio-visual-variants-title">
    <header>
      <h3 id="studio-visual-variants-title">Paleta de colores</h3>
      <button type="button" className="limen-studio__reset-button"
        disabled={value === initialValue} onClick={() => onChange(initialValue)}>
        Restablecer colores
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
            <strong>{variant.name}</strong>
            <span className="limen-studio__variant-check" aria-hidden="true">{checked ? '✓' : ''}</span>
          </span>
          <span className="limen-studio__variant-swatches" aria-hidden="true">
            {variant.palette.map((color) => <i key={color.role} style={{ background: color.value }} />)}
          </span>
        </label>
      })}
    </div>
  </section>
}
