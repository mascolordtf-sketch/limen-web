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

El check falla si la matriz queda desactualizada o si el CSV fue modificado estructuralmente sin actualizar su fuente reproducible. Los campos de resultado se completan en una copia de ejecución o en el informe de hallazgos; el CSV canónico conserva `pending` para poder reutilizarse en cada regresión.

## Estado de ejecución inicial

- Ejes y cantidad de casos: verificados contra el código de `main` posterior al PR #74.
- Checks estructurales, lint, TypeScript, pruebas y build: deben pasar antes de publicar la rama.
- Harness reproducible: cada una de las 224 filas posee una ruta que fija estado y viewport.
- Perfiles límite: versionados mediante valores exactos y deterministas para las catorce escenas.
- Inspección visual automatizada: puede continuar dependiendo del navegador disponible; la ausencia de Chromium local no impide reconstruir manualmente un caso en preview.
- Resultados perceptuales: se registran fuera del CSV canónico reutilizable; un caso nunca se considera aprobado solo por existir en la matriz.

La Fase 1.2 queda formalmente cerrada solo cuando la matriz se ejecuta sobre el preview, los resultados están registrados y los defectos se trasladan como inventario acotado de la Fase 1.3.
