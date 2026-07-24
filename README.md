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

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Validación

```bash
npm run lint
npm run typecheck
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

## Estado actual

El proyecto contiene una base técnica desplegable para evolucionar LIMEN de forma progresiva. Incluye estructura de rutas, estilos globales, una página inicial temporal, páginas placeholder para las secciones principales y la primera demostración funcional Origin 01 en `/demo/LMN-015-001`.

Todavía no incluye catálogo real, integración de contacto, identidad visual final ni datos de producto definitivos.

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
