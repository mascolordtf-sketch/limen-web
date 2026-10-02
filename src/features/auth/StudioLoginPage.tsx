import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'

import { useStudioAuth } from './studioAuthContextValue'
import './studioAuth.css'

type LoginLocationState = { from?: string }

export function StudioLoginPage() {
  const { status, signIn } = useStudioAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const destination = (location.state as LoginLocationState | null)?.from ?? '/studio'

  useEffect(() => {
    if (status === 'authenticated') navigate(destination, { replace: true })
  }, [destination, navigate, status])

  if (status === 'authenticated') return <Navigate to={destination} replace />

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    const signInError = await signIn(email.trim(), password)
    setError(signInError)
    setSubmitting(false)
  }

  return (
    <main className="studio-auth">
      <section className="studio-auth__card" aria-labelledby="studio-login-title">
        <p className="studio-auth__eyebrow">LIMEN Studio</p>
        <h1 id="studio-login-title">Acceso interno</h1>
        <p>Ingresá con tu cuenta autorizada para crear y administrar invitaciones.</p>

        {status === 'configuration_error' ? (
          <p className="studio-auth__notice" role="alert">Supabase todavía no está configurado en este entorno.</p>
        ) : (
          <form className="studio-auth__form" onSubmit={handleSubmit}>
            <label>
              Correo electrónico
              <input autoComplete="email" inputMode="email" name="email"
                onChange={(event) => setEmail(event.target.value)} required type="email" value={email} />
            </label>
            <label>
              Contraseña
              <input autoComplete="current-password" minLength={8} name="password"
                onChange={(event) => setPassword(event.target.value)} required type="password" value={password} />
            </label>
            {error ? <p className="studio-auth__notice" role="alert">{error}</p> : null}
            <button disabled={submitting} type="submit">{submitting ? 'Ingresando…' : 'Ingresar a Studio'}</button>
          </form>
        )}
      </section>
    </main>
  )
}
