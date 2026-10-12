import './garden01VisualValidation.css'

const photoSheet = '/images/garden-01/emilia-session.webp'

const photos = [
  { alt: 'Emilia junto a una pérgola del jardín', caption: 'La espera', viewBox: '0 0 627 627' },
  { alt: 'Emilia entre flores blancas', caption: 'La alegría', viewBox: '627 0 627 627' },
  { alt: 'Emilia sentada en las escalinatas', caption: 'El camino', viewBox: '0 627 627 627' },
  { alt: 'Retrato de Emilia con flores', caption: 'Este momento', viewBox: '627 627 627 627' },
  { alt: 'Detalle del vestido de Emilia', caption: 'Lo vivido', viewBox: '70 130 455 455' },
  { alt: 'Emilia sonriendo con un ramo', caption: 'Lo que comienza', viewBox: '720 710 430 430' },
] as const

function GardenPhoto({ index, className = '' }: { index: number; className?: string }) {
  const photo = photos[index]
  return (
    <svg
      className={`garden-validation__photo ${className}`}
      viewBox={photo.viewBox}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label={photo.alt}
    >
      <image href={photoSheet} width="1254" height="1254" />
    </svg>
  )
}

function BotanicalLine({ mirrored = false }: { mirrored?: boolean }) {
  return (
    <svg className={`garden-validation__botanical ${mirrored ? 'is-mirrored' : ''}`} viewBox="0 0 110 90" aria-hidden="true">
      <path d="M8 82C31 66 46 48 57 10" />
      <path d="M31 62C19 58 13 48 13 37C26 39 34 48 31 62Z" />
      <path d="M44 45C59 42 69 32 72 19C56 20 45 30 44 45Z" />
      <path d="M53 25C42 21 38 13 39 4C50 7 56 14 53 25Z" />
      <path d="M22 71C16 68 10 68 4 70" />
    </svg>
  )
}

export function Garden01VisualValidation() {
  return (
    <main className="garden-validation">
      <link rel="stylesheet" href="/fonts/limen/fonts.css" precedence="limen-garden-fonts" />
      <div className="garden-validation__frame">
        <section className="garden-validation__hero" aria-labelledby="garden-validation-title">
          <GardenPhoto index={0} className="garden-validation__hero-photo" />
          <div className="garden-validation__hero-shade" />
          <header className="garden-validation__hero-header">
            <span>LIMEN · GARDEN 01</span>
            <span>UNA HISTORIA QUE FLORECE</span>
          </header>
          <div className="garden-validation__hero-copy">
            <p>MIS 15</p>
            <h1 id="garden-validation-title">Emilia</h1>
            <time dateTime="2027-10-17T21:30:00-03:00">17 · 10 · 2027</time>
          </div>
          <a className="garden-validation__enter" href="#garden-validation-gallery">
            <span>Deslizá para entrar</span><i aria-hidden="true">⌄</i>
          </a>
          <BotanicalLine />
        </section>

        <section className="garden-validation__gallery" id="garden-validation-gallery" aria-labelledby="garden-validation-gallery-title">
          <GardenPhoto index={1} className="garden-validation__gallery-atmosphere" />
          <div className="garden-validation__gallery-shade" />
          <div className="garden-validation__gallery-heading">
            <p>PEQUEÑAS HISTORIAS DE UNA GRAN AVENTURA</p>
            <h2 id="garden-validation-gallery-title">Momentos que florecen</h2>
            <span>Cada recuerdo fue abriendo un camino.</span>
          </div>
          <div className="garden-validation__photo-rows">
            {[0, 1, 2].map((row) => (
              <div className={`garden-validation__photo-row garden-validation__photo-row--${row + 1}`} key={row}>
                {photos.slice(row * 2, row * 2 + 2).map((photo, column) => {
                  const index = row * 2 + column
                  return (
                    <figure className={`garden-validation__polaroid garden-validation__polaroid--${index + 1}`} key={photo.caption}>
                      <span className="garden-validation__clip" aria-hidden="true" />
                      <GardenPhoto index={index} />
                      <figcaption>{photo.caption}</figcaption>
                    </figure>
                  )
                })}
              </div>
            ))}
          </div>
          <p className="garden-validation__gallery-foot">Seis instantes. Una historia que recién comienza.</p>
        </section>

        <section className="garden-validation__event-wrap" aria-labelledby="garden-validation-event-title">
          <div className="garden-validation__event-paper">
            <BotanicalLine mirrored />
            <p className="garden-validation__eyebrow">LA CELEBRACIÓN</p>
            <h2 id="garden-validation-event-title">Nos encontramos<br />en el jardín.</h2>
            <div className="garden-validation__event-facts">
              <div><span>CUÁNDO</span><strong>17 de octubre</strong><small>21:30 h</small></div>
              <div><span>DÓNDE</span><strong>Salón del Jardín</strong><small>Av. del Parque 1280</small></div>
              <div><span>DRESS CODE</span><strong>Elegante natural</strong><small>Tonos claros y tierra</small></div>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Sal%C3%B3n%20del%20Jard%C3%ADn" target="_blank" rel="noreferrer">
              Ver ubicación <span aria-hidden="true">↗</span>
            </a>
          </div>
          <p className="garden-validation__validation-note">Prototipo visual · portada, galería y evento</p>
        </section>
      </div>
    </main>
  )
}
