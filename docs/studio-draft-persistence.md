# Persistencia de borradores en Studio

Studio recupera el proyecto asociado al código público cuando se abre una invitación. Si existe un
borrador compatible, lo hidrata como documento Origin 01 completo; si no existe, parte del registro
local y crea el proyecto con el primer guardado.

## Comportamiento

- El guardado es manual y requiere una sesión con membresía activa.
- El primer guardado crea `invitation_projects` e `invitation_drafts`.
- Cada guardado posterior exige la revisión leída y la incrementa. Si otra sesión ya la cambió, Studio
  rechaza la escritura y pide recargar en lugar de sobrescribir datos silenciosamente.
- El documento persistido usa `schema_version = 1` y conserva la invitación completa, no solamente el
  estado visual del formulario.
- Al salir con cambios sin guardar, el navegador muestra su advertencia estándar.

## Límites deliberados

- Las imágenes o audios cargados durante la sesión usan URLs temporales y bloquean el guardado hasta
  implementar Supabase Storage. Los medios canónicos existentes sí forman parte del documento.
- No hay autosave ni resolución interactiva de conflictos todavía.
- Guardar un borrador no publica una invitación. La ruta pública sigue leyendo el registro estático.
- `LMN-015-002` continúa intacta: el borrador de Studio no cambia el enlace ni el contenido que la
  familia de Maia ya está compartiendo.
