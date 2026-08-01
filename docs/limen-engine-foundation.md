# LIMEN Engine — base de arquitectura (Fase 1A)

## Etapa 0 — línea base verificada

El 1 de agosto de 2026 se confirmó que `main` apunta a `ed13ac7a0356ad7d9a53119ab765b6321755b478`, el mismo commit utilizado por la auditoría técnica de referencia. Una instalación limpia mediante `npm ci` supera lint, typecheck, 275 aserciones del modelo, build y `git diff --check`. Los resultados reproducibles, advertencias y pendientes que abren la Etapa 1 se registran en [`technical-baseline.md`](technical-baseline.md).

Esta actualización es documental: no modifica contratos, renderizado, Studio ni la invitación pública.

## Contratos

- Una **plantilla** es una experiencia diseñada. Define módulos admitidos, su clasificación, el orden narrativo y las variantes visuales permitidas.
- Una **invitación** es un evento concreto basado en una plantilla. Contiene identidad, evento, contenido, medios, estado, audiencia, variante y activación de módulos.
- Una **escena** es la parte visible y narrativa de la experiencia. Un **módulo** es su identificador técnico estable para configuración y validación.
- Los módulos **obligatorios** deben estar presentes y activos. Los **opcionales** pueden activarse o desactivarse, pero ninguna invitación puede cambiar arbitrariamente el orden de la plantilla.

El catálogo actual es: `prelude`, `hero`, `eventDetails`, `schedule`, `weather`, `countdown`, `location`, `story`, `gallery`, `trivia`, `dressCode`, `gifts`, `instagram`, `rsvp` y `closing`.

## Origin 01

Origin 01 admite, en orden canónico: `prelude`, `hero`, `countdown`, `story`, `eventDetails`, `schedule`, `weather`, `dressCode`, `gallery`, `instagram`, `trivia`, `gifts`, `rsvp`, `closing`.

Son obligatorios `prelude`, `hero`, `eventDetails` y `closing`. Los demás módulos admitidos son opcionales. `instagram` identifica técnicamente la escena pública Comunidad y ocupa su posición entre `gallery` y `trivia`.

La escena actual “Cuándo y dónde” reúne fecha, hora, lugar, dirección y acciones relacionadas dentro de una sola sección y, por lo tanto, su límite de activación veraz es `eventDetails`. `location` permanece en el catálogo global para una posible escena independiente futura, pero Origin 01 todavía no la admite como módulo separado.

Origin 01 admite `origin01-wine`, `origin01-midnight` y `origin01-garden`; `origin01-wine` continúa siendo la variante predeterminada.

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

## Fase 2A.4 — edición temporal del Dress Code

Studio permite editar temporalmente el título, la descripción y la nota existentes del Dress Code dentro de un único editor coherente de la escena. La vista previa real de Origin 01 consume ese contenido derivado, y el módulo puede ocultarse y volver a activarse sin perder las ediciones temporales. Ningún fixture se muta y no existen persistencia ni autenticación; la imagen del Dress Code y la personalización visual permanecen diferidas.

## Fase 2A.5 — edición temporal de la confirmación

Studio reúne en un único editor de confirmación la edición temporal del título, la descripción, el texto de la acción y el destino canónico de RSVP. La vista previa real de Origin 01 consume los valores derivados y el constructor de la acción existente continúa controlando el destino; ocultar y volver a activar el módulo conserva las ediciones temporales. Ningún fixture se muta y no existen persistencia ni autenticación; las respuestas RSVP y la gestión de invitados permanecen diferidas.

## Fase 2A.6 — edición temporal de Regalos

Studio reúne en un único editor de Regalos la edición temporal del contenido existente y del dato canónico copiable. La vista previa real de Origin 01 consume los valores derivados y la acción existente continúa controlando la copia; ocultar y volver a activar el módulo conserva las ediciones temporales. Ningún fixture se muta y no existen persistencia ni autenticación; el procesamiento de pagos, los registros de regalos y las integraciones financieras permanecen diferidos.

## Fase 2A.7 — edición temporal de Historia

