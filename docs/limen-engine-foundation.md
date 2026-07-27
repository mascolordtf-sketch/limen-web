# LIMEN Engine — base de arquitectura (Fase 1A)

## Contratos

- Una **plantilla** es una experiencia diseñada. Define módulos admitidos, su clasificación, el orden narrativo y las variantes visuales permitidas.
- Una **invitación** es un evento concreto basado en una plantilla. Contiene identidad, evento, contenido, medios, estado, audiencia, variante y activación de módulos.
- Una **escena** es la parte visible y narrativa de la experiencia. Un **módulo** es su identificador técnico estable para configuración y validación.
- Los módulos **obligatorios** deben estar presentes y activos. Los **opcionales** pueden activarse o desactivarse, pero ninguna invitación puede cambiar arbitrariamente el orden de la plantilla.

El catálogo inicial es: `prelude`, `hero`, `eventDetails`, `countdown`, `location`, `story`, `gallery`, `trivia`, `dressCode`, `gifts`, `instagram`, `rsvp` y `closing`.

## Origin 01

Origin 01 admite, en orden canónico: `prelude`, `hero`, `countdown`, `story`, `eventDetails`, `dressCode`, `gallery`, `trivia`, `gifts`, `rsvp`, `closing`.

Son obligatorios `prelude`, `hero`, `eventDetails` y `closing`. Los demás módulos admitidos, incluida `trivia`, son opcionales. `trivia` es una escena real y ocupa su posición actual entre `gallery` y `gifts`.

La escena actual “Cuándo y dónde” reúne fecha, hora, lugar, dirección y acciones relacionadas dentro de una sola sección y, por lo tanto, su límite de activación veraz es `eventDetails`. `location` permanece en el catálogo global para una posible escena independiente futura, pero Origin 01 todavía no la admite como módulo separado. `instagram` tampoco está admitido porque no existe una escena real correspondiente.

La única variante implementada es `origin01-wine`, que también es la variante predeterminada.

## Registro y validación

El registro central resuelve plantillas conocidas sin carga dinámica. La validación pura devuelve errores estructurados y accionables para IDs desconocidos, listas de módulos o variantes con duplicados, módulos incompatibles, módulos obligatorios ausentes o desactivados y variantes inválidas. También comprueba la coherencia interna de cada plantilla: orden sin duplicados, clasificación completa y disjunta, metadatos de módulos consistentes y variante predeterminada admitida. El registro ejecuta la aserción estricta sobre todas sus definiciones durante la inicialización del módulo en todos los entornos.

Los contratos de invitación son datos serializables: usan fechas ISO como texto y no permiten JSX, funciones, instancias de clases, referencias DOM ni valores específicos del navegador.

## Límites de esta fase

La Fase 1A no extrae el contenido actual, no crea datos de demo nuevos, no conecta configuraciones con React y no altera el renderizado público.

La **Fase 1B** extrae el contenido de Origin 01 hacia una invitación tipada y adapta sus datos sin activar renderizado condicional. La **Fase 1C** conectará módulos validados con las escenas visibles, preservando el orden y la dirección de arte de la plantilla.

## Fase 1B — datos concretos de Origin 01

La invitación publicada `LMN-015-001` vive en `origin01/origin01DemoData.ts` y satisface el contrato `Origin01InvitationData`, una especialización de `LimenInvitation<Origin01Content>`. El objeto reúne metadatos del evento, identidades, referencias de medios, configuración de todos los módulos admitidos y el contenido serializable de cada escena. Una aserción de inicialización valida la plantilla, la variante, los módulos obligatorios, los duplicados y la presencia mínima de contenido y medios.

`DemoPage` mantiene un registro local explícito por código y entrega el objeto completo a `Origin01Invitation`; la audiencia continúa derivándose de la URL como estado de ejecución. El renderer conserva su jerarquía de escenas y resuelve las referencias de medios sin crear un contenedor visual nuevo. `Origin01Trivia` recibe su configuración tipada mediante una prop y ya no importa contenido personalizado global.

El contrato histórico de `types.ts` se conserva temporalmente para no ampliar esta fase a una limpieza general, pero ya no es la fuente de la demo Origin 01. La Fase 1C sigue siendo responsable de conectar la configuración validada de módulos con renderizado condicional; en esta fase la configuración no activa, oculta ni reordena escenas.

## Fase 1C.1 — configuración de escenas opcionales

Las escenas opcionales de Origin 01 ahora obedecen `invitation.modules`, mientras que la validación sigue protegiendo las escenas obligatorias. El orden canónico permanece escrito explícitamente en el renderer de la plantilla y el helper puro de ejecución vive en `engine/moduleRuntime.ts`. Studio y los controles visibles continúan diferidos.

## Fase 1C.2 — verificación con configuración reducida

