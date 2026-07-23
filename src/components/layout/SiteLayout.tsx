import { Outlet, Link } from 'react-router-dom'

export function SiteLayout() {
  return (
    <div className="min-h-dvh bg-stone-100 text-stone-950 antialiased">
      <div className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-5 py-5 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between py-2" aria-label="Encabezado principal">
          <Link
            to="/"
            className="rounded-xl px-1 py-2 text-lg font-semibold tracking-[0.22em] text-stone-950 transition-colors hover:text-stone-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
            aria-label="Ir al inicio de LIMEN"
          >
            LIMEN
          </Link>
          <Link
            to="/contacto"
            className="min-h-11 rounded-full bg-stone-950 px-5 py-3 text-sm font-medium text-white shadow-sm shadow-stone-950/10 transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
          >
            Contacto
          </Link>
        </header>

        <main id="contenido" className="flex flex-1 flex-col py-10 sm:py-14">
          <Outlet />
        </main>

        <footer className="border-t border-stone-200 py-6 text-sm text-stone-500">
          <p>LIMEN se encuentra en una etapa inicial de construcción.</p>
        </footer>
      </div>
    </div>
  )
}
