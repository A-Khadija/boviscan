import { useState, useCallback, useRef } from 'react'
import { Camera, Upload, Send, RotateCcw, Loader2, ChevronRight, Fingerprint, Activity } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from './utils/cn'
import { identifyCattle } from './services/dataService' // Make sure this points to your apiService if renamed
import Navbar from './components/Navbar'
import CameraComponent from './components/CameraComponent'
import UploadComponent from './components/UploadComponent'
import ResultComponent from './components/ResultComponent'
import { ThemeProvider } from './context/ThemeContext'
import './i18n/i18n'

const STEPS = [
  { id: 'input', label: 'capture', icon: Camera },
  { id: 'result', label: 'result', icon: Fingerprint },
]

function AppContent() {
  const { t, i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'

  const [activeStep, setActiveStep] = useState('input')
  const [inputMode, setInputMode] = useState('upload')
  const [imageFile, setImageFile] = useState(null)
  const [imageSrc, setImageSrc] = useState(null)
  const [result, setResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(null)
  const resultRef = useRef(null)

  // Handle camera capture - direct to result step with image
  const handleCameraCapture = useCallback((dataUrl) => {
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' })
        setImageFile(file)
        setImageSrc(dataUrl)
        setActiveStep('result')
        setResult(null)
        setError(null)
      })
  }, [])

  // Handle upload - direct to result step
  const handleUpload = useCallback((file, dataUrl) => {
    setImageFile(file)
    setImageSrc(dataUrl)
    setActiveStep('result')
    setResult(null)
    setError(null)
  }, [])

  // Handle send to API
  const handleSendToAPI = useCallback(async () => {
    if (!imageFile) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const apiResult = await identifyCattle(imageFile, (prog) => {
        setProgress(prog)
      })
      setResult(apiResult)

      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    } catch (err) {
      console.error('API Error:', err)
      setError(err.message || 'Failed to identify cattle. Please try again.')
    } finally {
      setIsLoading(false)
      setProgress(null)
    }
  }, [imageFile])

  // Handle full reset
  const handleReset = useCallback(() => {
    setActiveStep('input')
    setImageFile(null)
    setImageSrc(null)
    setResult(null)
    setError(null)
    setProgress(null)
    setInputMode('upload')
  }, [])

  const currentStepIndex = STEPS.findIndex(s => s.id === activeStep)

  const getProgressMessage = () => {
    if (!progress) return ''
    switch (progress.step) {
      case 'upload': return t('result.uploading')
      case 'predict': return t('result.sending')
      case 'result': return t('result.analyzingPattern')
      case 'database': return t('database.loading')
      default: return t('result.processingApi')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 mb-4">
            <Activity className="w-3 h-3 text-[var(--accent)]" />
            <span className="text-[11px] text-[var(--accent)] font-mono uppercase tracking-widest">
              {t('app.subtitle')}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight">
            Bovi<span className="text-[var(--accent)]">Scan</span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[var(--text-secondary)] max-w-xl mx-auto leading-relaxed">
            {t('app.description')}
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-2xl mx-auto">
          <div className={cn("flex items-center justify-center", isRTL && "flex-row-reverse")}>
            {STEPS.map((step, index) => {
              const StepIcon = step.icon
              const isActive = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.id} className={cn("flex items-center", isRTL && "flex-row-reverse")}>
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-300",
                      isCurrent
                        ? "bg-[var(--accent)]/10 border-[var(--accent)] text-[var(--accent)] shadow-[0_0_15px_var(--accent-glow)]"
                        : isActive
                          ? "bg-[var(--bg-surface)] border-[var(--border-light)] text-[var(--accent)]"
                          : "bg-[var(--bg-secondary)] border-[var(--border-color)] text-[var(--text-muted)]"
                    )}>
                      <StepIcon className="w-4 h-4" />
                    </div>
                    <span className={cn(
                      "text-[10px] font-mono uppercase tracking-wider mt-2 transition-colors",
                      isCurrent ? "text-[var(--accent)]" : isActive ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]/50"
                    )}>
                      {t(`steps.${step.label}`)}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className="w-16 sm:w-24 mx-2 mb-5">
                      <div className={cn(
                        "h-0.5 rounded-full transition-all duration-500",
                        index < currentStepIndex ? "bg-[var(--accent)]" : "bg-[var(--border-color)]"
                      )} />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-2xl mx-auto">

          {/* Step 1: Input Selection */}
          {activeStep === 'input' && (
            <div className="animate-fade-in-up space-y-6">
              {/* Mode Toggle */}
              <div className="glass-panel p-1.5 flex gap-1">
                <button
                  onClick={() => setInputMode('upload')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    inputMode === 'upload'
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  <Upload className="w-4 h-4" />
                  {t('mode.upload')}
                </button>
                <button
                  onClick={() => setInputMode('camera')}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    inputMode === 'camera'
                      ? "bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                  )}
                >
                  <Camera className="w-4 h-4" />
                  {t('mode.camera')}
                </button>
              </div>

              {/* Input Component */}
              <div className="glass-panel p-6">
                {inputMode === 'upload' ? (
                  <UploadComponent onImageSelect={handleUpload} />
                ) : (
                  <CameraComponent onCapture={handleCameraCapture} />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Result (Preview + Send + Results) */}
          {activeStep === 'result' && (
            <div className="animate-fade-in-up space-y-6">
              {/* Preview */}
              <div className="glass-panel p-6">
                <div className={cn("flex items-center justify-between mb-4", isRTL && "flex-row-reverse")}>
                  <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
                    <Fingerprint className="w-4 h-4 text-[var(--accent)]" />
                    <span className="text-xs text-[var(--text-muted)] font-mono uppercase tracking-wider">{t('result.preview')}</span>
                  </div>
                  <span className="text-[10px] text-[var(--text-muted)] font-mono">
                    {t('result.readyToAnalyze')}
                  </span>
                </div>
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]/30">
                  {imageSrc && (
                    <img
                      src={imageSrc}
                      alt="Preview"
                      className="w-full h-full object-cover opacity-80"
                    />
                  )}
                </div>

                {/* Action Buttons */}
                <div className={cn("flex items-center gap-3 mt-6", isRTL && "flex-row-reverse")}>
                  <button
                    onClick={handleReset}
                    className="btn-secondary flex items-center gap-2 flex-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('result.cancel')}
                  </button>
                  <button
                    onClick={handleSendToAPI}
                    disabled={isLoading || !imageFile}
                    className="btn-primary flex items-center gap-2 flex-1 justify-center"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {getProgressMessage()}
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {t('result.sendToApi')}
                      </>
                    )}
                  </button>
                </div>

                {/* Progress Bar */}
                {isLoading && progress && (
                  <div className="mt-4 space-y-2">
                    <div className={cn("flex items-center justify-between", isRTL && "flex-row-reverse")}>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono capitalize">{progress.step}</span>
                      <span className="text-[11px] text-[var(--accent)] font-mono">{progress.status}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-secondary)] rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-500 animate-pulse"
                        style={{ 
                          width: progress.step === 'upload' ? '25%' : progress.step === 'predict' ? '50%' : progress.step === 'result' ? '75%' : '90%' 
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Results */}
              <div ref={resultRef}>
                <ResultComponent
                  result={result}
                  isLoading={isLoading && !result}
                  error={error}
                />
              </div>

              {/* Reset after result */}
              {(result || error) && (
                <div className="flex justify-center">
                  <button
                    onClick={handleReset}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('result.newIdentification')}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border-color)]/30 py-6 px-4">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className={cn("flex items-center gap-2", isRTL && "flex-row-reverse")}>
            <div className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
            <span className="text-[11px] text-[var(--text-muted)] font-mono">
              {t('app.version')}
            </span>
          </div>
          <div className={cn("flex items-center gap-1 text-[11px] text-[var(--text-muted)]/60 font-mono", isRTL && "flex-row-reverse")}>
            <span>{t('footer.secure')}</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}