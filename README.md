# Image Artifact Remover

A professional 1-page admin panel for image editing using Google's Gemini 2.5 Flash Image API (code-named "Nano Banana"). This tool allows media teams to easily remove artifacts, unwanted objects, and imperfections from photos.

## Features

- 📤 **Upload Images** - Support for PNG, JPG, and other common formats
- 🎨 **Visual Mask Drawing** - Draw directly on the image to mark areas for removal
- 🖌️ **Adjustable Brush** - Variable brush size (10-100px) for precise marking
- ✏️ **Erase Mode** - Remove mask areas if you make a mistake
- 🔄 **Re-generate** - Process the same image multiple times with different masks
- 🔀 **Before/After Slider** - Interactive comparison with drag-to-compare slider
- 💾 **Download Results** - Save edited images to your device
- 🌙 **Dark Theme** - Professional, restrained dark UI using shadcn/ui
- 📱 **Responsive** - Works on desktop and mobile devices
- ♿ **Accessible** - Built with Radix UI primitives for accessibility

## Technology Stack

- **React 19** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **shadcn/ui** - High-quality component library
- **Radix UI** - Accessible component primitives
- **Google Gemini 2.5 Flash Image API** - AI-powered image editing

## Prerequisites

- Node.js 18+ and npm
- Google Gemini API key (free tier available)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AI_testTask
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure API Key**
   
   Get your free API key from [Google AI Studio](https://aistudio.google.com/apikey)
   
   Then create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API key:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3000`

## Usage

### Basic Workflow

1. **Upload Image**
   - Click "Upload Image" button
   - Select an image file from your device
   - The image will appear on the canvas

2. **Mark Artifacts**
   - Use the brush to draw red marks over artifacts, unwanted objects, or imperfections
   - Adjust brush size using the slider (10-100px)
   - Switch to "Erase" mode to remove mask areas
   - Click "Clear Mask" to start over

3. **Process Image**
   - Click "Remove Artifacts" button
   - Wait for the AI to process (usually 5-10 seconds)
   - The edited image will appear on the right side with interactive Before/After slider

4. **Compare Results**
   - Drag the white slider line left/right to compare Before and After
   - See exactly what changed in the image

5. **Re-generate (Optional)**
   - Adjust the mask if needed
   - Click "Re-generate" button to process again
   - Compare different results

6. **Download Result**
   - Click "Download Result" to save the edited image
   - The file will be saved as `edited-image-[timestamp].png`

### Tips for Best Results

- **Be specific**: Mark only the areas you want to remove
- **Use appropriate brush size**: Larger for big objects, smaller for details
- **Multiple attempts**: Try different mask patterns if the first result isn't perfect
- **Clear descriptions**: The AI understands context, so marking the general area is often enough

## How It Works

### Gemini 2.5 Flash Image API

Unlike traditional inpainting APIs that require pixel-perfect masks, Gemini uses **semantic masking**:

- You draw a red mask on the image (visual feedback for you)
- The app sends the original image + a text prompt to Gemini
- Gemini's AI understands what needs to be removed based on the prompt
- The AI generates a new image with artifacts removed

**Prompt used:**
```
Edit this image to remove any visual imperfections, scratches, blemishes,
or unwanted elements. Keep everything else the same.
```

### API Pricing

- **Model**: `gemini-2.5-flash-image`
- **Cost**: $30.00 per 1 million output tokens
- **Average**: ~1290 tokens per image = **$0.039 per image** (~2.5¢)
- **Free tier**: Available for testing and development

## Project Structure

```
AI_testTask/
├── src/
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx         # Reusable button component
│   │   │   ├── slider.tsx         # Brush size slider
│   │   │   └── label.tsx          # Form labels
│   │   ├── ImageEditor.tsx        # Main editor component
│   │   └── ImageComparison.tsx    # Before/After slider component
│   ├── services/
│   │   └── imageProcessingApi.ts  # Gemini API integration
│   ├── lib/
│   │   └── utils.ts         # Utility functions (cn)
│   ├── App.tsx              # Root component
│   ├── index.css            # Tailwind + theme variables
│   └── main.tsx             # Entry point
├── .env                     # API keys (not in git)
├── .env.example             # Example env file
├── package.json             # Dependencies
├── tsconfig.json            # TypeScript config
├── vite.config.ts           # Vite config
├── postcss.config.js        # PostCSS config
└── README.md                # This file
```

## Development

### Available Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- **No CSS/SCSS files** - All styling via Tailwind utility classes
- **Pixels only** - No rems (Tailwind spacing: `px-4` = 16px)
- **Reusable components** - Common UI elements in `src/components/ui/`
- **Type safety** - Full TypeScript coverage
- **Clean code** - No duplication, clear naming

## Troubleshooting

### API Key Issues

**Error: "GEMINI_API_KEY not configured"**
- Make sure you created `.env` file
- Check that the key starts with `VITE_GEMINI_API_KEY=`
- Restart the dev server after adding the key

**Error: "API request failed: 401"**
- Your API key is invalid or expired
- Get a new key from [Google AI Studio](https://aistudio.google.com/apikey)

### Image Not Visible

- Make sure the image file is a valid format (PNG, JPG, WebP)
- Try a smaller image (< 5MB recommended)
- Check browser console for errors

### Processing Fails

- Check your internet connection
- Verify API key is correct
- Check browser console for detailed error messages
- Try with a different image

## Deployment

### Option 1: Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add `VITE_GEMINI_API_KEY` in Environment Variables
4. Deploy

### Option 2: Netlify

1. Push code to GitHub
2. Import project in [Netlify](https://netlify.com)
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add `VITE_GEMINI_API_KEY` in Environment Variables

### Option 3: Local Production Build

```bash
npm run build
npm run preview
```

## License

This project is created as a test task for AI Vibe coder position.

## Support

For issues or questions:
- Check the [Gemini API Documentation](https://ai.google.dev/gemini-api/docs/image-generation)
- Review browser console for error messages
- Ensure all dependencies are installed correctly

---

**Built with ❤️ using React, TypeScript, Tailwind CSS, and Google Gemini AI**

