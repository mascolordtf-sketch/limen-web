# Supabase en LIMEN

Esta etapa agrega autenticación real para LIMEN Studio y prepara la persistencia. La invitación pública de Maia continúa funcionando desde el código local y conserva su URL.

## 1. Aplicar la migración

Vincular el repositorio al proyecto `limen-prod` y aplicar `supabase/migrations/20261002165311_studio_auth_foundation.sql` con el flujo habitual de Supabase CLI o desde una integración autorizada.

La migración crea:

- miembros internos de Studio;
- proyectos y accesos por proyecto;
- borradores editables y publicaciones inmutables por revisión;
- referencias a imágenes y audio;
- RLS y permisos explícitos para todas las tablas.

No se concede acceso a `anon`. Las invitaciones públicas se expondrán más adelante mediante una lectura pública controlada, no abriendo las tablas internas.

## 2. Crear el primer usuario

En Supabase Dashboard, crear el usuario desde **Authentication > Users**. No hay registro público desde LIMEN.

En **Authentication > Settings**, mantener deshabilitado el registro de nuevos usuarios. Las cuentas internas se crean únicamente desde el Dashboard.

Luego habilitarlo como administrador desde SQL Editor, reemplazando el correo:

```sql
insert into public.platform_members (id, role)
select id, 'administrator'
from auth.users
where email = 'tu-correo@example.com'
on conflict (id) do update
set role = excluded.role, active = true, updated_at = now();
```

## 3. Configurar el entorno web

Agregar en Vercel y en `.env.local`:

```dotenv
VITE_ENABLE_STUDIO=true
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_CLAVE_PUBLICA
```

La clave publicable puede estar en el navegador porque RLS controla el acceso. Nunca se debe agregar `service_role` ni otra clave secreta a una variable `VITE_*`.

## 4. Verificación mínima

1. Abrir `/studio` sin sesión y comprobar que redirige a `/studio/acceso`.
2. Probar credenciales incorrectas.
3. Iniciar sesión con un usuario de Auth que no figure en `platform_members`: debe rechazarse.
4. Iniciar sesión con el administrador habilitado: debe abrir Studio.
5. Abrir `/invitacion/LMN-015-002` en incógnito: debe seguir pública y sin pedir sesión.
