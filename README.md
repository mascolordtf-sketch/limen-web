# LIMEN

LIMEN es un proyecto en fase inicial para un servicio curado de invitaciones digitales.

Durante la Fase 1, LIMEN no funciona como una plataforma autoservicio. Las personas visitantes podrán descubrir el servicio, revisar una colección pequeña de diseños, identificar cada diseño mediante un código claro, abrir demostraciones y contactar directamente al negocio para solicitar la invitación elegida. La preparación de cada invitación será manual y acompañada por la persona responsable del servicio.

## Stack técnico

- Vite
- React
- TypeScript
- Tailwind CSS mediante `@tailwindcss/vite`
- React Router
- Supabase Auth y Postgres
- npm

La invitación pública actual todavía se resuelve desde el frontend. LIMEN Studio ya cuenta con la
integración de Supabase Auth, rutas protegidas y una primera migración para persistencia, que debe
aplicarse y verificarse en el proyecto antes de habilitar Studio en producción.

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
npm run visual:matrix:check
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
- `/invitacion/:code`
- `/contacto`
- Ruta 404 para direcciones no reconocidas

Las rutas `/studio`, `/studio/invitaciones/:code` y `/studio/matriz/:caseId` son internas y requieren
una sesión de Supabase más una membresía activa en `platform_members`. Se habilitan automáticamente
en desarrollo local. En un build desplegado permanecen ocultas salvo que `VITE_ENABLE_STUDIO=true`.
La instalación, el primer administrador y las pruebas manuales se detallan en
[`docs/supabase-setup.md`](docs/supabase-setup.md).

## Línea base técnica

La línea base auditada durante la Fase 0.2 fue `f18fecf2c6afed9b27604e3a819285ef42dc0b58` y el último merge confirmado entonces era el PR #77. La Fase 0.2 quedó **NO VERIFICABLE** (`NOT VERIFIABLE`): `npm ci` recibió `403 Forbidden` al solicitar `lottie-web`, por lo que no se pudieron verificar reproduciblemente lint, typecheck, pruebas ni build. La validación estructural de la matriz terminó correctamente para los 224 casos definidos; ese resultado histórico fue solo cobertura estructural y no control perceptual. En la fase se ejecutaron `0` pruebas o aserciones. La evidencia histórica de `275` aserciones corresponde únicamente a la línea base anterior `ed13ac7…` y a Node 24. La inspección perceptual externa posterior de Fase 1.2 está registrada por separado en [`docs/origin01-visual-matrix.md`](docs/origin01-visual-matrix.md) y no cambia el estado de Fase 0.2.

El proyecto contiene una base técnica desplegable para evolucionar LIMEN de forma progresiva. Incluye la experiencia pública Origin 01 en `/demo/LMN-015-001`, un Studio interno temporal, contratos tipados, preview real, administración local de contenido y medios, cuatro variantes visuales y un laboratorio tipográfico.

El estado, la evidencia, los runtimes observados y la diferencia entre el workflow actual y la puerta técnica prevista se documentan en [`docs/technical-baseline.md`](docs/technical-baseline.md).

Después del merge del PR #84, `main` quedó en `52f3e809b60eb85feb8615054ceb1c80f7292a72` con la
primera invitación real publicada y el cierre técnico del piloto asistido. Sobre ese estado se ejecutaron
correctamente lint, typecheck, 310 aserciones, build, la matriz estructural vigente de 280 casos y
`git diff --check`. El procedimiento manual y los límites del piloto están documentados en
[`docs/pilot-operativo.md`](docs/pilot-operativo.md).

Todavía no incluye guardado del editor, publicación dinámica de proyectos, panel del cliente ni datos
reales de RSVP. El modelo versionado y la decisión de infraestructura están documentados en
[`docs/platform-data-foundation.md`](docs/platform-data-foundation.md) y
[`docs/adr/0001-supabase-platform.md`](docs/adr/0001-supabase-platform.md). Studio no debe recibir
información real hasta que la protección de acceso y las políticas de backend estén aplicadas.

La dirección recuperada para ampliar el catálogo —con Garden 01 como siguiente candidata— está en
[`docs/catalogue-direction.md`](docs/catalogue-direction.md).

## No objetivos de esta etapa

- Cuentas de cliente.
- Pagos.
- Editor de invitaciones autoservicio.
- Gestión de invitados.
- Seguimiento de RSVP.
- Entrega automatizada de invitaciones.
- CMS complejo.
- Identidad visual final.
