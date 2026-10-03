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
- Las fotografías procesadas y los audios se guardan en el bucket privado `invitation-media`. El
  documento conserva su `storageKey`; Studio genera una URL firmada de doce horas al abrirlo y nunca
  persiste esa URL temporal.
- El primer archivo puede crear el proyecto antes del primer guardado del borrador. Los objetos se
  aíslan por el UUID del proyecto en el primer segmento de su ruta y las políticas de Storage aplican
  el mismo acceso por proyecto que las tablas.
- Al salir con cambios sin guardar, el navegador muestra su advertencia estándar.

## Límites deliberados

- No hay autosave ni resolución interactiva de conflictos todavía.
- Restablecer o reemplazar un archivo no lo elimina inmediatamente de Storage: se conserva para no
  invalidar la última revisión guardada. La recolección de archivos sin referencias será una tarea
  server-side posterior.
- Guardar un borrador no publica una invitación. La ruta pública sigue leyendo el registro estático.
- `LMN-015-002` continúa intacta: el borrador de Studio no cambia el enlace ni el contenido que la
  familia de Maia ya está compartiendo.
