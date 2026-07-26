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

La **Fase 1B** extraerá el contenido de Origin 01 hacia una invitación tipada y adaptará sus datos sin activar renderizado condicional. La **Fase 1C** conectará módulos validados con las escenas visibles, preservando el orden y la dirección de arte de la plantilla.
