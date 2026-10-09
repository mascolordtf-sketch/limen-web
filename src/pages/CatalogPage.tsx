import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'

const gardenPreviewStyle = {
  backgroundImage: 'url("/images/garden-01/emilia-session.webp")',
  backgroundPosition: '0 0',
  backgroundSize: '200% 200%',
} satisfies CSSProperties

const designs = [
  {
    code: 'LMN-015-001',
    name: 'Origin 01',
    description: 'Una experiencia elegante, narrativa y emocional.',
    mood: 'Editorial · Nocturna',
    image: '/images/origin-01/hero-valentina.webp',
  },
  {
    code: 'LMN-GDN-001',
    name: 'Garden 01',
    description: 'Un recorrido luminoso donde los recuerdos florecen.',
    mood: 'Natural · Luminosa',
    previewStyle: gardenPreviewStyle,
  },
] as const

export function CatalogPage() {
  return (
    <section aria-labelledby="catalogo-titulo">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-stone-500">Colección LIMEN</p>
        <h1 id="catalogo-titulo" className="mt-4 text-5xl font-semibold tracking-[-0.055em] text-stone-950 sm:text-6xl">
          Elegí una atmósfera.
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">
          Cada diseño tiene una composición y un ritmo propios. Abrí las demostraciones para conocerlas en contexto.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {designs.map((design) => (
          <article key={design.code} className="overflow-hidden rounded-[2rem] bg-white shadow-sm ring-1 ring-stone-200/80">
            {'image' in design ? (
              <img className="aspect-[4/3] w-full object-cover" src={design.image} alt="" />
            ) : (
              <div className="aspect-[4/3] w-full bg-stone-200 bg-no-repeat" style={design.previewStyle}
                role="img" aria-label="Vista previa de Garden 01" />
            )}
            <div className="p-6 sm:p-7">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{design.mood}</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-stone-950">{design.name}</h2>
              <p className="mt-3 leading-7 text-stone-600">{design.description}</p>
              <Link to={`/demo/${design.code}`}
                className="mt-6 inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950">
                Ver demostración <span className="ml-2" aria-hidden="true">↗</span>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