El helper inmutable `updateInvitationModuleConfiguration` permite derivar configuraciones reducidas a partir de una invitación canónica sin duplicar su fixture ni alterar el orden de sus módulos. Esta fase no incorpora un fixture reducido permanente, una ruta pública ni una interfaz de Studio. La verificación ejecutable del renderizado reducido queda diferida hasta que exista tooling de pruebas compatible o hasta la fase de vista previa de Studio; los controles visibles continúan diferidos.

## Fase 1C.3 — estructura básica de Studio

Studio dispone de rutas internas independientes del layout público. La invitación local conocida se resuelve directamente desde `origin01DemoData` y la página muestra únicamente sus metadatos junto con espacios reservados para la configuración de escenas y la vista previa. Todavía no existen controles ni una vista previa real, y tampoco hay autenticación o persistencia. Studio no está enlazado desde la interfaz pública; los controles permanecen diferidos hasta la Fase 1C.4.

## Fase 1C.4 — configuración local de escenas en Studio

Studio ahora lista las escenas y sus etiquetas desde los metadatos de la plantilla, respetando su orden canónico. Las escenas obligatorias permanecen bloqueadas y las opcionales ofrecen controles nativos accesibles; cada cambio actualiza inmutablemente la configuración completa de módulos y valida una invitación derivada localmente. Restablecer recupera los módulos canónicos de la demo sin alterar el fixture. Los cambios son temporales, la vista previa real queda diferida hasta la Fase 1C.5 y todavía no existen autenticación ni persistencia.

## Fase 1C.5A — vista previa real en Studio

Studio deriva la invitación de vista previa a partir de `origin01DemoData` y la configuración local de módulos, por lo que solo reemplaza los módulos y conserva intactos los demás datos canónicos. Las configuraciones válidas se entregan al renderer real `Origin01Invitation`, que permanece ajeno a Studio; una configuración inválida no se renderiza. Los cambios siguen siendo temporales y la audiencia permanece fija en protagonista durante esta fase. Los controles de audiencia quedan diferidos hasta la Fase 1C.5B y todavía no existen autenticación ni persistencia.

## Fase 1C.6A — limpieza responsive y accesible de Studio

Studio recibió ajustes de presentación responsive y accesibilidad sin incorporar funcionalidad nueva. La configuración de módulos y la audiencia continúan siendo temporales; la autenticación y la persistencia permanecen diferidas.

## Fase 1C.6B — resolución local de invitaciones en Studio

Studio resuelve invitaciones mediante un único registro local tipado. La ruta genérica por código atiende tanto invitaciones conocidas como desconocidas, y la redirección predeterminada deriva de la invitación canónica registrada sin duplicar sus datos. El registro contiene únicamente Origin 01; la persistencia, la autenticación y el renderizado de múltiples plantillas permanecen diferidos.

## Fase 2A.1 — edición temporal del nombre de la protagonista

Studio proyecta temporalmente la identidad canónica de la protagonista en los campos directos de Origin 01 y permite elegir entre un mensaje sugerido por LIMEN, que incluye su nombre, o uno personalizado; el título compartido también refleja la protagonista y la vista previa siempre comparte la ruta pública `/demo/:code`. `event.name` permanece sincronizado por compatibilidad, ningún fixture se muta y los textos narrativos arbitrarios siguen diferidos para edición explícita por sección o variables. No existen persistencia ni autenticación.

## Fase 2A.2A — edición temporal del inicio del evento

Studio permite editar temporalmente la fecha y hora de inicio canónica del evento mediante una conversión de `datetime-local` que respeta la zona horaria de la invitación. Al derivar el final temporal conserva la duración original, y proyecta desde el nuevo inicio las etiquetas directas de fecha y hora de Origin 01; la cuenta regresiva y el calendario consumen esos valores canónicos derivados. Ningún fixture se muta y no existen persistencia ni autenticación. La edición de la hora de finalización y de la zona horaria permanece diferida.

## Fase 2A.2B — edición temporal de la finalización del evento

Studio presenta el inicio y la finalización como una única configuración de horario, manteniendo ambos valores temporalmente editables de forma independiente y admitiendo eventos que cruzan la medianoche. Origin 01 muestra el rango horario derivado, y el calendario consume el inicio y la finalización derivados. Ningún fixture se muta y no existen persistencia ni autenticación.

## Fase 2A.3A — edición temporal del nombre del lugar

Studio permite editar temporalmente el nombre canónico del lugar, y la vista previa real de Origin 01 consume el `event.venue` derivado. Ningún fixture se muta y no existen persistencia ni autenticación.

## Fase 2A.3B — edición temporal de la ubicación del evento

Studio presenta el lugar y la dirección como una única configuración temporal, con ambos campos editables y restablecibles de forma independiente. Origin 01 consume el `event.venue` y el `event.address` derivados, incluida la acción de mapa existente, sin mutar ningún fixture. No existen persistencia ni autenticación; las coordenadas, la geocodificación y la edición avanzada de mapas permanecen diferidas.
