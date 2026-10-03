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

## Alcance de esta fase

La publicación queda preparada y versionada en Supabase, pero la ruta pública todavía lee el registro
estático. En particular, `/invitacion/LMN-015-002` no cambia de fuente.

Studio recupera el último snapshot autorizado, compara automáticamente sus campos renderizables con
el fixture público actual y muestra las secciones distintas. También ofrece una ruta privada y
autenticada para recorrer exactamente ese snapshot, incluidos los medios guardados en Storage mediante
URLs firmadas. La comparación omite únicamente metadatos internos que no participan del render
(`id` e `internalName`).

La activación de lectura pública queda deliberadamente fuera de esta fase: primero se debe confirmar
equivalencia automática y visual. El paso siguiente será incorporar una selección explícita de fuente
con fallback al fixture estático, sin cambiar el código ni el enlace público de Maia.
