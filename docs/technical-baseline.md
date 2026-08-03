# Línea base técnica de LIMEN

Fecha de consolidación documental: 3 de agosto de 2026.

## Fuente de verdad actual

- Commit de línea base: `f18fecf2c6afed9b27604e3a819285ef42dc0b58`.
- Último merge confirmado: PR #77, pulido de las escenas funcionales de Origin 01.
- Estado de la Fase 0.2: **NO VERIFICABLE** (`NOT VERIFIABLE`).

`NO VERIFICABLE` no significa que la línea base haya fallado. La puerta técnica completa no pudo ejecutarse de forma reproducible porque el registro de paquetes respondió `403 Forbidden` al solicitar `lottie-web`. La evidencia disponible apunta a una restricción del entorno, del proxy o del registro; no permite atribuir el incidente al proyecto, a `lottie-web` ni al lockfile.

## Evidencia confirmada de la Fase 0.2

- `HEAD` coincidió exactamente con `f18fecf2c6afed9b27604e3a819285ef42dc0b58`.
- El árbol de trabajo y el índice comenzaron y terminaron limpios.
- `package.json` y `package-lock.json` no cambiaron.
- `git diff --check` y `git diff --cached --check` finalizaron correctamente.
- La matriz visual completó correctamente `224/224` casos.
- No se hicieron cambios de código fuente, reparaciones automáticas, commits, pushes, PR ni merges.
- `npm ci` recibió `403 Forbidden` al solicitar `lottie-web`; la instalación fallida eliminó las dependencias que estaban disponibles previamente.
- Se ejecutaron `0` pruebas o aserciones.

Por tanto, esta fase **no verificó** lint, typecheck, pruebas, build, instalación reproducible, vulnerabilidades, dependencias desactualizadas, la advertencia de `lottie-web` ni el tamaño actual de los bundles. No se presenta ninguno de esos controles como aprobado o fallido para esta línea base.

## Runtimes observados

- Node 20: entorno de auditoría de la Fase 0.2.
- Node 22: runtime configurado y observado en CI.
- Node 24: entorno de una verificación histórica sobre una línea base anterior.

El proyecto todavía no impone un único runtime de Node explícito y uniforme en todos los entornos. Esta consolidación no añade ni modifica configuración de runtime.

## Workflow actual e intención de la puerta técnica

### Controles implementados actualmente en CI

El workflow de GitHub Actions usa Node 22, instala desde `package-lock.json` con `npm ci` cuando el lockfile existe y ejecuta:

1. `npm run lint`;
2. `npm run typecheck`;
3. `npm run build`.

El workflow no ejecuta `npm test` ni la matriz visual.

### Controles esperados en la puerta técnica de LIMEN

La puerta técnica prevista comprende instalación reproducible, lint, typecheck, pruebas, build, higiene del diff y la verificación visual que corresponda. Los análisis de vulnerabilidades, dependencias desactualizadas, advertencias y tamaño de bundles deben registrarse cuando puedan ejecutarse reproduciblemente; no están implementados todos como pasos del workflow actual.

### Controles no verificados por la Fase 0.2

La Fase 0.2 no pudo confirmar instalación reproducible, lint, typecheck, pruebas, build, vulnerabilidades, dependencias desactualizadas, advertencias de `lottie-web` ni bundles actuales. Sí dejó la evidencia independiente de higiene Git y el resultado visual `224/224` descritos arriba.

### Restricción ambiental

El bloqueo fue la respuesta `403 Forbidden` del registro al solicitar `lottie-web` durante `npm ci`. Al no poder reconstruir las dependencias, la auditoría no continuó con los controles que dependían de la instalación. No hay evidencia suficiente para asignar la causa a un componente del repositorio.

## Rutas públicas verificadas en el router

- `/`
- `/catalogo`
- `/disenos/:code`
- `/demo/:code`
- `/contacto`
- `/404`, destino de las direcciones no reconocidas

El router también contiene rutas internas de Studio; no forman parte de este inventario de rutas públicas.

## Evidencia histórica: línea base `ed13ac7…`

El 1 de agosto de 2026 se verificó la línea base anterior `ed13ac7a0356ad7d9a53119ab765b6321755b478`, asociada al PR #71, con Node `v24.14.0`, npm `11.9.0` y una instalación mediante `npm ci`. En ese contexto histórico se registraron lint, typecheck, `275` aserciones, build y `git diff --check` correctos. También se registraron bundles de CSS de 181,62 kB (30,90 kB gzip) y JavaScript principal de 882,31 kB (222,82 kB gzip), además de advertencias sobre `eval` en `lottie-web`, un chunk superior a 500 kB y la configuración ambiental `http-proxy`.

Estos datos pertenecen exclusivamente a `ed13ac7…`: las `275` aserciones, los resultados técnicos, las advertencias y los tamaños no son resultados de la Fase 0.2 ni de `f18fecf…` y no describen necesariamente el estado actual.

## Alcance

Esta consolidación solo corrige la documentación de la línea base. No modifica dependencias, runtime, workflow, rutas ni comportamiento de la aplicación. Tampoco cambia las fronteras del producto: no hay persistencia, autenticación, publicación, backend, panel del cliente ni RSVP almacenado.
