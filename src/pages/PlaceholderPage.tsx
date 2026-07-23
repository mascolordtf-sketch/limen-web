import { Link } from 'react-router-dom'

type PlaceholderPageProps = {
  title: string
  description: string
  code?: string
}

export function PlaceholderPage({ title, description, code }: PlaceholderPageProps) {
  return (
    <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center" aria-labelledby="pagina-titulo">
      <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-stone-200/80 sm:p-10">
        <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">
          LIMEN
        </p>
        <h1 id="pagina-titulo" className="text-4xl font-semibold tracking-[-0.045em] text-stone-950 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-5 text-lg leading-8 text-stone-600">{description}</p>
        {code ? (
          <p className="mt-6 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
            Código recibido: <span className="font-medium text-stone-900">{code}</span>
          </p>
        ) : null}
        <Link
          to="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-base font-medium text-white shadow-sm shadow-stone-950/10 transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
        >
          Volver al inicio
        </Link>
      </div>
    </section>
  )
}