Studio permite editar temporalmente el contenido narrativo no identitario existente de Historia, preservando su estructura canónica, mientras la firma sigue derivándose de la identidad temporal de la protagonista. La vista previa real de Origin 01 consume los valores derivados; ocultar y volver a activar el módulo conserva las ediciones, y el contenido más extenso crece naturalmente. Ningún fixture se muta y no existen persistencia ni autenticación; los medios, los cambios en la estructura de párrafos y la edición de texto enriquecido permanecen diferidos.

## Fase 2A.8 — edición temporal de la apertura

Studio reúne en un único editor de apertura la edición temporal de los textos no derivados existentes de Preludio y Portada. El saludo y los campos identitarios siguen proyectándose desde la identidad temporal de la protagonista, mientras la fecha de Portada se deriva del inicio temporal del evento. La vista previa real de Origin 01 consume el contenido derivado y los textos extensos crecen naturalmente, sin alterar los medios canónicos ni el carácter obligatorio de ambas escenas. Ningún fixture se muta y no existen persistencia ni autenticación; los medios, el movimiento y la personalización visual permanecen diferidos.

## Fase 2A.9 — edición temporal del cierre

Studio permite editar temporalmente el contenido editorial no derivado existente de Cierre, y la vista previa real de Origin 01 consume ese contenido derivado y crece naturalmente con textos más largos. La firma continúa proyectándose desde la identidad temporal de la protagonista, mientras que el título y el texto compartidos permanecen bajo las proyecciones existentes de identidad y configuración de compartir. Cierre sigue siendo una escena obligatoria, ningún fixture se muta y no existen persistencia ni autenticación; los medios, la personalización visual y la configuración avanzada de compartir permanecen diferidos.

## Fase 2A.10 — edición temporal de Trivia

Studio permite editar temporalmente la presentación existente de Trivia, su conjunto fijo de preguntas, las etiquetas de opciones, la configuración de respuestas correctas y los mensajes de devolución y resultados. La cantidad, el orden y los tipos de preguntas permanecen canónicos; los campos identitarios siguen derivados de la identidad temporal de la protagonista, los umbrales y la dinámica de puntaje no cambian, y la pregunta de predicción continúa sin respuesta incorrecta. Ocultar y volver a activar el módulo conserva las ediciones temporales, que consume la vista previa real de Origin 01 sin mutar el fixture. No existen persistencia ni autenticación; la creación y el reordenamiento de preguntas, las analíticas y los puntajes almacenados de invitados permanecen diferidos.

## Fase 2A.11 — edición editorial de la información del evento

Studio reúne en un único panel la edición temporal de los textos editoriales existentes de Cuenta regresiva y Datos del evento, con validación y restablecimientos independientes. La fecha, la hora, la ubicación, el objetivo de la cuenta regresiva y los destinos de calendario y mapa continúan derivados de los datos canónicos temporales. No existen persistencia, autenticación, geocodificación, edición de medios ni mutación de la invitación pública.

## Fase 2A.12 — edición editorial de Galería

Studio permite editar temporalmente el texto introductorio, el título y los epígrafes opcionales de las imágenes existentes de Galería, con restablecimientos independientes para el contenido general y los epígrafes. Las referencias de medios, la cantidad y el orden canónicos permanecen protegidos. No existen persistencia, autenticación, carga o reemplazo de medios ni creación, eliminación o reordenamiento de elementos.

## Fase 2A.13 — cierre de proyecciones identitarias y de la Fase 2A

Studio deriva el monograma del sobre, el mensaje prellenado de RSVP y el título utilizado para compartir desde el cierre a partir de la identidad temporal validada de la protagonista. En el mensaje de RSVP y en el título para compartir, `event.celebrationLabel` es la fuente canónica para el tipo o nombre de la celebración. La derivación ocurre en la invitación temporal sin mutar el fixture, sin alterar la invitación pública y sin añadir paneles editoriales.

La Fase 2A queda formalmente cerrada con cobertura editorial temporal suficiente para Origin 01. Los textos menores restantes permanecen canónicos o diferidos deliberadamente. Medios, persistencia, autenticación, publicación y rediseño de Studio siguen fuera de esta etapa. La personalización futura de colores queda diferida al sistema visual del Studio definitivo y deberá resolverse mediante paletas o roles de color coherentes, no mediante cambios aislados de estilos.

## Fase 2B.3 — fronteras internas de Studio

