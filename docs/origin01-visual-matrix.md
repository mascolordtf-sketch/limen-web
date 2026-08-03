# Fase 1.2 — Matriz visual de Origin 01

Fecha de preparación: 1 de agosto de 2026.

## Objetivo y frontera

Esta fase convierte la revisión visual de Origin 01 en un control explícito y repetible. Comprueba escenas, audiencias, variantes visuales, longitudes de contenido y viewports sin rediseñar la invitación. Los defectos perceptuales descubiertos se registran como entrada para la Fase 1.3; solo un impedimento para ejecutar la matriz puede corregirse en 1.2.

La matriz no introduce persistencia, nuevas variantes, contenido público alternativo, un editor de QA ni cambios en el renderer.

## Cobertura

La fuente tabular es [`origin01-visual-matrix.csv`](origin01-visual-matrix.csv) y contiene dos grupos:

| Grupo | Cruce | Casos |
|---|---|---:|
| Base | 14 escenas × 2 audiencias × 3 variantes × 2 viewports | 168 |
| Límites | 14 escenas × 2 perfiles de longitud × 2 viewports | 56 |
| Total | Cobertura planificada | 224 |

La cobertura base utiliza el contenido canónico. Los límites se evalúan con la audiencia protagonista y la variante canónica `origin01-wine`, porque aíslan el efecto de la longitud sin multiplicarlo por decisiones cromáticas o de entrada. Cada perfil modifica únicamente la escena indicada y sus dependencias canónicas directas:

- `short`: valores concretos, válidos y deliberadamente breves.
- `long`: valores concretos y extensos que someten la composición a presión editorial.

Los valores exactos y tipados viven en `origin01VisualMatrix.ts`; no dependen de la interpretación de quien revisa. El mismo identificador de caso siempre produce la misma invitación derivada sin mutar `origin01DemoData`.

## Viewports de referencia

| ID | Medida CSS | Propósito |
|---|---:|---|
| `mobile` | 390 × 844 | iPhone 13 en orientación vertical, dispositivo principal de validación del proyecto. |
| `desktop` | 1440 × 1000 | Escritorio amplio con scroll vertical visible. |

Ambos viewports se prueban con escala de navegador al 100 %. La revisión móvil debe repetirse en el iPhone 13 físico antes del cierre definitivo si el motor de capturas no reproduce Safari/WebKit.

## Criterios por caso

Un caso se marca `pass` solamente cuando cumple todos los puntos siguientes:

1. La escena existe, usa la variante y audiencia previstas y no presenta errores de consola o recursos.
2. No existe desborde horizontal, texto cortado, contenido superpuesto ni controles fuera del ancho útil.
3. Imágenes y fondos mantienen su encuadre; ningún recorte elimina el sujeto o la información principal.
4. La jerarquía entre título, texto, información y acción continúa siendo legible.
5. Los controles siguen visibles, comprensibles y operables; el contenido no bloquea la escena siguiente.
6. El comienzo y el final de la escena conservan continuidad visual con sus escenas vecinas.

Resultados admitidos en el CSV:

- `pass`: comprobado sin defecto perceptual.
- `issue`: comprobado y asociado a una observación accionable para 1.3.
- `blocked`: no pudo comprobarse; la observación identifica el impedimento.
- `pending`: todavía no ejecutado. No equivale a aprobado.

Cada `issue` o `blocked` debe incluir una evidencia o referencia reproducible y una observación concreta. No se corrigen jerarquía, iconos, espacios, recortes, fondos ni continuidad dentro de esta rama.

## Harness reproducible

Cada fila incluye `harness_path`. La ruta `/studio/matriz/:caseId` resuelve el caso, crea un iframe con las dimensiones CSS exactas de su viewport y carga la demo real con la audiencia, variante y perfil de contenido previstos. La demo comienza en la invitación cuando corresponde y desplaza la escena objetivo al inicio del viewport.

El parámetro interno `matriz` no modifica el fixture ni el comportamiento de la ruta pública normal. Un identificador desconocido no genera una variante implícita y el harness informa que el caso no está disponible.

## Ejecución y mantenimiento

La definición de la matriz se verifica contra `canonicalOrder` y contra el registro real de variantes:

```bash
npm run visual:matrix:check
```

Si Origin 01 incorpora o retira escenas o variantes de forma deliberada, se actualiza el generador y luego se regenera el CSV:

```bash
npm run visual:matrix:write
```

El check falla si la matriz queda desactualizada o si el CSV fue modificado estructuralmente sin actualizar su fuente reproducible. Los campos `result`, `evidence` y `observation` del CSV canónico conservan el cierre perceptual de esta fase; regenerar el archivo los devuelve a `pending` y solo corresponde al cambiar deliberadamente sus ejes.

## Cierre de la revisión perceptual

La revisión fue ejecutada externamente, caso por caso, contra el harness real desplegado. Este entorno de Codex no realizó la inspección en navegador y este registro no atribuye capturas durables ni otros artefactos no suministrados.

