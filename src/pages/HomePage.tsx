import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <section className="grid flex-1 items-center gap-12 lg:grid-cols-[1fr_0.86fr] lg:gap-16" aria-labelledby="inicio-titulo">
      <div className="max-w-2xl">
        <p className="mb-5 text-sm font-medium uppercase tracking-[0.22em] text-stone-500">
          Invitaciones digitales
        </p>
        <h1 id="inicio-titulo" className="text-5xl font-semibold tracking-[-0.055em] text-balance text-stone-950 sm:text-6xl lg:text-7xl">
          Algo nuevo está por comenzar.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-8 text-stone-600 sm:text-xl sm:leading-9">
          LIMEN está siendo creado como un servicio curado de invitaciones digitales, preparado con cuidado y atención directa para cada solicitud.
        </p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            to="/catalogo"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-base font-medium text-white shadow-sm shadow-stone-950/10 transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
          >
            Ver estructura inicial
          </Link>
          <Link
            to="/contacto"
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 py-3 text-base font-medium text-stone-800 shadow-sm ring-1 ring-stone-200 transition hover:bg-stone-50 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
          >
            Ir a contacto
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] bg-white p-4 shadow-sm ring-1 ring-stone-200/80 sm:p-5" aria-label="Representación temporal de la futura colección de invitaciones">
        <div className="rounded-[1.5rem] bg-stone-50 p-4">
          <div className="space-y-3">
            <div className="h-40 rounded-[1.35rem] bg-stone-200/70" />
            <div className="grid grid-cols-2 gap-3">
              <div className="h-28 rounded-[1.25rem] bg-stone-200/60" />
              <div className="h-28 rounded-[1.25rem] bg-stone-300/50" />
            </div>
            <div className="rounded-[1.25rem] bg-white p-4 shadow-xs ring-1 ring-stone-200/80">
              <div className="h-3 w-24 rounded-full bg-stone-300" />
              <div className="mt-3 h-3 w-40 rounded-full bg-stone-200" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