Studio conserva su interfaz y su renderer público, pero separa el borrador temporal de la composición de página. `origin01StudioDraft` posee la inicialización, las actualizaciones tipadas, la activación protegida y los restablecimientos de campo, grupo, escena y configuración; `origin01StudioDerivations` produce la invitación temporal; `origin01StudioValidation` calcula incidencias y metadatos jerárquicos; y `useOrigin01StudioModel` se limita a componer esas fronteras con estado React. El borrador mantiene las fuentes canónicas y el contenido editorial, mientras las etiquetas, firmas, mensajes identitarios y demás proyecciones se producen únicamente al derivar la invitación entregada a Origin 01.

El borrador de Trivia contiene únicamente presentación, preguntas, opciones, respuestas, devoluciones y resultados editables. `protagonistName`, `accessibleTitle`, `title` y `revealSignature` no forman parte de ese borrador y se proyectan exclusivamente desde la identidad canónica al derivar la invitación temporal.

Los contratos compartidos de Studio definen los cinco dominios y una intención futura de preview contextual. La composición secundaria, las escenas y el esquema preparatorio de Trivia permanecen en `origin01StudioConfiguration`, porque pertenecen a la plantilla y no son verdades universales del shell; su orden, obligatoriedad y capacidad de activación se derivan de `origin01Template`. La audiencia continúa fuera del contenido del borrador, sus transiciones puras son compartidas por el hook productivo y las pruebas, y cambiarla reinicia el renderer.

La validación distingue estructura renderizable, errores editoriales activos, advertencias, contenido inválido de escenas inactivas y revisión editorial pendiente, y agrega esos estados coherentemente por escena y dominio. Una escena opcional inactiva conserva sus datos y deja de aportar errores relevantes; una operación de modelo rechaza la desactivación de escenas obligatorias. La preview visible mantiene la política previa de recibir únicamente una invitación activa válida; el metadato estructural `previewBlocked` queda reservado para la experiencia futura. `Invitación válida`, revisión editorial y la capacidad futura `Lista para publicar` permanecen estados diferentes. No existen todavía persistencia ni una última versión guardada: la frontera de dirty state expone solamente borrador inicial y actual.

La navegación visual responsive queda reservada para 2B.4. La presentación definitiva de preview contextual, último borrador válido y resumen de errores queda reservada para 2B.5. Esta fase no incorpora shell nuevo, flujo visual de Trivia, guardado, publicación ni cambios en Origin 01.

Cada issue pertenece a un único dominio, incluso cuando también informa el estado global de una escena. Los datos operativos de RSVP y Regalos pertenecen a Evento y navegan a `event-operations`; su incidencia puede volver incompleta la escena relacionada sin trasladar silenciosamente su conteo a Experiencias. Los dominios agregan exclusivamente sus propias incidencias, mientras las escenas agregan todos sus campos asociados.

La sesión temporal se identifica mediante el `id` estable de la invitación. La ruta usa esa identidad como `key` de la composición de Studio, de modo que abrir otra invitación crea un hook y un borrador nuevos antes de calcular resets, validación o preview; no se intenta conservar ni persistir cambios entre invitaciones.
## Fase 2B.4 — shell de navegación de Studio

Studio dispone de un shell jerárquico responsive derivado de los metadatos de Origin 01: el dominio es
la navegación primaria y cada grupo, escena o tarea constituye el segundo nivel. Solo se monta el editor
enfocado. En móvil, el recorrido separa índice general, índice del dominio y editor con retorno contextual;
en escritorio mantiene ambos índices visibles junto al editor. La selección es temporal, independiente del
borrador y no se persiste ni altera la preview pública. La preview avanzada y las capacidades de revisión
operativa quedan reservadas para 2B.5, que no fue iniciada.

## Phase 2B.5 — Preview and review architecture

Studio separa la superficie de preview del borrador y de la selección de navegación. Un único host mantiene como máximo una instancia viva de `Origin01Invitation` y cambia su presentación entre panel sticky, estado contraído y superficie dedicada, sin crear un renderer paralelo ni remontarlo. En escritorio el editor recupera ancho al contraer; en móvil, la misma instancia se presenta como superficie completa accesible con retorno al contexto que la abrió. La audiencia compartida continúa siendo contexto de ejecución: cambiarla o reiniciar manualmente remonta solo Origin 01 y mantiene borrador, validación y navegación.

