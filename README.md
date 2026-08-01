# LIMEN

LIMEN es un proyecto en fase inicial para un servicio curado de invitaciones digitales.

Durante la Fase 1, LIMEN no funciona como una plataforma autoservicio. Las personas visitantes podrán descubrir el servicio, revisar una colección pequeña de diseños, identificar cada diseño mediante un código claro, abrir demostraciones y contactar directamente al negocio para solicitar la invitación elegida. La preparación de cada invitación será manual y acompañada por la persona responsable del servicio.

## Stack técnico

- Vite
- React
- TypeScript
- Tailwind CSS mediante `@tailwindcss/vite`
- React Router
- npm

No se incluye backend, base de datos, autenticación, pagos ni CMS.

## Instalación reproducible

```bash
npm ci
```

## Desarrollo

```bash
npm run dev
```

## Validación

```bash
npm run lint
npm run typecheck
npm test
npm run build
git diff --check
```

## Build de producción

```bash
npm run build
npm run preview
```

## Rutas disponibles

- `/`
- `/catalogo`
- `/disenos/:code`
- `/demo/:code`
- `/contacto`
- Ruta 404 para direcciones no reconocidas

## Línea base técnica

La línea base vigente fue verificada el 1 de agosto de 2026 sobre `main`, commit `ed13ac7a0356ad7d9a53119ab765b6321755b478`. El repositorio pasa lint, typecheck, 275 aserciones del modelo de Studio, build de producción y `git diff --check`.

El proyecto contiene una base técnica desplegable para evolucionar LIMEN de forma progresiva. Incluye la experiencia pública Origin 01 en `/demo/LMN-015-001`, un Studio interno temporal, contratos tipados, preview real, administración local de contenido y medios, tres variantes visuales y un laboratorio tipográfico.

La fotografía reproducible, sus advertencias y las deudas que separan esta línea base de la Etapa 1 se documentan en [`docs/technical-baseline.md`](docs/technical-baseline.md).

Todavía no incluye persistencia, backend, autenticación, publicación de proyectos, panel del cliente ni datos reales de RSVP. Studio no debe recibir información real hasta que existan el modelo de datos y la protección de acceso definidos en el roadmap maestro.

## No objetivos de esta fase

- Cuentas de cliente.
- Autenticación.
- Pagos.
- Panel de administración.
- Supabase u otra base de datos.
- Editor de invitaciones autoservicio.
- Gestión de invitados.
- Seguimiento de RSVP.
- Entrega automatizada de invitaciones.
- CMS complejo.
- Identidad visual final.
