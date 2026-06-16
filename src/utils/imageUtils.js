/**
 * Create an image element from a URL
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.setAttribute('crossOrigin', 'anonymous')
    image.src = url
  })
}

/**
 * Convert degrees to radians
 */
function getRadianAngle(degreeValue) {
  return (degreeValue * Math.PI) / 180
}

/**
 * Calculate bounding box size after rotation
 */
function rotateSize(width, height, rotation) {
  const rotRad = getRadianAngle(rotation)
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  }
}

/**
 * Convert a cropped canvas area to a Blob
 * Handles rotation properly
 */
export async function getCroppedImg(imageSrc, pixelCrop, rotation = 0, flip = { horizontal: false, vertical: false }) {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Canvas context not available')
  }

  const rotRad = getRadianAngle(rotation)

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  )

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth
  canvas.height = bBoxHeight

  // Translate canvas context to center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2)
  ctx.rotate(rotRad)
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1)
  ctx.translate(-image.width / 2, -image.height / 2)

  // Draw the image
  ctx.drawImage(image, 0, 0)

  // Extract the cropped area
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  )

  // Set canvas to cropped size
  canvas.width = pixelCrop.width
  canvas.height = pixelCrop.height

  // Place cropped image data
  ctx.putImageData(data, 0, 0)

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas to Blob conversion failed'))
        return
      }
      resolve(blob)
    }, 'image/jpeg', 0.95)
  })
}

/**
 * Convert Blob to File with a name
 */
export function blobToFile(blob, fileName = 'cropped-image.jpg') {
  return new File([blob], fileName, { type: blob.type || 'image/jpeg' })
}

/**
 * Read file as data URL
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.onerror = (e) => reject(e)
    reader.readAsDataURL(file)
  })
}

/**
 * Create object URL from blob
 */
export function createObjectURL(blob) {
  return URL.createObjectURL(blob)
}

/**
 * Revoke object URL to prevent memory leaks
 */
export function revokeObjectURL(url) {
  URL.revokeObjectURL(url)
}
