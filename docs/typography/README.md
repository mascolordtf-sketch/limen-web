# Sistema tipográfico LIMEN v1

Esta carpeta documenta la biblioteca tipográfica curada de LIMEN. La fase establece los recursos,
las licencias, el inventario y las combinaciones iniciales; todavía no incorpora el selector de
tipografías en Studio ni cambia la tipografía pública de Origin 01.

## Alcance versionado

- 122 familias verificadas desde el repositorio oficial de Google Fonts.
- 40 familias principales, 43 temáticas y 39 experimentales.
- 206 archivos WOFF2 en `public/fonts/limen/`.
- Licencia asociada a cada familia.
- Inventario legible por personas (`inventario.csv`) y por código (`inventario.json`).
- Doce combinaciones iniciales para las pruebas visuales de Origin 01.
- Proceso reproducible en `scripts/typography/`.

Los TTF maestros no se versionan en este repositorio: están destinados a conservación e instalación
en herramientas de diseño y añadirían aproximadamente 57 MB sin aportar nada al runtime web.

## Estructura

```text
docs/typography/
  catalog/                     Inventario y combinaciones aprobadas para evaluación
  ORIGIN.txt                   Repositorio y commit de procedencia
public/fonts/limen/
  principal/                   Biblioteca inicial de uso general
  tematica/                    Familias ligadas a universos expresivos concretos
  experimental/                Reserva no habilitable sin una revisión explícita
  fonts.css                    Referencia global para auditoría y pruebas
scripts/typography/            Reconstrucción reproducible desde google/fonts
```

## Contrato de carga

`public/fonts/limen/fonts.css` es una referencia completa para auditorías y prototipos. No debe
importarse globalmente en la invitación publicada. Studio y cada invitación deben cargar solamente
los archivos `font-face.css` de las dos o tres familias que estén usando.

Ejemplo de ruta pública:

```text
/fonts/limen/principal/cormorantgaramond/font-face.css
```

Todas las declaraciones usan `font-display: swap`. Antes de realizar una captura o considerar lista
la preview, la interfaz deberá esperar a `document.fonts.ready` para evitar evaluar una fuente de
respaldo como si fuera la fuente elegida.

## Reglas editoriales

- Una experiencia puede combinar una fuente protagonista, una de nombre de portada, una editorial y una funcional.
- En muchas experiencias son suficientes dos familias.
- Las caligráficas y manuscritas delicadas se reservan para nombres, acentos o frases breves.
- Una familia experimental no se habilita automáticamente en Studio.
- `Edu TAS Beginner` permanece archivada, pero no es apta para español por su cobertura incompleta.
- Los cambios de nombre normalizados se conservan en `catalog/correcciones_de_nombres.json`.

## Licencias y procedencia

Cada familia conserva su `OFL.txt` o `LICENSE.txt` junto a los WOFF2. La procedencia exacta está
registrada en `ORIGIN.txt`. La licencia no debe separarse de la familia al copiarla o publicarla.

## Reconstrucción

El script requiere Python 3.11 o superior, `fonttools`, `brotli` y una copia local del repositorio
`google/fonts`:

```bash
python -m pip install -r scripts/typography/requirements.txt
python scripts/typography/build_limen_typography.py \
  --source /ruta/a/google-fonts \
  --output /ruta/de/salida
```

El resultado debe auditarse antes de reemplazar los recursos versionados. La reconstrucción completa
también produce los TTF maestros y un manifiesto de hashes; esos dos artefactos se conservan fuera
del repositorio web.

## Siguiente fase

Probar las doce combinaciones de `catalog/combinaciones_iniciales.csv` sobre escenas reales de
Origin 01 en celular y escritorio. El selector tipográfico de Studio se diseña después de esa
aprobación visual.

## Laboratorio de evaluación

Studio incorpora una comparación temporal de las doce combinaciones dentro de la etapa `Estética`.
Cada tarjeta muestra los roles nombre de portada, protagonista, editorial y funcional con texto real en español. La
combinación elegida puede abrirse sobre la invitación completa mediante los parámetros internos
`tipografia` e `inicio=invitacion` de la ruta de demostración.

El nombre de la portada usa un rol explícito, independiente tanto de `protagonist` como de la familia
de los títulos editoriales. Las combinaciones iniciales conservan el resultado visual anterior al
asignar de forma explícita la misma familia a `coverName` y `protagonist`, sin vincular ambos valores. El
laboratorio mantiene sus tarjetas y la acción de prueba bloqueadas hasta que las hojas de estilo y
`document.fonts.ready` confirman que las familias reales están disponibles. Si una carga falla, no
expone fuentes de reemplazo y ofrece un reintento. Si la Font Loading API no está disponible, continúa
de forma segura después de cargar las hojas; si solo `fonts.ready` falla tras verificar las familias
solicitadas, utiliza esas cargas verificadas para no dejar la interfaz bloqueada.

Este laboratorio no forma parte del modelo persistente, no modifica el borrador canónico y no
define todavía la tipografía aprobada de Origin 01. Su finalidad es comparar la misma composición
en escritorio y celular antes de construir el selector definitivo. Una prueba carga solamente las
dos o tres hojas `font-face.css` correspondientes; un identificador desconocido conserva la
tipografía actual sin producir una configuración parcial.
