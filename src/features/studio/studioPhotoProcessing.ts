import type { StudioImageMedia } from './studioMedia'

export const studioPhotoMimeTypes = ['image/jpeg', 'image/png', 'image/webp'] as const
export const studioPhotoMaxBytes = 12 * 1024 * 1024
export const studioPhotoMaxDimension = 2_000

export type StudioPhotoFileMetadata = {
  readonly name: string
  readonly type: string
  readonly size: number
}

export type StudioProcessedPhoto = {
  readonly blob: Blob
  readonly mimeType: string
  readonly width: number
  readonly height: number
}

export function validateStudioPhotoFile(file: StudioPhotoFileMetadata): string | null {
  if (!studioPhotoMimeTypes.includes(file.type as (typeof studioPhotoMimeTypes)[number])) {
    return 'Elegí una imagen JPG, PNG o WebP.'
  }
  if (file.size <= 0) return 'La imagen está vacía.'
  if (file.size > studioPhotoMaxBytes) return 'La imagen supera el límite de 12 MB.'
  return null
}

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const image = new Image()
  image.onload = () => resolve(image)
  image.onerror = () => reject(new Error('No pudimos leer la imagen.'))
  image.src = src
})

const canvasBlob = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality))

export async function processStudioPhoto(file: File): Promise<StudioProcessedPhoto> {
  const validationError = validateStudioPhotoFile(file)
  if (validationError) throw new Error(validationError)

  const sourceUrl = URL.createObjectURL(file)
  try {
    const image = await loadImage(sourceUrl)
    const scale = Math.min(1, studioPhotoMaxDimension / Math.max(image.naturalWidth, image.naturalHeight))
    const width = Math.max(1, Math.round(image.naturalWidth * scale))
    const height = Math.max(1, Math.round(image.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) throw new Error('El navegador no pudo preparar la imagen.')
    context.drawImage(image, 0, 0, width, height)
    const webp = await canvasBlob(canvas, 'image/webp', .86)
    const blob = webp ?? await canvasBlob(canvas, 'image/jpeg', .88)
    if (!blob) throw new Error('No pudimos comprimir la imagen.')
    return { blob, mimeType: blob.type || 'image/jpeg', width, height }
  } finally {
    URL.revokeObjectURL(sourceUrl)
  }
}

export function createPendingStudioPhoto(
  id: string,
  file: StudioPhotoFileMetadata,
  alt: string,
): StudioImageMedia {
  return {
    id,
    kind: 'image',
    origin: 'studio',
    originalName: file.name,
    mimeType: file.type,
    sizeBytes: file.size,
    accessibility: { kind: 'informative', alt },
    status: 'pending',
  }
}
