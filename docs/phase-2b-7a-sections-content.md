# Fase 2B.7A — Reconstrucción de Secciones y Contenido

Esta entrega reemplaza la navegación visible por dominios técnicos con un flujo basado en escenas reconocibles.

## Alcance entregado

- **Secciones** es la única superficie donde se incluyen o excluyen escenas. Usa el arreglo `modules` del borrador temporal como fuente autoritativa; no crea otro estado de inclusión.
- **Contenido** se deriva de ese arreglo y muestra Datos generales más las escenas públicas incluidas, en el orden canónico de Origin 01.
- La navegación de Contenido tiene una sola columna visible. Cada escena resuelve explícitamente los grupos de editores existentes dentro de un único panel contextual.
- Excluir una escena cambia solamente el indicador `enabled` de su módulo. El objeto de contenido, sus ediciones y referencias de medios permanecen en el borrador y reaparecen al incluirla nuevamente.
- La taxonomía interna (dominios, proyecciones y datos canónicos) deja de ser navegación visible en Secciones y Contenido.
- Contenido mantiene una sola instancia del renderer real de preview. En móvil conserva la presentación dedicada; el breakpoint compartido continúa en `76rem`.
- No hay persistencia, cambios en la invitación pública, autenticación, backend ni modificaciones del contrato de Origin 01.

Origin 01 exige Cierre además de Portada e Información del evento. La Confirmación se protege también como obligatoria por el contrato de producto aprobado para Studio, aunque el contrato técnico histórico todavía la clasifica como módulo opcional.

## Pendiente fuera de esta fase

El ajuste visual detallado de cada formulario permanece para una fase posterior. La selección de escena queda explícita en Studio, pero la navegación contextual dentro del renderer no se simula: conectar scroll o destinos reales requiere una evolución futura y segura de su contrato público.
