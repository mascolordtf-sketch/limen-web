import { Link } from 'react-router-dom'

import { useStudioAuth } from '../auth/studioAuthContextValue'
import { StudioIcon } from './StudioIcon'
import './studio.css'
import './studioHome.css'

export function StudioHomePage() {
  const { email, signOut } = useStudioAuth()

  return <div className="limen-studio limen-studio--home">
    <div className="limen-studio-home">
      <header className="limen-studio__header limen-studio-home__app-header">
        <div className="limen-studio__brand limen-studio-home__brand">
          <h1><span className="limen-studio__brand-name">LIMEN</span><span>Studio</span></h1>
        </div>
        <span className="limen-studio-home__location"><StudioIcon name="home" />Inicio</span>
        <div className="limen-studio-home__account">
          {email && <span>{email}</span>}
          <button className="limen-studio__back-link" type="button" onClick={() => void signOut()}>
            <StudioIcon name="exit" />Cerrar sesión
          </button>
        </div>
      </header>

      <main className="limen-studio-home__main">
        <p className="limen-studio__eyebrow">Espacio de trabajo</p>
        <h2>¿Qué querés hacer?</h2>
        <p className="limen-studio-home__intro">
          Creá una invitación desde cero o administrá las que ya están en marcha.
        </p>

        <div className="limen-studio-home__actions">
          <Link className="limen-studio-home__action limen-studio-home__action--primary" to="/studio/nueva">
            <span className="limen-studio-home__action-top">
              <span className="limen-studio-home__action-icon"><StudioIcon name="plus" /></span>
              <span className="limen-studio-home__action-arrow"><StudioIcon name="forward" /></span>
            </span>
            <strong>Crear invitación</strong>
            <small>Elegí una plantilla y empezá a personalizarla.</small>
          </Link>

          <Link className="limen-studio-home__action" to="/studio/invitaciones">
            <span className="limen-studio-home__action-top">
              <span className="limen-studio-home__action-icon"><StudioIcon name="invitations" /></span>
              <span className="limen-studio-home__action-arrow"><StudioIcon name="forward" /></span>
            </span>
            <strong>Gestionar invitaciones</strong>
            <small>Editá borradores y controlá las invitaciones publicadas.</small>
          </Link>
        </div>

        <p className="limen-studio-home__footnote">
          <StudioIcon name="home" />El logo de Studio siempre vuelve a este inicio.
        </p>
      </main>
    </div>
  </div>
}
