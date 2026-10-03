# Supabase en LIMEN

Esta etapa agrega autenticación real para LIMEN Studio y prepara la persistencia. La invitación pública de Maia continúa funcionando desde el código local y conserva su URL.

## 1. Aplicar la migración

Vincular el repositorio al proyecto `limen-prod` y aplicar, en orden, las migraciones de `supabase/migrations` con el flujo habitual de Supabase CLI o desde una integración autorizada. La segunda migración restringe los datos por proyecto, la tercera crea Storage privado y la cuarta incorpora la publicación server-side.

La migración crea:

- miembros internos de Studio;
- proyectos y accesos por proyecto;
- borradores editables y publicaciones inmutables por revisión;
- referencias a imágenes y audio;
- bucket privado con límite de 20 MB, tipos admitidos y objetos aislados por proyecto;
- función de publicación atómica, restringida a administradores y ligada a una revisión del borrador;
- RLS y permisos explícitos para todas las tablas.

La administración de `project_access` y las escrituras directas sobre `invitation_publications`
permanecen bloqueadas para el navegador.

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
6. Cargar una foto y un audio desde Studio, guardar el borrador, recargar y comprobar que ambos medios
   vuelven a mostrarse.
7. En Revisión, confirmar el control editorial y crear una publicación. Verificar que registra la
   revisión del borrador y que una segunda publicación de la misma revisión queda bloqueada.
