# LIMEN — piloto operativo asistido

## Alcance

El piloto valida LIMEN como servicio asistido. LIMEN recibe la información, construye la invitación,
la revisa con el cliente y publica una versión aprobada. No es una plataforma autoservicio y no debe
presentarse como tal.

Durante este piloto:

- las invitaciones se incorporan al registro tipado mediante código y PR;
- el cliente revisa una preview y aprueba el contenido antes de publicar;
- la publicación se realiza al fusionar el PR aprobado en `main`;
- RSVP continúa mediante WhatsApp;
- las correcciones posteriores se realizan mediante un nuevo PR;
- no existen base de datos, autosave, historial de drafts, panel del cliente ni vencimiento automático.

## Frontera de seguridad

Studio no posee autenticación ni persistencia. Sus rutas deben permanecer deshabilitadas en la
producción pública. Solo pueden habilitarse localmente o en un Preview de Vercel que conserve la
protección de acceso del equipo.

No se deben cargar datos reales en Studio desde una superficie pública. `VITE_ENABLE_STUDIO=true`
es una bandera de exposición, no un mecanismo de autenticación.

El repositorio y la invitación pública pueden contener fotografías, ubicación, teléfono y datos para
regalos. Antes de incorporarlos debe existir aprobación explícita del cliente y debe explicarse que la
información será accesible públicamente. Hasta contar con almacenamiento y retención administrados,
cada caso debe evaluarse de manera individual.

## Estados manuales

1. **Esperando información:** faltan datos o archivos.
2. **Borrador:** LIMEN está preparando contenido y diseño.
3. **Revisión interna:** se ejecutan controles técnicos, editoriales y visuales.
4. **Revisión del cliente:** existe una preview y se esperan correcciones.
5. **Aprobado:** el cliente confirmó contenido y publicación.
6. **Publicado:** el PR fue fusionado y la URL pública respondió correctamente.
7. **Pausado o cerrado:** se retira el acceso mediante un cambio explícito y verificable.

Solo **Aprobado** puede avanzar a publicación.

## Preparación de una invitación

1. Confirmar nombre, evento, fecha, horario, zona horaria, lugar y dirección.
2. Confirmar textos, escenas activas, dress code, restricciones y regalos.
3. Confirmar número de WhatsApp y fecha límite de RSVP.
4. Confirmar fotografías, música o decisión explícita de no usarla.
5. Registrar la autorización para publicar el material y los datos entregados.
6. Crear un código nuevo y verificar que no colisione con el registro existente.
7. Incorporar los datos y medios sin modificar la plantilla compartida.
8. Crear una preview protegida y enviar solamente esa URL durante la revisión.
9. Aplicar correcciones y obtener aprobación explícita.

## Puerta técnica previa al merge

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run visual:matrix:check
npm run build
git diff --check
```

Además deben comprobarse manualmente:

- iPhone en Safari;
- Android en Chrome;
- escritorio;
- apertura y recorrido completo;
- ausencia de overflow, cortes y superposiciones;
- cuenta regresiva y horario;
- Maps y Calendar;
- copia de datos para regalos;
- WhatsApp de confirmación;
- compartir invitación;
- comportamiento con y sin música;
- consola sin errores relevantes.

## Publicación y verificación

1. Confirmar que el PR apunta a `main`, está actualizado y no contiene cambios ajenos.
2. Fusionar únicamente después de la aprobación del cliente y la puerta técnica.
3. Esperar el deployment de producción en Vercel.
4. Abrir la URL desde un navegador sin sesión y confirmar respuesta pública.
5. Recorrer la apertura y al menos las acciones críticas.
6. Entregar al cliente la URL de producción, nunca la del Preview.

## Corrección, pausa y recuperación

- Una corrección publicada requiere un PR nuevo y la misma puerta técnica.
- Si un cambio rompe la experiencia, se revierte el commit o PR responsable y se verifica el nuevo
  deployment.
- Pausar o cerrar una invitación todavía requiere retirar su entrada pública mediante código; no existe
  vencimiento automático.
- Las decisiones, aprobaciones y enlaces entregados deben registrarse fuera de LIMEN mientras no haya
  persistencia.

## Criterio para avanzar a backend

Después de dos o tres invitaciones reales, registrar tiempos de preparación, campos faltantes,
correcciones, problemas encontrados por invitados y necesidades operativas. Esa evidencia alimentará
el modelo versionado, autenticación, storage, proyectos, drafts, snapshots y publicación de las Etapas
3 y 4 del roadmap maestro.
