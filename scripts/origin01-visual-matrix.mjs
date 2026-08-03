import { readFile, writeFile } from 'node:fs/promises'
import console from 'node:console'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import process from 'node:process'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputPath = path.join(root, 'docs', 'origin01-visual-matrix.csv')

const scenes = [
  'prelude', 'hero', 'countdown', 'story', 'eventDetails', 'schedule', 'weather',
  'dressCode', 'gallery', 'instagram', 'trivia', 'gifts', 'rsvp', 'closing',
]
const audiences = ['protagonist', 'guest']
const variants = ['origin01-wine', 'origin01-midnight', 'origin01-garden']
const viewports = [
  { id: 'mobile', width: 390, height: 844 },
  { id: 'desktop', width: 1440, height: 1000 },
]

const boundaryFocus = {
  prelude: 'título, cuerpo, revelación y pregunta',
  hero: 'nombre, celebración, fecha y frase',
  countdown: 'título y mensaje completado',
  story: 'mensaje y firma',
  eventDetails: 'lugar, dirección, acciones y descripción de calendario',
  schedule: 'introducción, títulos y descripciones de momentos',
  weather: 'título, introducción y localidad',
  dressCode: 'título, descripción y nota',
  gallery: 'título y epígrafes',
  instagram: 'título, introducción, usuario, hashtag y álbum',
  trivia: 'títulos, preguntas, opciones y devoluciones',
  gifts: 'título, descripción, alias y nota',
  rsvp: 'título, descripción, acción y mensaje',
  closing: 'título, firma, invitación y acción de compartir',
}

const csvEscape = (value) => {
  const text = String(value)
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

function extractList(source, property) {
  const match = source.match(new RegExp(`${property}: \\[([^\\]]+)\\]`))
  if (!match) throw new Error(`No se pudo leer ${property} desde la plantilla Origin 01.`)
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function extractVariantIds(source) {
  const match = source.match(/export const origin01ThemeVariantIds = \[([^\]]+)\]/)
  if (!match) throw new Error('No se pudo leer origin01ThemeVariantIds desde su registro.')
  return [...match[1].matchAll(/'([^']+)'/g)].map((item) => item[1])
}

function sameValues(actual, expected) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index])
}

function buildCases() {
  const cases = []

  for (const scene of scenes) {
    for (const audience of audiences) {
      for (const variant of variants) {
        for (const viewport of viewports) {
          cases.push({
            id: `BASE-${scene}-${audience}-${variant}-${viewport.id}`,
            group: 'base', scene, audience, variant, viewport,
            contentProfile: 'canonical', focus: 'composición integral de la escena',
          })
        }
      }
    }
  }

  for (const scene of scenes) {
    for (const contentProfile of ['short', 'long']) {
      for (const viewport of viewports) {
        cases.push({
          id: `BOUNDARY-${scene}-${contentProfile}-${viewport.id}`,
          group: 'boundary', scene, audience: 'protagonist', variant: 'origin01-wine', viewport,
          contentProfile, focus: boundaryFocus[scene],
        })
      }
    }
  }

  return cases
}

function renderCsv(cases) {
  const header = ['id', 'group', 'scene', 'audience', 'variant', 'viewport', 'width', 'height',
    'content_profile', 'focus', 'harness_path', 'result', 'evidence', 'observation']
  const rows = cases.map(({ id, group, scene, audience, variant, viewport, contentProfile, focus }) => [
    id, group, scene, audience, variant, viewport.id, viewport.width, viewport.height,
    contentProfile, focus, `/studio/matriz/${id}`, 'pending', '', '',
  ])
  return `${[header, ...rows].map((row) => row.map(csvEscape).join(',')).join('\n')}\n`
}

function parseCsv(source) {
  const rows = []
  let row = []
  let value = ''
  let quoted = false

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index]
    if (quoted && character === '"' && source[index + 1] === '"') {
      value += '"'
      index += 1
    } else if (character === '"') {
      quoted = !quoted
    } else if (character === ',' && !quoted) {
      row.push(value)
      value = ''
    } else if (character === '\n' && !quoted) {
      row.push(value)
      rows.push(row)
      row = []
      value = ''
    } else if (character !== '\r' || quoted) {
      value += character
    }
  }

  if (quoted) throw new Error('El CSV canónico contiene una comilla sin cerrar.')
  if (row.length > 0 || value !== '') {
    row.push(value)
    rows.push(row)
  }
  return rows
}

function validateRecordedResults(current, canonicalCsv) {
  const actualRows = parseCsv(current)
  const canonicalRows = parseCsv(canonicalCsv)
  const allowedResults = new Set(['pass', 'issue', 'blocked', 'pending'])

  if (actualRows.length !== canonicalRows.length) {
    throw new Error('docs/origin01-visual-matrix.csv no contiene la cantidad canónica de filas.')
  }

  actualRows.forEach((row, index) => {
    const canonicalRow = canonicalRows[index]
    if (row.length !== canonicalRow.length || !row.slice(0, 11).every((value, column) => value === canonicalRow[column])) {
      throw new Error(`La estructura canónica difiere en la fila ${index + 1}.`)
    }
    if (index > 0 && !allowedResults.has(row[11])) {
      throw new Error(`Resultado no admitido en ${row[0]}: ${row[11]}.`)
    }
  })
}

async function validateSourceAxes() {
  const templateSource = await readFile(path.join(root, 'src', 'features', 'invitations', 'origin01', 'origin01Template.ts'), 'utf8')
  const variantsSource = await readFile(path.join(root, 'src', 'features', 'invitations', 'origin01', 'origin01ThemeVariants.ts'), 'utf8')
  const fixturesSource = await readFile(path.join(root, 'src', 'features', 'invitations', 'origin01', 'origin01VisualMatrix.ts'), 'utf8')
  const sourceScenes = extractList(templateSource, 'canonicalOrder')
  const sourceVariants = extractVariantIds(variantsSource)

  if (!sameValues(sourceScenes, scenes)) {
    throw new Error(`La matriz quedó desactualizada respecto de canonicalOrder: ${sourceScenes.join(', ')}`)
  }
  if (!sameValues(sourceVariants, variants)) {
    throw new Error(`La matriz quedó desactualizada respecto de las variantes: ${sourceVariants.join(', ')}`)
  }
  const fixtureScenes = [...fixturesSource.matchAll(/case '([^']+)':/g)].map((item) => item[1])
  if (!sameValues(fixtureScenes, scenes)) {
    throw new Error(`Los fixtures límite quedaron desactualizados respecto de las escenas: ${fixtureScenes.join(', ')}`)
  }
}

async function main() {
  await validateSourceAxes()
  const cases = buildCases()
  const csv = renderCsv(cases)
  const baseCount = cases.filter(({ group }) => group === 'base').length
  const boundaryCount = cases.filter(({ group }) => group === 'boundary').length

  if (process.argv.includes('--write')) {
    await writeFile(outputPath, csv)
    console.log(`Matriz escrita: ${baseCount} casos base + ${boundaryCount} casos límite = ${cases.length}.`)
    return
  }

  const current = await readFile(outputPath, 'utf8')
  validateRecordedResults(current, csv)
  console.log(`Matriz vigente: ${baseCount} casos base + ${boundaryCount} casos límite = ${cases.length}.`)
}

await main()
