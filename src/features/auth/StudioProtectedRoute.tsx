import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { useStudioAuth } from './studioAuthContextValue'
import './studioAuth.css'

export function StudioProtectedRoute() {
  const location = useLocation()
  const { email, status, signOut } = useStudioAuth()

  if (status === 'loading') {
    return <StudioAuthMessage title="Verificando acceso…" detail="Estamos validando tu sesión de LIMEN Studio." />
  }

  if (status === 'configuration_error') {
    return <StudioAuthMessage
      title="Falta configurar Supabase"
      detail="Agregá la URL y la clave pública del proyecto para habilitar el acceso seguro a Studio."
    />
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/studio/acceso" replace state={{ from: location.pathname }} />
  }

  if (status === 'unauthorized') {
    return <StudioAuthMessage
      title="Tu usuario no tiene acceso a Studio"
      detail={email ? `La cuenta ${email} inició sesión, pero todavía no fue habilitada como miembro de LIMEN.` : undefined}
      action={<button type="button" onClick={() => void signOut()}>Cerrar sesión</button>}
    />
  }

  return <Outlet />
}

function StudioAuthMessage({ title, detail, action }: { title: string; detail?: string; action?: ReactNode }) {
  return (
    <main className="studio-auth">
      <section className="studio-auth__card" aria-live="polite">
        <p className="studio-auth__eyebrow">LIMEN Studio</p>
        <h1>{title}</h1>
        {detail ? <p>{detail}</p> : null}
        {action}
      </section>
    </main>
  )
}
