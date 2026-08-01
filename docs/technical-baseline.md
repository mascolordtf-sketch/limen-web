# Línea base técnica de LIMEN

Fecha de verificación: 1 de agosto de 2026.

## Fuente de verdad

- Rama remota verificada: `main`.
- SHA: `ed13ac7a0356ad7d9a53119ab765b6321755b478`.
- Último merge: PR #71, laboratorio de evaluación tipográfica de Origin 01.
- La auditoría técnica realizada sobre `ed13ac7…` corresponde, por lo tanto, al `main` remoto vigente en esta fecha.

La comprobación remota se realizó antes de crear una copia de trabajo limpia y aislada. Ninguna carpeta histórica o con cambios locales se utilizó como fuente de los resultados siguientes.

## Entorno reproducido

- Node.js: `v24.14.0`.
- npm: `11.9.0`.
- Instalación: `npm ci` desde el lockfile versionado.

## Controles ejecutados

| Control | Comando | Resultado |
|---|---|---|
| Estilo y reglas | `npm run lint` | Correcto |
| Tipos | `npm run typecheck` | Correcto |
| Modelo de Studio | `npm test` | 275 aserciones correctas |
| Producción | `npm run build` | Correcto |
| Higiene del diff | `git diff --check` | Correcto |

El build generado en esta línea base contiene un CSS de 181,62 kB (30,90 kB gzip) y un JavaScript principal de 882,31 kB (222,82 kB gzip).

## Advertencias no bloqueantes

1. `lottie-web` utiliza `eval` internamente y Vite/Rolldown informa el riesgo durante las compilaciones de pruebas y producción.
2. El chunk JavaScript principal supera 500 kB y activa la advertencia de code splitting.
3. npm informa que la configuración ambiental `http-proxy` será incompatible con una versión mayor futura.

Estas advertencias no impiden compilar, pero las dos primeras deben considerarse en la revisión de rendimiento y dependencias de Origin 01.

## Pendientes tipográficos confirmados

Las dos correcciones observadas antes del merge del PR #71 no están presentes en `main`:

- El nombre de portada todavía no posee el rol independiente `coverName`; el contrato vigente utiliza `protagonist` y también proyecta esa familia sobre variables más amplias.
- El laboratorio no espera efectivamente `document.fonts.ready` en runtime antes de habilitar la evaluación.

Existe una implementación local posterior al PR #71 en el commit `756ce45eb307dfabae36aad43ebd9b969f00a4cc` (`Refine typography evaluation readiness`). Se conservó como referencia en `archive/typography-readiness`, pero no se incorporó a esta línea base porque su revisión e integración pertenecen a la Fase 1.1.

## Revisión de trabajos locales

Las copias históricas con cambios sin commit examinadas corresponden a fases ya integradas en `main` o a versiones iniciales sustituidas por ajustes de revisión dentro de sus PR. No se utilizaron para construir la línea base.

La única diferencia funcional posterior a `main` identificada como relevante es la corrección tipográfica registrada arriba. Queda clasificada y preservada; no se adelantó su implementación durante la Etapa 0.

## Alcance de esta línea base

Esta verificación confirma la reproducibilidad técnica del repositorio, no la calidad visual en navegadores o dispositivos. El responsive, el movimiento, el audio, la accesibilidad perceptual, las fuentes reales y la continuidad escena por escena requieren comprobación visual y manual durante la Etapa 1.

Tampoco cambia las fronteras actuales del producto: no hay persistencia, autenticación, publicación, backend, panel del cliente ni RSVP almacenado.