La intención `previewTarget` orienta mediante una etiqueta resuelta desde el origen almacenado y conserva dominio, item y retorno. Origin 01 no expone una API pública segura para navegar escenas, por lo que esta fase no desplaza escenas, consulta su DOM ni introduce estado de Studio en el renderer. El resumen de Revisión agrupa incidencias estructurales, activas, advertencias, contenido inactivo y revisión editorial; sus destinos se resuelven desde `domainId`, `editorId` y `fieldId`, los destinos desconocidos permanecen visibles sin navegación arbitraria y la corrección conserva un retorno tipado a Revisión / Errores.

Mientras el borrador actual sea estructuralmente renderizable, el renderer consume su derivación incluso con correcciones editoriales locales. La frontera selecciona ese output de forma pura durante render y solo lo retiene después de que React confirma el render válido; un render abortado no puede convertirse en fallback. Si el borrador deja de ser renderizable, la sesión conserva únicamente esa última derivación confirmada y declara claramente que el cambio actual no está representado; sin una versión previa válida muestra Preview no disponible. La retención se limita a la identidad de la sesión y nunca usa el fixture como fallback. Origin01Invitation permanece ajena a navegación, validación y revisión de Studio. La optimización del checklist y del flujo profesional se difiere explícitamente a Phase 2B.6.

## Fase 2B.6B — Navegación principal por etapas

Studio incorpora cinco etapas superiores, reversibles y libremente accesibles: Plantilla, Estética, Secciones, Contenido y Revisión. Plantilla ofrece una primera experiencia temporal de selección, con opciones destacadas y una galería independiente cuyos filtros por celebración y estilo, selección y estado de navegación se conservan durante la sesión. La selección es temporal, no posee persistencia y no modifica la invitación pública; su presentación se integra de forma segura con la preview existente. Estética continúa siendo informativa y no incorpora controles de personalización. El shell, los editores, la validación y el renderer público se conservan sin reorganización.

## Fase 2C.2 — selector real de Plantillas

La Fase 2C.1 cerró la matriz de producto de Studio Esencial. A partir de esa base, Origin 01 es la única plantilla real disponible y seleccionable: Plantilla presenta su universo Origen, su carácter narrativo, capacidades existentes, una miniatura derivada de sus medios locales y un acceso a la demostración pública real. La selección continúa siendo temporal y cualquier identificador anterior no disponible se normaliza a Origin 01 sin modificar contenido, escenas, validación ni preview.

Editorial, Esencial y Celebración se conservan exclusivamente como nombres de exploraciones visuales futuras. Aparecen bajo el estado “Próximamente”, no ofrecen controles interactivos y no pueden alterar el borrador. Esta fase no incorpora plantillas nuevas, catálogo remoto, persistencia ni publicación; Studio no se considera completo ni publicable. Las variantes estéticas continúan reservadas para la Fase 2C.6.

## Fase 2C.3 — contrato común de medios

Studio distingue el medio editorial de la referencia renderizable pública. `InvitationMediaReference` continúa siendo el contrato pequeño que consume la invitación; `StudioMediaItem` representa imágenes y audio mientras están pendientes, procesándose, listos o en error. Los estados forman una unión discriminada: solo un medio listo posee la fuente definitiva y solo un medio con error posee su descripción de error. La procedencia diferencia medios canónicos y medios incorporados temporalmente por Studio. Los objetos `File` y las object URLs quedan fuera de este contrato persistible porque pertenecen al proceso local de selección o preview, no al dato editorial.

Las asignaciones relacionan identidades estables de medios con usos narrativos sin duplicar archivos. Origin 01 declara en una única fuente de verdad sus slots de portada, Dress Code, galería, regalos, cierre y música, junto con tipo permitido, cardinalidad, opcionalidad y etiqueta. La galería es una colección ordenada; los demás slots son únicos. La compatibilidad y la validación estructural consultan esas definiciones y detectan duplicados, referencias inexistentes, tipos incompatibles, cardinalidad inválida, fuentes o errores incompletos y accesibilidad informativa sin descripción.

