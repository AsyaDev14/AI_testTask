import { useState, useRef, useEffect } from 'react'
import { processImage, canvasToBase64, createMaskFromCanvas } from '../services/imageProcessingApi'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { StatusBadge } from '@/components/ui/status-badge'
import { ImageComparison } from '@/components/ImageComparison'

function ImageEditor() {
  const [originalImage, setOriginalImage] = useState<string | null>(null)
  const [editedImage, setEditedImage] = useState<string | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [brushSize, setBrushSize] = useState(30)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isErasing, setIsErasing] = useState(false)
  const [showApiKeyInput, setShowApiKeyInput] = useState(false)
  const [customApiKey, setCustomApiKey] = useState('')
  const [savedApiKey, setSavedApiKey] = useState('')
  const [tempApiKey, setTempApiKey] = useState('')

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        imageRef.current = img
        const imageDataUrl = event.target?.result as string
        setOriginalImage(imageDataUrl)
        setEditedImage(null)
      }

      img.onerror = () => {
        alert('❌ Failed to load image. Please try a different file.')
      }

      img.src = event.target?.result as string
    }

    reader.onerror = () => {
      alert('❌ Failed to read file. Please try again.')
    }

    reader.readAsDataURL(file)
  }

  useEffect(() => {
    if (!originalImage || !imageRef.current) return

    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current

    if (canvas && maskCanvas) {
      const img = imageRef.current

      const maxWidth = 800
      const maxHeight = 600
      let width = img.width
      let height = img.height

      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height)
        width = Math.floor(width * ratio)
        height = Math.floor(height * ratio)
      }

      canvas.width = width
      canvas.height = height
      maskCanvas.width = width
      maskCanvas.height = height

      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      canvas.style.display = 'block'
      maskCanvas.style.width = width + 'px'
      maskCanvas.style.height = height + 'px'

      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.clearRect(0, 0, width, height)
        ctx.drawImage(img, 0, 0, width, height)
      }

      const maskCtx = maskCanvas.getContext('2d')
      if (maskCtx) {
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      }
    }
  }, [originalImage])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    draw(e)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing && e.type !== 'mousedown' && e.type !== 'touchstart') return

    const canvas = maskCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    let clientX: number, clientY: number

    if ('touches' in e) {
      if (e.touches.length === 0) return
      clientX = e.touches[0].clientX
      clientY = e.touches[0].clientY
    } else {
      clientX = e.clientX
      clientY = e.clientY
    }

    const x = (clientX - rect.left) * scaleX
    const y = (clientY - rect.top) * scaleY

    if (isErasing) {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 1)'
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = 'rgba(255, 0, 0, 0.6)'
    }

    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.fill()
  }

  const clearMask = () => {
    const canvas = maskCanvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    setEditedImage(null)
  }

  const downloadResult = () => {
    if (!editedImage) return

    const link = document.createElement('a')
    link.href = editedImage
    link.download = `edited-image-${Date.now()}.png`
    link.click()
  }

  const handleProcessImage = async () => {
    const canvas = canvasRef.current
    const maskCanvas = maskCanvasRef.current

    if (!canvas || !maskCanvas) return

    setIsProcessing(true)

    try {
      const imageBase64 = canvasToBase64(canvas)
      const maskBase64 = createMaskFromCanvas(maskCanvas)

      const response = await processImage({
        image: imageBase64,
        mask: maskBase64,
        apiKey: savedApiKey || undefined,
      })

      if (response.success && response.processedImage) {
        setEditedImage(response.processedImage)
      } else {
        let errorMessage = response.error || 'Unknown error'

        if (errorMessage.includes('429') || errorMessage.includes('quota') || errorMessage.includes('RESOURCE_EXHAUSTED')) {
          errorMessage = '⚠️ API Quota Exceeded\n\nThe API key has reached its limit.\n\nOptions:\n1. Use your own API key (click "🔑 Set API Key" button above)\n2. Wait until tomorrow (quota resets daily)\n3. Get a free key at: https://aistudio.google.com/apikey\n\nFree tier limits:\n• 15 requests per minute\n• 1500 requests per day'
        } else if (errorMessage.includes('API_KEY_INVALID') || errorMessage.includes('API key not valid')) {
          errorMessage = '🔑 Invalid API Key\n\nThe provided API key is not valid.\n\nPlease:\n1. Click "🔑 Set API Key" button above\n2. Get a free key at: https://aistudio.google.com/apikey\n3. Enter your key and try again'
        } else if (errorMessage.includes('API key')) {
          errorMessage = '🔑 API Key Error\n\nPlease provide your own API key:\n1. Click "🔑 Set API Key" button above\n2. Get a free key at: https://aistudio.google.com/apikey'
        }

        alert(errorMessage)
      }
    } catch (error) {
      alert('❌ Failed to process image. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="w-full h-full flex flex-col gap-4 overflow-hidden">
      <div className="flex flex-wrap gap-3 p-4 bg-[var(--color-card)] rounded-lg shadow-lg flex-shrink-0 items-center border border-[var(--color-border)]">
        <div className="flex gap-2 items-center">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            📁 Upload Image
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowApiKeyInput(!showApiKeyInput)
              if (!showApiKeyInput) setTempApiKey(savedApiKey)
            }}
            className="text-xs"
          >
            {savedApiKey ? '🔑 ✓ Custom Key' : '🔑 Set API Key'}
          </Button>
        </div>

        {showApiKeyInput && (
          <div className="w-full flex gap-2 items-center p-3 bg-[var(--color-background)] rounded border border-[var(--color-border)]">
            <Label className="text-sm whitespace-nowrap">API Key:</Label>
            <input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Enter your Google Gemini API key"
              className="flex-1 px-3 py-2 bg-[var(--color-card)] border border-[var(--color-border)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open('https://aistudio.google.com/apikey', '_blank')}
            >
              Get Key
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSavedApiKey(tempApiKey)
                setShowApiKeyInput(false)
              }}
              className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white"
            >
              Save
            </Button>
          </div>
        )}

        {originalImage && (
          <>
            <div className="flex gap-3 items-center pl-4 border-l border-[var(--color-border)]">
              <Label className="flex items-center gap-3 text-sm">
                Brush Size: {brushSize}px
                <Slider
                  value={[brushSize]}
                  onValueChange={(value) => setBrushSize(value[0])}
                  min={10}
                  max={100}
                  step={1}
                  className="w-32"
                />
              </Label>
            </div>

            <div className="flex gap-2 pl-4 border-l border-[var(--color-border)]">
              <Button
                variant={!isErasing ? 'default' : 'secondary'}
                onClick={() => setIsErasing(false)}
              >
                ✏️ Draw Mask
              </Button>
              <Button
                variant={isErasing ? 'default' : 'secondary'}
                onClick={() => setIsErasing(true)}
              >
                🧹 Erase Mask
              </Button>
            </div>

            <div className="flex gap-2 pl-4 border-l border-[var(--color-border)]">
              <Button
                variant="outline"
                onClick={clearMask}
              >
                🗑️ Clear All
              </Button>
              <Button
                onClick={handleProcessImage}
                disabled={isProcessing}
                className="bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white"
              >
                {isProcessing ? '⏳ Processing...' : '✨ Remove Artifacts'}
              </Button>
              {editedImage && (
                <Button
                  variant="secondary"
                  onClick={handleProcessImage}
                  disabled={isProcessing}
                >
                  🔄 Re-generate
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="flex-1 bg-[var(--color-card)] rounded-lg p-4 shadow-lg overflow-hidden flex flex-col border border-[var(--color-border)]">
        {!originalImage ? (
          <div className="flex-1 flex items-center justify-center text-[var(--color-muted-foreground)] text-xl">
            <div className="text-center">
              <p className="text-6xl mb-4">📸</p>
              <p className="text-2xl font-semibold mb-2">No Image Loaded</p>
              <p className="text-base opacity-70">👆 Click "Upload Image" to get started</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden">
            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">📷 Original Image</h3>
                <StatusBadge>✓ Loaded</StatusBadge>
              </div>
              <div className="text-center py-2 px-3 bg-[var(--color-primary)] text-white rounded-md text-sm font-semibold">
                {isErasing ? '🧹 Erasing mode' : '✏️ Drawing mode'} - Brush size: {brushSize}px
              </div>
              <div className="flex-1 relative border-2 border-[var(--color-border)] rounded-lg overflow-auto flex items-center justify-center bg-[var(--color-background)] min-h-0">
                <div className="relative p-4">
                  <canvas
                    ref={canvasRef}
                    className="block"
                    style={{
                      imageRendering: 'auto',
                      display: 'block',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                  <canvas
                    ref={maskCanvasRef}
                    className="absolute cursor-crosshair touch-none select-none"
                    style={{
                      top: '16px',
                      left: '16px'
                    }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 overflow-hidden">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">✨ Before / After Comparison</h3>
                {editedImage && <StatusBadge>✓ Processed</StatusBadge>}
              </div>
              <div className="flex-1 relative border-2 border-[var(--color-border)] rounded-lg overflow-auto flex items-center justify-center bg-[var(--color-background)] min-h-0">
                {editedImage ? (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <ImageComparison
                      beforeImage={originalImage}
                      afterImage={editedImage}
                      width={canvasRef.current?.width || 800}
                      height={canvasRef.current?.height || 600}
                    />
                  </div>
                ) : (
                  <div className="text-center text-[var(--color-muted-foreground)]">
                    <p className="text-6xl mb-4">⏳</p>
                    <p className="text-lg font-semibold mb-2">Waiting for Processing</p>
                    <p className="text-sm opacity-70">Click "Remove Artifacts" to process</p>
                  </div>
                )}
              </div>
              {editedImage && (
                <div className="flex gap-2">
                  <Button
                    onClick={downloadResult}
                    className="flex-1 bg-[var(--color-success)] hover:bg-[var(--color-success)]/90 text-white"
                  >
                    💾 Download Result
                  </Button>
                </div>
              )}
              {editedImage && (
                <div className="text-center text-xs text-[var(--color-muted-foreground)] py-2 bg-[var(--color-secondary)] rounded px-2">
                  👆 Drag the slider to compare Before/After
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ImageEditor

