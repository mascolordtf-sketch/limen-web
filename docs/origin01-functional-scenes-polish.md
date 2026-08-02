# Cierre correctivo — fidelidad y escenas funcionales de Origin 01

## Propósito

Este cierre responde a la revisión perceptual posterior a la Fase 1.3. No incorpora una fase nueva del
Roadmap ni amplía Studio: corrige la fidelidad de su preview y cuatro problemas demostrables de
jerarquía o interacción en escenas funcionales de Origin 01.

## Preview fiel en Studio

Studio mantiene una única instancia del renderer real, pero la monta mediante un portal React dentro
de un `iframe` de 390 × 844 px. Esa superficie reproduce el viewport lógico del iPhone 13 utilizado en
la revisión y luego escala el teléfono completo para entrar en el espacio disponible.

El iframe recibe las mismas hojas de estilo que la aplicación. Origin 01 conserva los mismos datos,
tipografías, variante y estado React; las unidades de viewport, elementos fijos, cortes responsivos y
saltos de línea dejan de depender de las dimensiones de la ventana exterior de Studio.

## Ajustes de escenas

- **Cuenta regresiva:** reduce el vacío superior de la tarjeta y acerca el encabezado al contador sin
  cambiar su jerarquía tipográfica.
- **Dress Code:** unifica icono, categoría, título, descripción y nota en una composición centrada.
- **Regalo:** centra la propuesta y reemplaza el alias expuesto por una acción «Ver datos de la
  cuenta». El panel modal permite corroborar titular, banco o billetera y alias antes de copiar; se
  cierra con el fondo exterior, el control de cierre o Escape y mantiene el foco dentro mientras está
  abierto. Studio edita y valida los tres datos operativos por separado.
- **Trivia:** al aceptar el desafío y al avanzar de pregunta, desplaza la pregunta al comienzo seguro
  del viewport. Después de responder, acerca la devolución y la acción siguiente. También reduce
  moderadamente espacios y altura de opciones en móvil sin degradar sus objetivos táctiles. El
  resultado explicita que el máximo corresponde a cuatro respuestas correctas; la quinta pregunta
  continúa siendo una predicción no puntuable.
- **Agenda:** recupera el contraste del texto superior sobre la superficie borgoña sin alterar la
  jerarquía tenue de la escena.
- **Clima:** conserva la atribución obligatoria a Open-Meteo, integrada como una fuente editorial
  discreta dentro de la superficie del pronóstico.
- **Comunidad:** centra las tres acciones, elimina el subrayado y retira las flechas genéricas de los
  enlaces externos. Instagram, hashtag y álbum comparten ahora el mismo tratamiento de control.

## Límites

Este cierre no cambia fotografías, variantes cromáticas, iconografía definitiva, textos canónicos,
música, animaciones ni el orden narrativo. Las fotografías dirigidas por variante permanecen como una
decisión futura de dirección de arte.

## Comprobación visual requerida

1. Comparar la misma escena y combinación tipográfica en Studio y en un iPhone de 390 × 844 px.
2. Revisar Cuenta regresiva y Dress Code en móvil y escritorio.
3. Abrir Regalo, corroborar los tres datos, copiar el alias y cerrar por fondo, botón y Escape.
4. Completar Trivia y confirmar que pregunta, devolución y «Siguiente» llegan a una posición visible
   sin saltos bruscos.
