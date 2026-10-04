# Studio: workspace unificado

## Alcance

Esta etapa convierte Studio en un único espacio de trabajo de escritorio. No modifica el
documento de la invitación, su persistencia, las publicaciones, Auth, Supabase ni el renderer
público. La invitación de Maia conserva la misma ruta y los mismos datos.

## Flujo

Las cinco etapas visibles son:

1. Diseño
2. Secciones
3. Contenido
4. Fotos y música
5. Revisar y publicar

Plantilla y paleta forman una sola decisión de diseño. Fotografías y audio pasan a una etapa
propia para que la configuración visual no mezcle tareas de carga de archivos.

## Arquitectura de interacción

En escritorio, todas las etapas comparten tres regiones estables:

- navegación del flujo a la izquierda;
- tarea activa en el centro;
- una única instancia de la vista previa a la derecha.

La región central es la responsable del desplazamiento. Contenido conserva su navegación de
escenas dentro de esa región y Revisar y publicar conserva su lista de controles; ninguna de
las dos monta una segunda preview. Al ampliar la preview, la navegación y el editor quedan
inertes hasta volver al workspace.

## Fuera de alcance

- compactación interna del administrador de fotografías;
- simplificación editorial de cada formulario;
- rediseño específico para celular;
- cambios de esquema o migraciones.

## Verificación manual

1. Abrir una invitación en Studio y recorrer las cinco etapas.
2. Confirmar que la navegación lateral, el editor y la preview permanecen en la misma posición.
3. Cambiar una paleta en Diseño y comprobar la actualización de la preview.
4. Editar dos escenas de Contenido y comprobar que cada escena conserva su editor seleccionado.
5. Entrar a Fotos y música y verificar que siguen disponibles fotos, encuadre, zoom y audio.
6. Abrir Revisar y publicar, ampliar la invitación y volver al editor.
7. Guardar y recargar un borrador de prueba. No modificar ni publicar Maia durante la prueba.
