import { Link, useParams } from 'react-router-dom'

import { origin01Invitation } from '../features/invitations/data/origin01'
import { Origin01Invitation } from '../features/invitations/origin01/Origin01Invitation'

export function DemoPage() {
  const { code } = useParams()

  if (code === origin01Invitation.code) {
    return <Origin01Invitation invitation={origin01Invitation} />
  }

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950 antialiased">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col justify-center" aria-labelledby="demo-titulo">
        <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-stone-200/80">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">LIMEN</p>
          <h1 id="demo-titulo" className="text-4xl font-semibold tracking-[-0.045em] text-stone-950">
            Demostración no disponible
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            El código solicitado no corresponde a una demostración activa.
          </p>
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
    </main>
  )
}