El borrador temporal se inicializa normalizando `invitation.media` y las referencias actuales del contenido. La derivación proyecta al renderer únicamente los medios editoriales listos y preserva las asignaciones y el orden canónicos actuales. Las imágenes informativas expresan su texto alternativo de forma tipada, las decorativas se declaran explícitamente y el audio no recibe un campo `alt` artificial. El contrato editorial del MVP admite solo imagen y audio; el `video` que tolera el contrato público no habilita soporte de video en Studio.

La carga, sustitución visual, eliminación, reordenamiento, encuadre, compresión y progreso real de fotografías pertenecen a 2C.4. La selección, prueba, reemplazo y desactivación de música pertenecen a 2C.5. La condición definitiva de publicación permanece reservada para 2C.12; almacenamiento, persistencia y procesamiento remoto continúan diferidos a 2C.13 y 2C.14. Esta fase no modifica la interfaz, el renderer público ni `readyToPublish: false`.

## Fase 2C.4 — administración temporal de fotografías

La etapa Estética conserva la dirección de arte informativa de Origin 01 y agrega un administrador real para portada, Dress Code, Regalos, Cierre y la colección ordenada de Galería. Cada uso muestra la fotografía asignada y permite reemplazarla, restablecerla, editar su texto alternativo, ajustar el punto de enfoque horizontal y vertical y aplicar un zoom no destructivo de 1× a 2×. Dress Code y Regalos admiten quedar sin imagen; Portada y Cierre permanecen protegidas. Galería permite agregar, reemplazar, quitar y reordenar fotografías, conservando sincronizados sus epígrafes.

Studio acepta JPG, PNG y WebP de hasta 12 MB. El archivo se valida, decodifica y comprime localmente a una dimensión máxima de 2000 px antes de crear la object URL de preview. El `File` y las object URLs permanecen en la frontera de ejecución del componente y se liberan al cerrar la sesión; el borrador recibe únicamente metadatos y una fuente temporal lista. La fotografía anterior continúa asignada mientras la nueva está pendiente o procesándose, y un error local no destruye la asignación válida anterior.

El encuadre y el zoom pertenecen a la asignación —no al archivo— porque una misma imagen puede utilizarse de manera diferente en portada y galería. La derivación crea referencias renderizables específicas solo cuando un uso posee punto de enfoque o zoom; el estado canónico sin ajustes conserva sus identificadores y apariencia. El renderer público solo incorpora el soporte mínimo de `object-position`, escala y origen de transformación, y continúa ajeno a Studio.

No existen carga remota, persistencia, Supabase, biblioteca, recorte destructivo ni eliminación física. La música no cambia y permanece reservada para 2C.5; variantes visuales continúan en 2C.6 y `readyToPublish` permanece en `false`.

## Fase 2C.5 — administración temporal de música

La etapa Estética incorpora el administrador de música sobre el mismo contrato editorial de medios. El slot opcional `music.audio` permite elegir o reemplazar una pista local, probarla con controles nativos, desactivarla y restablecer la referencia canónica. La derivación utiliza exclusivamente la asignación vigente: un slot vacío elimina el audio y su control de la preview, sin recuperar silenciosamente la pista original.

Studio admite MP3, M4A, OGG y WAV de hasta 20 MB. El archivo se valida en la frontera del componente y se representa mediante una object URL temporal registrada por la sesión; el borrador conserva solo identidad, metadatos y fuente de preview, nunca el objeto `File`. No se procesa, recorta ni transcodifica el audio y la invitación canónica permanece inmutable.

La fase no incorpora persistencia, carga remota, biblioteca, catálogo musical, licencias, edición de audio, waveform ni reproducción avanzada. Las variantes visuales continúan reservadas para 2C.6 y `readyToPublish` permanece en `false`.

## Fase 2C.6 — variantes visuales curadas

Origin 01 admite tres variantes visuales reales y coherentes: `origin01-wine` (Vino nocturno), `origin01-midnight` (Noche plateada) y `origin01-garden` (Jardín antiguo). La etapa Estética las presenta como un selector accesible con sus paletas por roles, descripción y carácter; la elección se conserva en el borrador temporal, se proyecta mediante `themeVariant` al renderer real y puede restablecerse independientemente a la variante canónica de la invitación.

Las variantes modifican el sistema de color completo de Origin 01 y sus atmósferas oscuras principales sin cambiar tipografías, estructura, contenido, escenas, fotografías, música ni comportamiento. El registro de la plantilla continúa siendo la fuente de compatibilidad y la validación estructural rechaza variantes no admitidas. La invitación pública canónica conserva `origin01-wine`.

