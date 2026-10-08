import { useEffect, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'

import { Origin01Invitation } from '../features/invitations/origin01/Origin01Invitation'
import type { Origin01InvitationData } from '../features/invitations/origin01/origin01ContentTypes'
import { maiaInvitationData } from '../features/invitations/origin01/maiaInvitationData'
import { origin01DemoData } from '../features/invitations/origin01/origin01DemoData'
import { findOrigin01TypographyCombination } from '../features/invitations/origin01/origin01Typography'
import { resolveOrigin01VisualMatrixCase } from '../features/invitations/origin01/origin01VisualMatrix'
import { loadPublicInvitationPublication } from '../features/invitations/publicInvitationPublication'

const demoInvitations = {
  [origin01DemoData.code]: origin01DemoData,
  [maiaInvitationData.code]: maiaInvitationData,
} as const

type PublicInvitationLookup =
  | { readonly code: string; readonly status: 'fixture' }
  | { readonly code: string; readonly status: 'published'; readonly invitation: Origin01InvitationData }
  | { readonly code: string; readonly status: 'unavailable' }
  | { readonly code: string; readonly status: 'error' }

export function DemoPage() {
  const { code } = useParams()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const [publicInvitationLookup, setPublicInvitationLookup] = useState<PublicInvitationLookup>()
  const publicRoute = pathname.startsWith('/invitacion/')

  const bundledInvitation = code && Object.hasOwn(demoInvitations, code)
    ? demoInvitations[code as keyof typeof demoInvitations]
    : undefined
  const currentLookup = publicRoute && publicInvitationLookup?.code === code
    ? publicInvitationLookup
    : undefined
  const invitation = !publicRoute
    ? bundledInvitation
    : currentLookup?.status === 'published'
      ? currentLookup.invitation
      : currentLookup?.status === 'fixture'
        ? bundledInvitation
        : undefined
  const matrixCase = invitation
    ? resolveOrigin01VisualMatrixCase(searchParams.get('matriz'), invitation)
    : undefined

  useEffect(() => {
    if (!publicRoute || !code) return
    let active = true
    void loadPublicInvitationPublication(code)
      .then((publication) => {
        if (!active) return
        if (!publication || publication.mode === 'fixture') {
          setPublicInvitationLookup({ code, status: 'fixture' })
        } else if (publication.mode === 'unavailable') {
          setPublicInvitationLookup({ code, status: 'unavailable' })
        } else {
          setPublicInvitationLookup({ code, status: 'published', invitation: publication.invitation })
        }
      })
      .catch(() => {
        if (active) setPublicInvitationLookup({ code, status: 'error' })
      })
    return () => {
      active = false
    }
  }, [code, publicRoute])

  useEffect(() => {
    if (!matrixCase || matrixCase.scene === 'prelude') return
    let secondFrame = 0
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        document.getElementById(matrixCase.targetId)?.scrollIntoView({ block: 'start' })
      })
    })
    return () => {
      window.cancelAnimationFrame(firstFrame)
      window.cancelAnimationFrame(secondFrame)
    }
  }, [matrixCase])

  if (invitation) {
    const renderedInvitation = matrixCase?.invitation ?? invitation
    const audience = matrixCase?.audience
      ?? (searchParams.get('vista') === 'invitado' ? 'guest' : 'protagonist')
    const typography = findOrigin01TypographyCombination(searchParams.get('tipografia'))
      ?? findOrigin01TypographyCombination(renderedInvitation.typographyId)
      ?? (invitation.code === maiaInvitationData.code
        ? findOrigin01TypographyCombination('romantica-clasica')
        : undefined)
    const startAtInvitation = matrixCase?.startAtInvitation
      ?? searchParams.get('inicio') === 'invitacion'
    return <Origin01Invitation invitation={renderedInvitation} audience={audience}
      typography={typography} startAtInvitation={startAtInvitation}
      startAtPrelude={matrixCase?.startAtPrelude} />
  }

  const publicLookupFailed = publicRoute && currentLookup?.status === 'error'
  const publicLookupPending = publicRoute && !currentLookup
  const publicInvitationUnavailable = publicRoute && currentLookup?.status === 'unavailable'

  return (
    <main className="min-h-dvh bg-stone-50 px-5 py-6 text-stone-950 antialiased">
      <section className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-md flex-col justify-center" aria-labelledby="demo-titulo">
        <div className="rounded-[2rem] bg-white p-7 shadow-sm ring-1 ring-stone-200/80">
          <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-stone-500">LIMEN</p>
          <h1 id="demo-titulo" className="text-4xl font-semibold tracking-[-0.045em] text-stone-950">
            {publicLookupFailed
              ? 'No pudimos abrir la invitación'
              : publicLookupPending
                ? 'Abriendo la invitación'
                : publicInvitationUnavailable
                  ? 'Invitación no disponible'
                  : 'Demostración no disponible'}
          </h1>
          <p className="mt-5 text-lg leading-8 text-stone-600">
            {publicLookupFailed
              ? 'Hubo un problema de conexión. Para evitar mostrar información desactualizada, intentá nuevamente.'
              : publicLookupPending
                ? 'Estamos preparando el contenido y sus archivos.'
                : publicInvitationUnavailable
                  ? 'El anfitrión desactivó temporalmente este enlace.'
                  : 'El código solicitado no corresponde a una demostración activa.'}
          </p>
          {code && !publicLookupPending ? (
            <p className="mt-6 rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-600">
              Código recibido: <span className="font-medium text-stone-900">{code}</span>
            </p>
          ) : null}
          {!publicLookupPending ? (
            publicLookupFailed ? (
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-base font-medium text-white shadow-sm shadow-stone-950/10 transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
              >
                Reintentar
              </button>
            ) : (
              <Link
                to="/"
                className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-stone-950 px-6 py-3 text-base font-medium text-white shadow-sm shadow-stone-950/10 transition hover:bg-stone-800 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-stone-950"
              >
                Volver al inicio
              </Link>
            )
          ) : null}
        </div>
      </section>
    </main>
  )
}
