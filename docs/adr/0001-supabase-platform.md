# ADR 0001 — Supabase como plataforma de datos de LIMEN

- Estado: aceptada para implementación incremental.
- Fecha: 2 de octubre de 2026.

## Contexto

LIMEN necesita autenticación, Postgres, almacenamiento de fotografías y audio, permisos por proyecto,
sesiones privadas y una futura capa server-side para publicación, RSVP y tokens. El frontend actual es
React, TypeScript y Vite sobre Vercel.

## Decisión

Usar un proyecto Supabase exclusivo para LIMEN con:

- Postgres y migraciones versionadas como fuente de verdad;
- Supabase Auth para Studio y, posteriormente, enlaces mágicos del anfitrión;
- Row Level Security en todas las tablas con datos reales;
- Storage privado para originales y borradores;
- funciones server-side para publicación, tokens, cupos, RSVP y acciones privilegiadas;
- entornos y secretos separados entre desarrollo, previews y producción.

El navegador nunca recibirá una `service_role`. Las claves públicas no reemplazan RLS. Las operaciones
de publicación y administración de permisos no se implementarán como escrituras directas sin una
validación server-side.

## Consecuencias

- Studio podrá habilitarse en producción una vez que la ruta y las operaciones exijan sesión.
- La invitación pública podrá mantener una URL estable mientras cambia su fuente interna.
- Draft y publicación deberán ser entidades distintas para impedir que un autosave altere lo que ya
  está en vivo.
- Los archivos privados necesitarán políticas, límites y URLs temporales; una ruta de Storage no se
  considera autorización.
- El schema deberá permitir restaurar, auditar y migrar documentos mediante `schemaVersion`.

## Fuera de este ADR

No se definen todavía precios finales, campos definitivos del RSVP, política de vencimiento, pagos,
operación offline de QR ni el proveedor de correo transaccional. Esas decisiones dependen de fases
posteriores y no bloquean el fundamento de datos.
