# Fase 2B.7A — Recuperación estructural de LIMEN Studio

Esta entrega reemplaza la presentación administrativa acumulada durante 2B.4–2B.6B por un flujo editorial
basado en las cinco etapas aprobadas. El modelo tipado, el borrador temporal, los editores productivos y el
renderer real se conservan; su taxonomía interna deja de definir la interfaz visible.

## Alcance entregado

- **Secciones** es la única superficie donde se incluyen o excluyen escenas. Usa el arreglo `modules` del borrador temporal como fuente autoritativa; no crea otro estado de inclusión.
- **Contenido** se deriva de ese arreglo y muestra Datos generales más las escenas públicas incluidas, en el orden canónico de Origin 01.
- La navegación de Contenido tiene una sola columna visible. Cada escena resuelve explícitamente los grupos de editores existentes dentro de un único panel contextual.
- Los editores existentes se integran en una superficie continua. Studio evita repetir tarjeta dentro de tarjeta,
  pero no reescribe la lógica ni la validación propia de cada formulario.
- Excluir una escena cambia solamente el indicador `enabled` de su módulo. El objeto de contenido, sus ediciones y referencias de medios permanecen en el borrador y reaparecen al incluirla nuevamente.
- **Revisión** posee una frontera productiva propia: resume disponibilidad de preview, correcciones y
  advertencias; permite alternar audiencia; y ofrece correcciones directas sin mostrar dominios, IDs,
  proyecciones ni datos canónicos.
- El encabezado, la navegación de etapas y las superficies principales son compactos y mobile-first. La cabecera
  monumental, el resumen técnico repetido y el doble índice de Revisión no forman parte del flujo.
- Plantilla conserva selección, galería y filtros al cambiar de etapa. Estética continúa siendo informativa.
- La taxonomía interna (dominios, proyecciones y datos canónicos) deja de ser navegación visible en todo el
  recorrido principal.
- Contenido mantiene una sola instancia del renderer real de preview. En móvil conserva la presentación dedicada; el breakpoint compartido continúa en `76rem`.
- No hay persistencia, cambios en la invitación pública, autenticación, backend ni modificaciones del contrato de Origin 01.
- Las escenas obligatorias se normalizan como visibles en la proyección de Studio incluso si llega un borrador inconsistente con un módulo requerido desactivado; no se modifica silenciosamente ese borrador.
- Cualquier `editorId` visible resuelve de manera determinista a Datos generales o a una única escena pública.
  Las correcciones de `identity`, `event-canonical`, `event-operations` y `share` abren Datos generales.

Origin 01 exige Cierre además de Portada e Información del evento. La Confirmación se protege también como obligatoria por el contrato de producto aprobado para Studio, aunque el contrato técnico histórico todavía la clasifica como módulo opcional.

## Pendiente fuera de esta fase

El ajuste visual detallado de los campos internos de cada formulario permanece para una fase posterior. La
selección de escena queda explícita en Studio, pero la navegación contextual dentro del renderer no se simula:
conectar scroll o destinos reales requiere una evolución futura y segura de su contrato público.
