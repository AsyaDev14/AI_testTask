const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyBaGQrVq9fGeD7FQKYRX5KkGkULxGaGylg'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

export interface ProcessImageRequest {
  image: string
  mask: string
  apiKey?: string
}

export interface ProcessImageResponse {
  success: boolean
  processedImage?: string
  error?: string
}

async function geminiProcessImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  const apiKey = request.apiKey || GEMINI_API_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured. Please add it to your .env file or provide a custom API key.'
    }
  }

  try {
    const cleanImageBase64 = request.image.replace(/^data:image\/\w+;base64,/, '')
    const cleanMaskBase64 = request.mask.replace(/^data:image\/\w+;base64,/, '')

    const prompt = `You are editing an image using a mask.
The white areas of the mask indicate regions that should be modified.
Remove or replace any unwanted objects or visual artifacts only in the masked areas.
Keep all other unmasked parts of the image unchanged.
Do not change lighting, colors, or composition in unmasked regions.
Fill the removed area with a natural background consistent with the surrounding image.`

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/png',
              data: cleanImageBase64
            }
          },
          {
            inline_data: {
              mime_type: 'image/png',
              data: cleanMaskBase64
            }
          }
        ]
      }]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        const imageData = part.inline_data?.data || part.inlineData?.data
        if (imageData) {
          return {
            success: true,
            processedImage: `data:image/png;base64,${imageData}`
          }
        }
      }
    }

    throw new Error('No image data in API response. Please try a different image or prompt.')
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

export async function processImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  return geminiProcessImage(request)
}

export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

export function createMaskFromCanvas(canvas: HTMLCanvasElement): string {
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height

  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return ''

  ctx.drawImage(canvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]

    if (alpha > 0) {
      data[i] = 255
      data[i + 1] = 255
      data[i + 2] = 255
      data[i + 3] = 255
    } else {
      data[i] = 0
      data[i + 1] = 0
      data[i + 2] = 0
      data[i + 3] = 255
    }
  }

  ctx.putImageData(imageData, 0, 0)

  return tempCanvas.toDataURL('image/png')
}
