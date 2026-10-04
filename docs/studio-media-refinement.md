# Studio: refinamiento de fotos y música

## Alcance

Esta etapa compacta el administrador de medios dentro del workspace unificado. No modifica el
documento de la invitación, Storage, persistencia, publicaciones, Auth, Supabase ni el renderer
público. La invitación de Maia conserva su ruta, sus archivos y sus datos.

## Decisiones de interfaz

- Fotografías y música usan superficies equivalentes, títulos breves y ayudas técnicas en una
  sola línea.
- Las cuatro escenas principales se distinguen de la galería sin sumar explicaciones repetidas.
- En escritorio, cada fotografía combina miniatura y acciones en una tarjeta horizontal. La
  grilla queda en dos columnas para evitar los cuatro paneles estrechos del diseño anterior;
  las miniaturas tienen una altura controlada para no dejar espacio vacío dentro de la tarjeta.
- Descripción accesible, foco y zoom permanecen disponibles dentro de «Detalles y encuadre».
  El panel empieza cerrado cuando la fotografía es válida y abierto si ya requiere corrección.
- Los avisos permanentes de privacidad se retiran del flujo visual; los estados de procesamiento
  y los errores continúan anunciándose de forma accesible.
- Música conserva carga, reproducción, reemplazo, desactivación y restablecimiento, con una
  disposición más corta en escritorio.
- «Restablecer fotos» sólo aparece cuando hay cambios fotográficos y no modifica el audio.

## Fuera de alcance

- cambios de comportamiento en la carga o el guardado de archivos;
- nuevos formatos o límites de peso;
- rediseño específico para celular;
- simplificación de Contenido o Revisión;
- esquema, migraciones o variables de entorno.

## Verificación manual

1. Abrir una invitación de prueba y entrar a «Fotos y música».
2. Confirmar que las escenas principales y la galería muestran dos columnas legibles en
   escritorio y que el editor central conserva su propio scroll.
3. Abrir «Detalles y encuadre» en una foto, cambiar descripción, foco y zoom, y comprobar la
   actualización de la preview.
4. Reemplazar una foto, reordenar dos imágenes de galería y restablecer los cambios.
5. Agregar, reproducir, cambiar y desactivar un audio de prueba.
6. Guardar, recargar y comprobar que los medios y ajustes persisten. No usar Maia para estas
   pruebas de edición.

No requiere migraciones ni configuración nueva.
