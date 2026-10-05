# Studio: primera limpieza del flujo productivo

## Alcance

Primer paso del análisis de usabilidad: quitar contenido experimental o redundante y corregir
la inconsistencia entre el panel de música y la revisión. No cambia las cinco etapas actuales
ni unifica todavía sus layouts. Tampoco modifica autenticación, permisos, base de datos,
publicaciones o la invitación pública de Maia.

## Cambios

- Plantilla presenta únicamente Origin 01, con su estado y el enlace de demostración.
  Los conceptos futuros siguen en `studioTemplateGallery.ts`, pero no aparecen en el editor.
- El antiguo laboratorio tipográfico y el tablero explicativo no se montan en el flujo productivo.
  Diseño incorpora ahora un selector compacto de combinaciones curadas; la elección se guarda
  en el documento y se refleja en la preview y en las publicaciones.
- Los textos de las etapas y la selección de colores son más directos. La tarjeta de plantilla
  reduce su preview en escritorio y el tamaño del nombre; no se rehace el diseño global.
- Música es opcional. El selector usa un botón operable con teclado, muestra el estado sin
  audio y permite quitar también una asignación residual. Conserva formatos, límite de 20 MB,
  carga privada, reproducción, cambio de archivo y restablecimiento.

## Corrección de música

Maia declara `content.music.mediaId` vacío. El inicializador anterior creaba de todos modos
una asignación al slot musical. Editor y validación comprobaban solo la existencia del slot,
mientras el panel exigía que el recurso fuera audio listo: por eso mostraban estados distintos.

El inicializador ya no crea esa asignación vacía. Panel, editor y validación comparten
`getOrigin01StudioMusic`, que reconoce únicamente un audio listo con fuente no vacía. También
tolera referencias vacías anteriores. Los errores del contrato de medios forman parte de la
validación estructural: bloquean preview y publicación hasta corregirse. Como defensa adicional,
la derivación limpia una asignación musical incompatible para que el renderer nunca reciba una
imagen, una referencia faltante o una fuente vacía como audio.

## Verificación manual del Preview

1. Abrir Maia: Plantilla no debe mostrar tarjetas «Próximamente».
2. Entrar a Diseño: debe mostrar plantilla, paleta y selector tipográfico productivo, sin el
   antiguo laboratorio ni el tablero de dirección visual.
3. Sin música, Revisión no debe exigir una indicación de sonido y el editor de apertura no
   debe mostrar ese campo.
4. En una invitación de prueba, agregar audio: debe aparecer el reproductor y el campo de
   indicación de sonido. Si está vacío, la revisión debe pedir completarlo.
5. Desactivar música: debe desaparecer esa exigencia. Guardar, recargar y comprobar que
   sigue desactivada. No cambiar ni publicar Maia para probar el audio.

No requiere migraciones ni variables nuevas. Unificar el workspace, compactar fotografías,
replantear Revisión y resolver el responsive general quedan para los siguientes pasos.

## Evidencia automatizada

- Pruebas de regresión para Maia sin audio, asignaciones vacías históricas, audio faltante,
  incompatible o no listo, bloqueo estructural, derivación segura, guardado y reapertura,
  el editor productivo de apertura y persistencia tipográfica.
- Render de componentes para verificar que los controles reales siguen presentes y que
  el laboratorio y los conceptos futuros no se montan en el flujo productivo.
- Lint, typecheck, build y control estructural de la matriz visual.

La revisión visual en navegador queda pendiente en el Preview: la descarga del navegador
local falló por `invalid peer certificate: UnknownIssuer`. El render de componentes y la
matriz estructural no sustituyen esa revisión visual ni una prueba real de Storage.