Esta fase no incorpora selección libre de colores, combinaciones arbitrarias, nuevas plantillas, variantes tipográficas, edición de ornamentos, persistencia, almacenamiento, autenticación ni publicación. `readyToPublish` continúa en `false`; la condición definitiva de publicación permanece reservada para 2C.12 y el almacenamiento y la persistencia continúan diferidos a 2C.13 y 2C.14.

## Fase 2C.7 — Cronograma

Origin 01 incorpora Cronograma como una escena pública opcional situada después de Información del evento y antes de Dress Code. La escena presenta un texto introductorio, un título, una breve presentación y una colección ordenada de uno a ocho momentos. Cada momento conserva una identidad estable y contiene horario, título obligatorio y descripción opcional.

Secciones es la única superficie de activación y mantiene el orden narrativo canónico. Contenido ofrece un editor propio para modificar los textos generales, agregar o quitar momentos, cambiar sus campos y reordenarlos con acciones explícitas. Excluir la escena conserva todas sus ediciones temporales y la reinclusión la devuelve a su posición original. Restablecer Cronograma recupera el contenido canónico sin modificar su activación.

La validación comprueba cardinalidad, formato horario y campos obligatorios. Los errores de una escena activa participan de la completitud de Experiencias y resuelven el control exacto que debe corregirse; el contenido inválido de un Cronograma excluido permanece registrado como contenido inactivo y no invalida la invitación. La derivación proyecta el orden actual al renderer real y omite únicamente las descripciones opcionales vacías.

La implementación no incorpora persistencia, backend, autenticación, publicación, horarios derivados automáticamente del evento ni edición libre del orden global de escenas. Clima y las demás experiencias posteriores continúan fuera de esta fase. `readyToPublish` permanece en `false`.

## Fase 2C.8 — Clima real

Origin 01 incorpora Clima como una escena pública opcional situada después de Cronograma y antes de Dress Code. La escena no almacena ni permite editar temperaturas, condiciones, lluvia o viento: esos valores son estado de ejecución obtenido de Open-Meteo para la fecha del evento y una localidad meteorológica confirmada mediante coordenadas y zona horaria.

Secciones es la única superficie de activación. Contenido permite editar el texto superior, el título y la presentación, buscar una localidad real mediante el servicio de geocodificación de Open-Meteo y confirmar uno de sus resultados. El borrador conserva nombre visible, división administrativa cuando existe, país, latitud, longitud y zona horaria. La dirección canónica del salón continúa siendo independiente y no se interpreta silenciosamente como coordenadas meteorológicas.

La invitación consulta el pronóstico únicamente cuando la fecha se encuentra dentro del horizonte de dieciséis días informado por el proveedor. Antes de ese punto comunica la fecha desde la cual podrá consultarse; para eventos pasados deja de presentar el pronóstico como información actual; durante la consulta muestra un estado de carga; y ante una falla declara indisponibilidad temporal. Nunca utiliza valores manuales, promedios estacionales o un fixture como sustituto de datos actuales. Cuando existe un pronóstico válido presenta condición, mínima, máxima, rango de sensación térmica, probabilidad máxima de precipitación, viento máximo, momento de actualización y atribución visible a Open-Meteo.

La integración está encapsulada en una capa propia que normaliza disponibilidad, códigos meteorológicos, respuestas diarias y resultados de geocodificación. En esta fase temporal el navegador consulta los endpoints públicos directamente. Un proxy de LIMEN con caché, control de cuota y credenciales comerciales queda reservado para la infraestructura productiva, junto con persistencia y almacenamiento. No se incorporan backend, autenticación ni publicación y `readyToPublish` permanece en `false`.

## Fase 2C.9 — Comunidad del evento

Origin 01 incorpora Comunidad como una escena pública opcional situada después de Galería y antes de Trivia. Su identificador técnico estable es `instagram`, pero la escena reúne tres funciones relacionadas: enlace al perfil oficial de Instagram, hashtag listo para copiar y acceso a un álbum compartido externo. Cada función puede activarse de forma independiente y, si la escena está incluida, al menos una debe permanecer configurada.