| Resultado | Cantidad |
|---|---:|
| Total canónico | 224 |
| Inspeccionados | 224 |
| Aprobados (`pass`) | 196 |
| Con defecto (`issue`) | 28 |
| Pendientes | 0 |
| Bloqueados | 0 |
| Defectos distintos | 6 |
| Casos afectados | 28 |

### Procedencia

- Superficie: harness real desplegado de la matriz visual.
- Deployment: <https://limen-web-six.vercel.app>.
- Viewport móvil canónico: 390 × 844.
- Viewport desktop canónico: 1440 × 1000.
- Entorno de ejecución: navegador cloud externo controlado por ChatGPT.
- Motor y versión exacta del navegador: **NOT VERIFIABLE**; no fueron suministrados en el registro de revisión.

### Hallazgos destinados a Fase 1.3

Cada ruta de reproducción se obtiene añadiendo el ID indicado a `https://limen-web-six.vercel.app/studio/matriz/`. Ningún caso aparece en más de un hallazgo.

#### VIS-1 — Truncamiento del indicador de descubrimiento en Hero móvil

- Severidad: media.
- Observado: “Deslizá para descubrir” queda recortado en el borde derecho.
- Esperado: el indicador completo permanece visible dentro del viewport.
- Casos (8): `BASE-hero-protagonist-origin01-wine-mobile`, `BASE-hero-guest-origin01-wine-mobile`, `BASE-hero-protagonist-origin01-midnight-mobile`, `BASE-hero-guest-origin01-midnight-mobile`, `BASE-hero-protagonist-origin01-garden-mobile`, `BASE-hero-guest-origin01-garden-mobile`, `BOUNDARY-hero-short-mobile`, `BOUNDARY-hero-long-mobile`.

#### VIS-2 — El control de música móvil se superpone a encabezados

- Severidad: alta.
- Observado: el control flotante se superpone o recorta encabezados cuando falta espacio horizontal.
- Esperado: el control y el encabezado editorial permanecen separados y legibles.
- Casos (10): `BASE-eventDetails-protagonist-origin01-wine-mobile`, `BASE-eventDetails-guest-origin01-wine-mobile`, `BASE-eventDetails-protagonist-origin01-midnight-mobile`, `BASE-eventDetails-guest-origin01-midnight-mobile`, `BASE-eventDetails-protagonist-origin01-garden-mobile`, `BASE-eventDetails-guest-origin01-garden-mobile`, `BOUNDARY-eventDetails-long-mobile`, `BOUNDARY-dressCode-long-mobile`, `BOUNDARY-gifts-long-mobile`, `BOUNDARY-rsvp-long-mobile`.

#### VIS-3 — Colisión del encabezado de Instagram en un caso móvil

- Severidad: media.
- Observado: el eyebrow/encabezado excede el ancho, queda truncado y es invadido visualmente por el control de música.
- Esperado: el encabezado completo permanece legible y separado del control flotante.
- Caso (1): `BASE-instagram-protagonist-origin01-wine-mobile`.

#### VIS-4 — Contraste insuficiente del CTA de Prelude en Garden móvil

- Severidad: alta.
- Observado: el control esencial “Estoy lista” resulta casi invisible sobre el fondo verde oscuro de Garden.
- Esperado: la acción principal del umbral tiene contraste visual suficiente y es inmediatamente descubrible.
- Caso (1): `BASE-prelude-protagonist-origin01-garden-mobile`.

#### VIS-5 — Identificadores de Instagram partidos dentro de palabras en desktop

- Severidad: media.
- Observado: el usuario o hashtag se parte internamente; en los casos canónicos se divide `#ValeCruzaElLimen` y el límite largo afecta usuario y hashtag.
- Esperado: los identificadores permanecen íntegros o usan un tratamiento responsive intencional que no los divida internamente.
- Casos (7): `BASE-instagram-protagonist-origin01-wine-desktop`, `BASE-instagram-guest-origin01-wine-desktop`, `BASE-instagram-protagonist-origin01-midnight-desktop`, `BASE-instagram-guest-origin01-midnight-desktop`, `BASE-instagram-protagonist-origin01-garden-desktop`, `BASE-instagram-guest-origin01-garden-desktop`, `BOUNDARY-instagram-long-desktop`.

#### VIS-6 — CTA largo de Prelude recortado en el borde inferior de desktop

- Severidad: alta.
- Destino: Fase 1.3.
- Observado: el CTA esencial queda parcialmente recortado por el borde inferior del viewport después de que la animación se estabiliza.
- Esperado: el CTA completo permanece visible y operable dentro de la composición prevista de Prelude.
- Caso (1): `BOUNDARY-prelude-long-desktop`.

La Fase 1.2 queda cerrada como revisión, pero Origin 01 **no queda visualmente aprobado** mientras estos seis defectos permanezcan sin resolver en Fase 1.3. Esta evidencia no altera la Fase 0.2: permanece **NOT VERIFIABLE**, y su resultado histórico de 224/224 corresponde solo a cobertura estructural, no a inspección perceptual.
