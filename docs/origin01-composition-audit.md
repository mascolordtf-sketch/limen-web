# Fase 1.3 — Cierre de composición de Origin 01

Fecha de preparación: 1 de agosto de 2026.

## Objetivo y frontera

Esta fase cierra la composición visual de Origin 01 sobre la matriz reproducible de 224 casos. Revisa jerarquía, iconos, espacios, recortes, fondos y continuidad narrativa sin convertir Origin 01 en un editor libre ni adelantar las fases de movimiento, música, accesibilidad o rendimiento.

La revisión conserva:

- las catorce escenas y su orden canónico;
- las audiencias protagonista e invitado;
- las variantes `origin01-wine`, `origin01-midnight` y `origin01-garden`;
- el contenido canónico y los fixtures límite `short` y `long`;
- el renderer público real y el carácter temporal de Studio.

## Inventario compositivo

| Área | Resultado | Decisión |
|---|---|---|
| Jerarquía editorial | Conservada | Títulos, textos, información y acciones mantienen niveles distinguibles en los perfiles canónico, corto y largo. |
| Iconos | Conservada | Los iconos informativos y de escena ya poseen presencia central, escala diferenciada y no dependen de contenedores decorativos genéricos. |
| Espacios | Conservados | Los bloques admiten crecimiento vertical; no se fijan alturas de contenido ni se comprimen los textos límite para forzarlos a entrar. |
| Fotografías y fondos | Conservados | Hero, Dress Code, Galería, Regalos y Cierre mantienen `object-fit: cover`, encuadres explícitos donde son necesarios y velos por variante. |
| Continuidad narrativa | Conservada | Las transiciones de superficie entre escenas mantienen la alternancia editorial, práctica, inmersiva y comunitaria del recorrido. |
| Celebración de Trivia | Corregida | El confeti estaba ligado a la columna de resultado y podía recortarse arriba; ahora ocupa el ancho de Origin 01 y una altura mínima de viewport. |

## Corrección reproducible

La comprobación principal es el resultado final de Trivia en:

- `BOUNDARY-trivia-long-mobile`;
- `BOUNDARY-trivia-long-desktop`;
- un caso base de Trivia por cada variante visual.

Al completar la trivia, el confeti debe:

1. extenderse por todo el ancho visible de Origin 01, no solo por la columna de texto;
2. conservar partículas visibles en la zona superior de la celebración;
3. permanecer detrás del puntaje, el resultado, la revelación y las acciones;
4. no crear desplazamiento horizontal;
5. continuar oculto cuando el usuario solicita movimiento reducido.

## Puerta de salida

La Fase 1.3 queda cerrada cuando:

- lint, TypeScript, pruebas, build, matriz y `git diff --check` pasan;
- el resultado de Trivia se comprueba en móvil y escritorio;
- al menos una variante alternativa confirma que el cambio no depende del color canónico;
- no se introduce ninguna modificación de contenido, movimiento, audio, Studio o contrato de plantilla.

Los defectos de ritmo de animación, reproducción musical y comportamiento por navegador pertenecen a la Fase 1.4. Teclado, foco, lectores, contraste, áreas táctiles y estados ARIA pertenecen a la Fase 1.5.