Secciones es la única superficie que incorpora o excluye Comunidad del recorrido. Contenido permite editar el encabezado, el título, la presentación, el usuario y la acción de Instagram, el hashtag y sus mensajes de copia, y la invitación, enlace HTTPS y acción del álbum. Excluir la escena conserva las ediciones temporales; si una invitación válida omite por completo la configuración opcional `instagram`, activarla agrega una única entrada sin normalizar ni mutar el fixture canónico.

La invitación deriva el enlace de Instagram desde el usuario confirmado, copia el hashtag literal y abre el álbum en un destino externo real. La validación condiciona los campos de cada función a su activación, rechaza usuarios o hashtags mal formados y exige HTTPS para el álbum. Los errores de Comunidad solo son relevantes mientras la escena está activa y navegan al control exacto del editor.

Esta fase no consulta ni incrusta un feed de Instagram, no autentica con Meta, no almacena ni modera fotografías y no ofrece carga de archivos dentro de LIMEN. El futuro álbum propio requerirá almacenamiento, permisos y moderación. Tampoco se incorporan persistencia, backend, iconografía definitiva ni publicación; `readyToPublish` permanece en `false`.

## Fase 1.1 — preparación confiable de la evaluación tipográfica

Origin 01 distingue el nombre principal de portada mediante el rol tipográfico explícito `coverName`. La combinación temporal proyecta ese rol únicamente sobre el nombre de la escena de portada, mientras las voces editoriales, funcionales y los acentos caligráficos propios de la plantilla conservan responsabilidades independientes.

El laboratorio de Studio carga las hojas de estilo requeridas por las doce combinaciones, solicita cada familia real mediante la Font Loading API y espera efectivamente a `document.fonts.ready` antes de habilitar la comparación o el acceso a la invitación completa. Durante la preparación no expone tarjetas renderizadas con fuentes de reemplazo; ante una falla mantiene bloqueada la evaluación, informa el problema y permite reintentar la carga.

La fase conserva el carácter temporal del laboratorio: no aprueba una combinación definitiva, no modifica el borrador canónico, no persiste la selección y no altera la invitación pública sin el parámetro interno de evaluación.

Como resguardo de composición, el nombre de portada conserva el tamaño definido por Origin 01 mientras entra en el ancho disponible y se reduce automáticamente solo cuando sus métricas tipográficas reales producirían un corte horizontal. El ajuste se recalcula al completar la carga de fuentes y ante cambios de viewport; no modifica los demás roles tipográficos.

Studio deberá incorporar en una fase posterior un control creativo independiente para la escala del nombre de portada, con valores diferenciables para celular y escritorio. Ese futuro control complementará el ajuste automático de seguridad, pero no forma parte de esta evaluación temporal ni introduce persistencia en la Fase 1.1.

## Fase 1.2 — matriz visual reproducible

La revisión perceptual de Origin 01 queda formalizada en una matriz de 224 casos. La cobertura base cruza los catorce módulos del orden canónico con las audiencias protagonista e invitado, las tres variantes visuales admitidas y los viewports móvil y escritorio. Una cobertura complementaria somete cada escena a contenido válido corto y largo en ambos viewports, manteniendo la audiencia protagonista y la variante canónica para aislar el efecto editorial.

El generador versionado comprueba que sus ejes coincidan con `canonicalOrder` y con el registro real de variantes antes de aceptar el CSV canónico. La matriz define criterios comunes para desbordes, superposiciones, recortes, jerarquía, acciones, recursos y continuidad entre escenas; un caso pendiente nunca equivale a aprobado.

Cada fila posee una ruta de harness que reproduce audiencia, variante, viewport y perfil de contenido sobre el renderer real. Los perfiles límite utilizan fixtures tipados con valores exactos por escena, de modo que un mismo identificador no depende de decisiones manuales del revisor. El verificador lee las variantes desde `origin01ThemeVariantIds`, la misma fuente consumida por la plantilla.

Esta fase no modifica el renderer, las escenas, el contenido, las variantes ni Studio. Los defectos perceptuales encontrados deben registrarse con evidencia y trasladarse a la Fase 1.3, responsable de composición. La matriz y el procedimiento de ejecución se documentan en [`origin01-visual-matrix.md`](origin01-visual-matrix.md).
