import { Link, useParams } from 'react-router-dom'

import './studio.css'

export function StudioUnavailablePage() {
  const { code } = useParams()

  return (
    <main className="limen-studio">
      <div className="limen-studio__workspace">
        <header className="limen-studio__header">
          <div>
            <p className="limen-studio__eyebrow">LIMEN Studio</p>
            <h1>Invitación no disponible en LIMEN Studio</h1>
          </div>
          <Link className="limen-studio__back-link" to="/">Volver al sitio</Link>
        </header>
        <section className="limen-studio__panel limen-studio__unavailable" aria-labelledby="studio-unavailable-title">
          <h2 id="studio-unavailable-title">No encontramos esta invitación</h2>
          <p>El espacio solicitado no corresponde a una invitación disponible en Studio.</p>
          {code ? <p className="limen-studio__technical">Código recibido: <strong>{code}</strong></p> : null}
          <Link className="limen-studio__primary-link" to="/studio">Volver a Studio</Link>
        </section>
      </div>
    </main>
  )
}
