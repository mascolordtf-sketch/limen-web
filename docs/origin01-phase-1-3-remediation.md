# Origin 01 — Fase 1.3: remediación perceptual

## Alcance y línea de base

La implementación partió de `c9fcdadaae31219db8aac932c2c487480da4ebe7`, merge de cierre de la Fase 1.2. El objeto indicado como cierre canónico (`b4fffcc3b90a958ff78301979b0a33f33f2f6599`) no está disponible en este checkout, pero la línea de base sí contiene el registro histórico completo: 224 casos inspeccionados, 196 aprobados, 28 incidencias y los seis defectos VIS-1 a VIS-6. Esta fase no modifica esos resultados históricos ni declara aprobación visual.

## Correcciones

| Hallazgo | Causa raíz | Archivos | Corrección | Cobertura automatizada | Estado perceptual |
| --- | --- | --- | --- | --- | --- |
| VIS-1 | El indicador estaba anclado solo desde el borde derecho dentro de un Hero con recorte, sin un límite inline explícito para su caja completa. | `origin01.css`, `studioModel.test.ts` | Se delimitó con ambos márgenes inline y alineación final, conservando texto, posición y animación. | Presencia del texto y regla de contención. | Pendiente de navegador. |
| VIS-2 | El control fijo ocupaba un carril móvil que los encabezados editoriales desconocían. | `origin01.css`, `studioModel.test.ts` | Una regla responsive compartida reserva el ancho real del control y el borde en encabezados y contenedores editoriales sin quitar ni alterar el control. | Presencia y nombre accesible del control; reserva responsive compartida; ausencia de IDs del harness. | Pendiente de navegador. |
| VIS-3 | Comunidad compartía la falta de reserva del carril fijo y su encabezado podía usar todo el ancho. | `origin01.css`, `studioModel.test.ts` | La reserva sistémica se aplica también al encabezado de Comunidad en todas las audiencias y variantes. | La aserción de la reserva cubre el encabezado común usado por Instagram. | Pendiente de navegador. |
| VIS-4 | El CTA transparente dependía de un borde de acento demasiado tenue sobre el fondo Garden. | `origin01.css`, `studioModel.test.ts` | El CTA usa tokens temáticos de fondo y primer plano derivados del acento/texto, incluidos hover, active y focus-visible compartido. | Aserción del token y de su aplicación al fondo. | Pendiente de navegador. |
| VIS-5 | `overflow-wrap: anywhere` autorizaba cortes internos de usuario y hashtag. | `Origin01Community.tsx`, `origin01.css`, `studioModel.test.ts` | Se identifican semánticamente ambos valores como tokens sin cortes; el tamaño responde al contenedor y, si un valor extremo no cabe, su propia caja permite desplazamiento horizontal sin desbordar la página ni truncar el texto. | Texto íntegro, clase en ambos identificadores y reglas `nowrap`/`word-break`/overflow. | Pendiente de navegador. |
| VIS-6 | Prelude imponía `overflow: hidden` y una cadencia vertical fija, por lo que contenido válido largo podía recortar la acción. | `origin01.css`, `studioModel.test.ts` | Prelude permite desborde vertical deliberado y, en escritorio de altura acotada, compacta márgenes y escala dentro de límites legibles para conservar la composición y el CTA. | CTA presente con el perfil largo; regla de overflow y tratamiento de altura. | Pendiente de navegador. |

## Inspección perceptual pendiente

Este entorno no dispone de un navegador automatizable instalado. Deben re-inspeccionarse, con animaciones estabilizadas, los 28 casos históricos siguientes en su ruta `/studio/matriz/<ID>`:

- VIS-1: `BASE-hero-protagonist-origin01-wine-mobile`, `BASE-hero-guest-origin01-wine-mobile`, `BASE-hero-protagonist-origin01-midnight-mobile`, `BASE-hero-guest-origin01-midnight-mobile`, `BASE-hero-protagonist-origin01-garden-mobile`, `BASE-hero-guest-origin01-garden-mobile`, `BOUNDARY-hero-short-mobile`, `BOUNDARY-hero-long-mobile`.
- VIS-2: `BASE-eventDetails-protagonist-origin01-wine-mobile`, `BASE-eventDetails-guest-origin01-wine-mobile`, `BASE-eventDetails-protagonist-origin01-midnight-mobile`, `BASE-eventDetails-guest-origin01-midnight-mobile`, `BASE-eventDetails-protagonist-origin01-garden-mobile`, `BASE-eventDetails-guest-origin01-garden-mobile`, `BOUNDARY-eventDetails-long-mobile`, `BOUNDARY-dressCode-long-mobile`, `BOUNDARY-gifts-long-mobile`, `BOUNDARY-rsvp-long-mobile`.
- VIS-3: `BASE-instagram-protagonist-origin01-wine-mobile`.
- VIS-4: `BASE-prelude-protagonist-origin01-garden-mobile`.
- VIS-5: `BASE-instagram-protagonist-origin01-wine-desktop`, `BASE-instagram-guest-origin01-wine-desktop`, `BASE-instagram-protagonist-origin01-midnight-desktop`, `BASE-instagram-guest-origin01-midnight-desktop`, `BASE-instagram-protagonist-origin01-garden-desktop`, `BASE-instagram-guest-origin01-garden-desktop`, `BOUNDARY-instagram-long-desktop`.
- VIS-6: `BOUNDARY-prelude-long-desktop`.

Además deben compararse casos adyacentes canónicos y límite —móvil/escritorio, protagonista/invitado, Wine/Midnight/Garden y contenido corto/largo— para detectar regresiones de recorte, solapamiento, overflow, foco y posición posterior a animaciones. Origin 01 solo podrá declararse visualmente aprobado después de esa inspección real y sin regresiones nuevas.
