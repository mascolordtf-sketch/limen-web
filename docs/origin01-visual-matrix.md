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

La cobertura base utiliza el contenido canónico. Los límites se evalúan con la audiencia protagonista y la variante canónica `origin01-wine`, porque aíslan el efecto de la longitud sin multiplicarlo por decisiones cromáticas o de entrada. Cada perfil debe modificar únicamente los campos textuales indicados en `focus`:

- `short`: el contenido válido más breve que Studio admite.
- `long`: contenido válido cercano al máximo editorial admitido por Studio.

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

- Ejes y cantidad de casos: verificados contra el código de `main` posterior al PR #73.
- Checks estructurales, lint, TypeScript, pruebas y build: deben pasar antes de publicar la rama.
- Inspección visual automatizada: bloqueada en el entorno local porque Chromium no puede iniciarse bajo las restricciones del contenedor.
- Inspección del despliegue anterior: bloqueada porque el preview de Vercel exige autenticación.
- Resultados perceptuales: pendientes; no se declara ningún caso como aprobado sin ejecutar el preview de esta rama.

La Fase 1.2 queda formalmente cerrada solo cuando la matriz se ejecuta sobre el preview, los resultados están registrados y los defectos se trasladan como inventario acotado de la Fase 1.3.
