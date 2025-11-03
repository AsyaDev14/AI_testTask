/**
 * Image Processing API Service
 *
 * Integrates with Google Gemini 2.5 Flash Image (Nano Banana) API
 * Documentation: https://ai.google.dev/gemini-api/docs/image-generation
 *
 * Gemini uses "semantic masking" - instead of pixel masks, we describe what to remove
 */

// For demo purposes, API key is embedded. In production, use backend proxy.
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAhpLuOcCUjToJTmn1zWA47R9mfQcge18M'
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent'

export interface ProcessImageRequest {
  image: string // Base64 encoded image
  mask: string  // Base64 encoded mask (not used by Gemini, but kept for compatibility)
}

export interface ProcessImageResponse {
  success: boolean
  processedImage?: string // Base64 encoded result
  error?: string
}

/**
 * Process image using Google Gemini 2.5 Flash Image (Nano Banana)
 */
async function geminiProcessImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  if (!GEMINI_API_KEY) {
    return {
      success: false,
      error: 'GEMINI_API_KEY not configured. Please add it to your .env file.'
    }
  }

  try {
    // Remove data:image/png;base64, prefix if present
    const cleanImageBase64 = request.image.replace(/^data:image\/\w+;base64,/, '')

    // Simple, direct prompt for image editing
    const prompt = `Edit this image to remove any visual imperfections, scratches, blemishes, or unwanted elements. Keep everything else the same.`

    const requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'image/png',
              data: cleanImageBase64
            }
          }
        ]
      }]
    }

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Gemini API error:', errorText)
      throw new Error(`API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Extract the generated image from the response
    // API may return both text and image - we only care about the image
    if (data.candidates && data.candidates[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        // Check for inline_data (snake_case) or inlineData (camelCase)
        const imageData = part.inline_data?.data || part.inlineData?.data
        if (imageData) {
          return {
            success: true,
            processedImage: `data:image/png;base64,${imageData}`
          }
        }
      }
    }

    // If we get here, no image was found in the response
    console.error('No image in API response:', JSON.stringify(data, null, 2))
    throw new Error('No image data in API response. Please try a different image or prompt.')
  } catch (error) {
    console.error('Error processing image:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Main API function - processes image with mask
 * PRODUCTION MODE: Only uses real Google Gemini API
 */
export async function processImage(
  request: ProcessImageRequest
): Promise<ProcessImageResponse> {
  // API key is embedded for demo purposes
  return geminiProcessImage(request)
}

/**
 * Helper to convert canvas to base64
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png')
}

/**
 * Helper to create mask from canvas
 * Converts red mask overlay to black/white mask for API
 */
export function createMaskFromCanvas(canvas: HTMLCanvasElement): string {
  const tempCanvas = document.createElement('canvas')
  tempCanvas.width = canvas.width
  tempCanvas.height = canvas.height
  
  const ctx = tempCanvas.getContext('2d')
  if (!ctx) return ''
  
  // Draw the mask canvas
  ctx.drawImage(canvas, 0, 0)
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // Convert to black and white mask
  // Red areas (mask) become white, transparent areas become black
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3]
    
    if (alpha > 0) {
      // Has mask - make white
      data[i] = 255     // R
      data[i + 1] = 255 // G
      data[i + 2] = 255 // B
      data[i + 3] = 255 // A
    } else {
      // No mask - make black
      data[i] = 0       // R
      data[i + 1] = 0   // G
      data[i + 2] = 0   // B
      data[i + 3] = 255 // A
    }
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  return tempCanvas.toDataURL('image/png')
}

