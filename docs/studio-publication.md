# Publicación segura desde Studio

Studio crea publicaciones únicamente desde una revisión persistida del borrador. La acción copia el
documento a `invitation_publications`; los guardados posteriores continúan modificando solamente
`invitation_drafts`.

## Contrato

- La persona administradora confirma manualmente que revisó el contenido y ambas audiencias.
- Studio bloquea la acción si hay cambios sin guardar, archivos pendientes, errores activos, un
  conflicto de revisión o si esa revisión ya fue publicada.
- `publish_invitation_draft` vuelve a comprobar en Postgres la sesión, la membresía administradora,
  la revisión esperada, el contrato estructural y que los medios privados pertenezcan al proyecto y
  estén listos.
- La función bloquea brevemente proyecto y borrador, reemplaza la publicación activa dentro de la
  misma transacción y registra `draft_revision` para conservar trazabilidad.
- Las publicaciones anteriores pasan a `superseded`; su documento no se sobrescribe.
- El navegador no posee permisos directos para insertar publicaciones ni cambiar el estado del
  proyecto. Sólo puede ejecutar la operación validada.

## Entrega pública opt-in

La ruta pública consulta una publicación activa solamente cuando el proyecto tiene `public_source =
'publication'`. Si la fuente sigue en `fixture`, Supabase no devuelve ningún documento y la ruta conserva
el registro estático actual. La selección se cambia mediante una operación administradora explícita; una
publicación nueva no modifica por sí sola el enlace público.

Los archivos publicados permanecen en el bucket privado. La audiencia puede descargar únicamente los
archivos listos que estén referenciados por la publicación activa y habilitada; el navegador los convierte
en URLs temporales locales durante esa visita.

Studio recupera el último snapshot autorizado, compara automáticamente sus campos renderizables con
el fixture público actual y muestra las secciones distintas. También ofrece una ruta privada y
autenticada para recorrer exactamente ese snapshot, incluidos los medios guardados en Storage mediante
URLs firmadas. La comparación omite únicamente metadatos internos que no participan del render
(`id` e `internalName`).

Si la publicación más reciente pertenece a una versión de esquema que el Studio actual ya no puede
interpretar, se conserva su resumen e historial sin intentar renderizarla. Esa incompatibilidad sólo
deshabilita la comparación y la vista privada del snapshot: nunca impide abrir ni editar un borrador
actual compatible.

Antes de activar una invitación real, se debe comprobar equivalencia visual y funcional entre el snapshot
publicado y su ficha estática. Maia permanece en `fixture` hasta completar esa comprobación.
