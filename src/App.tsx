import ImageEditor from './components/ImageEditor'

function App() {
  return (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <header className="bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary)] text-[var(--color-primary-foreground)] px-8 py-4 text-center shadow-lg flex-shrink-0">
        <h1 className="text-2xl font-bold mb-1">Image Artifact Remover</h1>
        <p className="text-sm opacity-90">Upload an image, mark artifacts with a brush, and get a corrected photo</p>
      </header>
      <main className="flex-1 flex overflow-hidden p-4">
        <ImageEditor />
      </main>
    </div>
  )
}

export default App
