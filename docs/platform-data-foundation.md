# LIMEN — fundamento de datos y seguridad

Fecha de decisión: 2 de octubre de 2026.

## Objetivo

La primera persistencia de LIMEN debe convertir Studio en una herramienta interna protegida sin
cerrar el producto a RSVP, panel del anfitrión o control de acceso futuros. Esta base no convierte
LIMEN en un constructor autoservicio: el diseño continúa a cargo de LIMEN y el cliente utiliza una
superficie privada operativa separada.

## Superficies y acceso

| Superficie | Acceso inicial | Responsabilidad |
| --- | --- | --- |
| Studio | Correo y contraseña | Crear, editar, revisar y publicar proyectos. |
| Preview de revisión | Token opaco y revocable | Revisar una versión antes de publicar. |
| Invitación pública | Código estable o entrega opaca | Mostrar solamente la experiencia publicada. |
| Panel del anfitrión | Enlace mágico o sesión privada | Administrar entregas, cupos y RSVP sin rediseñar. |
| Recepción | Cuenta o dispositivo autorizado | Validar QR y registrar ingresos en Premium Acceso. |

Studio comenzará con una cuenta administradora. El modelo admite editores sin exigirlos durante el
piloto. Una contraseña escrita en variables `VITE_*`, el bundle o `localStorage` no es autenticación:
los permisos se validarán en el backend y las rutas privadas exigirán una sesión real.

La cuenta administradora activa puede operar todos los proyectos. Los editores sólo pueden leer o
modificar proyectos, borradores y medios cuando poseen una asignación explícita en `project_access`.
La administración de esas asignaciones y la creación o cambio de publicaciones no se exponen como
escrituras directas al navegador: se incorporarán mediante operaciones server-side validadas.

## Núcleo persistente

1. **Proyecto:** identidad operativa estable, código público, plan, tipo de evento y ciclo de vida.
2. **Acceso al proyecto:** relaciona un usuario con un proyecto y un rol; no se deduce de la UI.
3. **Draft:** documento editable versionado, con revisión incremental y responsable de la última edición.
4. **Publicación:** copia inmutable aprobada. Nunca referencia el mismo objeto mutable que el draft.
5. **Medio:** metadatos del archivo y clave privada de almacenamiento; la URL temporal no se persiste.
6. **Entrega futura:** destinatario individual, pareja, familia o grupo, cupo y token opaco.
7. **Asistente futuro:** persona concreta, respuesta, alimentación, minoridad y observaciones.

Los campos centrales que se consultan, filtran o protegen viven en columnas relacionales. El contrato
completo de cada invitación se conserva como documento JSON versionado, porque los módulos y las
plantillas pueden crecer. Esta combinación evita tanto una tabla rígida con cientos de columnas como
un único JSON sin integridad operativa.

## Planes y capacidades

Los planes no son variantes visuales. Todos conservan calidad visual y habilitan capacidades
operativas acumulativas:

| Plan | Capacidades iniciales |
| --- | --- |
| Esencial | Enlace general y RSVP por WhatsApp. |
| Premium | Entregas personalizadas, cupos, RSVP propio, panel y exportación. |
| Premium Acceso | Todo Premium más QR y control de ingreso. |

El enforcement definitivo se ejecutará en servidor. Ocultar un control no impide una operación.

## Extensibilidad acordada

- `schemaVersion` acompaña drafts y publicaciones para ejecutar migraciones explícitas.
- `publicCode` permanece estable aunque cambien draft, plantilla o infraestructura.
- Una publicación nueva reemplaza a la anterior sin reescribir su historial.
- Alimentación se modela como una colección extensible: “vegano” es un valor posible, no una columna
  especial e irreversible.
- Destinatario, entrega y asistente son conceptos diferentes. Una familia puede tener un solo enlace,
  un cupo y varias personas confirmadas.
- Los módulos futuros amplían el documento versionado y sus validaciones; no requieren rediseñar las
  tablas operativas centrales.
- Los QR se derivarán de entregas persistentes y tokens revocables. No se generan desde nombres ni
  desde el código público del evento.

## Compatibilidad con Maia

`LMN-015-002` continúa resolviéndose desde el registro actual mientras se construyen datos y
publicación. La migración posterior conservará ese código y creará un snapshot equivalente antes de
cambiar la fuente de lectura. Este fundamento no modifica su ruta, contenido, medios ni RSVP.

## Próximas fases

Completado: proyecto Supabase, schema migrado, login/cierre, rutas protegidas, RLS endurecida,
guardado manual de proyectos y borradores con revisión optimista, y contrato de Storage privado para
fotografías y audio.

1. Añadir autosave sobre el mismo control de revisión y una recuperación explícita de conflictos.
2. Publicar snapshots inmutables mediante una operación validada del servidor.
3. Migrar Maia a publicaciones conservando su enlace, únicamente después de verificar equivalencia.
4. Incorporar formulario del cliente, entregas, RSVP y panel del anfitrión.
5. Añadir QR y recepción únicamente después de validar el modelo de entregas en eventos reales.
