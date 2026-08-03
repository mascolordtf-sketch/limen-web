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

## Puerta técnica prevista

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

La línea base vigente es `f18fecf2c6afed9b27604e3a819285ef42dc0b58` y el último merge confirmado es el PR #77. La Fase 0.2 quedó **NO VERIFICABLE** (`NOT VERIFIABLE`): `npm ci` recibió `403 Forbidden` al solicitar `lottie-web`, por lo que no se pudieron verificar reproduciblemente lint, typecheck, pruebas ni build. La validación estructural de la matriz terminó correctamente para los 224 casos definidos; ese resultado histórico fue solo cobertura estructural y no control perceptual. En la fase se ejecutaron `0` pruebas o aserciones. La evidencia histórica de `275` aserciones corresponde únicamente a la línea base anterior `ed13ac7…` y a Node 24. La inspección perceptual externa posterior de Fase 1.2 está registrada por separado en [`docs/origin01-visual-matrix.md`](docs/origin01-visual-matrix.md) y no cambia el estado de Fase 0.2.

El proyecto contiene una base técnica desplegable para evolucionar LIMEN de forma progresiva. Incluye la experiencia pública Origin 01 en `/demo/LMN-015-001`, un Studio interno temporal, contratos tipados, preview real, administración local de contenido y medios, tres variantes visuales y un laboratorio tipográfico.

El estado, la evidencia, los runtimes observados y la diferencia entre el workflow actual y la puerta técnica prevista se documentan en [`docs/technical-baseline.md`](docs/technical-baseline.md).

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
