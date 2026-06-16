import { useState, useCallback, useRef } from 'react'
import { Camera, X, Aperture, Zap, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../utils/cn'
import { useCamera } from '../hooks/useCamera'

export default function CameraComponent({ onCapture, className }) {
  const { t } = useTranslation()
  const { videoRef, canvasRef, isActive, error, startCamera, stopCamera, capturePhoto } = useCamera()
  const [capturedImage, setCapturedImage] = useState(null)
  const [showPopup, setShowPopup] = useState(false)
  const [isStarting, setIsStarting] = useState(false)

  const handleStartCamera = useCallback(async () => {
    setShowPopup(true)
  }, [])

  const handlePopupConfirm = useCallback(async () => {
    setShowPopup(false)
    setIsStarting(true)
    try {
      await startCamera()
    } catch (err) {
      console.error('Camera start failed:', err)
    } finally {
      setIsStarting(false)
    }
  }, [startCamera])

  const handlePopupCancel = useCallback(() => {
    setShowPopup(false)
  }, [])

  const handleCapture = useCallback(() => {
    const photo = capturePhoto()
    if (photo) {
      setCapturedImage(photo)
      stopCamera()
    }
  }, [capturePhoto, stopCamera])

  const handleRetake = useCallback(() => {
    setCapturedImage(null)
    startCamera()
  }, [startCamera])

  const handleConfirm = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage)
    }
  }, [capturedImage, onCapture])

  const handleCancel = useCallback(() => {
    setCapturedImage(null)
    stopCamera()
  }, [stopCamera])

  return (
    <div className={cn("w-full", className)}>
      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-panel max-w-md w-full p-6 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center border border-[var(--accent)]/20">
                <Info className="w-5 h-5 text-[var(--accent)]" />
              </div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                {t('camera.popupTitle')}
              </h3>
            </div>
            <div className="mb-6">
              <div className="space-y-2.5">
                {t('camera.popupText').split('\n').map((line, idx) => {
                  if (line.startsWith('•') || line.startsWith('-')) {
                    return (
                      <div key={idx} className="flex gap-2.5 text-sm text-[var(--text-secondary)] leading-relaxed">
                        <span className="text-[var(--accent)] font-bold mt-0.5 flex-shrink-0">•</span>
                        <span>{line.replace(/^[•-]\s*/, '')}</span>
                      </div>
                    )
                  } else if (line.includes('⚠️')) {
                    return (
                      <div key={idx} className="mt-3 p-2.5 rounded-lg bg-[var(--warning)]/5 border border-[var(--warning)]/20">
                        <p className="text-xs text-[var(--warning)] font-medium">{line}</p>
                      </div>
                    )
                  } else if (line.trim()) {
                    return (
                      <p key={idx} className="text-sm text-[var(--text-secondary)] font-medium">
                        {line}
                      </p>
                    )
                  }
                  return null
                })}
              </div>
            </div>
            <div className="flex">
              <button
                onClick={handlePopupConfirm}
                className="btn-primary w-full"
              >
                {t('camera.popupConfirm')}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]/50">
        {/* Hidden canvas for capture */}
        <canvas ref={canvasRef} className="hidden" />

        {/* Video stream or captured image */}
        {!capturedImage ? (
          <>
            {isActive ? (
              <div className="relative w-full h-full">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                  style={{ transform: 'scaleX(-1)' }}
                />
                {/* Scan overlay effect */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute inset-0 scan-overlay animate-scan-line" />
                  {/* Corner brackets */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-[var(--accent)]/60" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-[var(--accent)]/60" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-[var(--accent)]/60" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-[var(--accent)]/60" />
                  {/* Center crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className="w-6 h-6 border border-[var(--accent)]/40 rounded-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full" />
                    </div>
                  </div>
                </div>
                {/* Live indicator */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 bg-black/60 backdrop-blur-sm rounded-full border border-white/10">
                  <div className="w-2 h-2 rounded-full bg-[var(--error)] animate-pulse" />
                  <span className="text-xs font-mono text-white/80">{t('camera.live')}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                {error ? (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--error)]/10 flex items-center justify-center border border-[var(--error)]/20">
                      <X className="w-8 h-8 text-[var(--error)]" />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-sm text-[var(--error)] font-medium">{error}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{t('camera.permissionDenied')}</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border-color)]">
                      <Camera className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                    <p className="text-sm text-[var(--text-muted)]">{t('camera.error')}</p>
                  </>
                )}
              </div>
            )}
          </>
        ) : (
          <img
            src={capturedImage}
            alt="Captured"
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 mt-4">
        {!isActive && !capturedImage && (
          <button
            onClick={handleStartCamera}
            disabled={isStarting}
            className="btn-primary flex items-center gap-2"
          >
            {isStarting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Camera className="w-4 h-4" />
            )}
            {isStarting ? '...' : t('camera.startCamera')}
          </button>
        )}

        {isActive && !capturedImage && (
          <>
            <button
              onClick={handleCapture}
              className="relative group"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--accent)]/10 border-2 border-[var(--accent)] flex items-center justify-center transition-all duration-200 group-hover:bg-[var(--accent)]/20 group-hover:scale-105 active:scale-95">
                <Aperture className="w-7 h-7 text-[var(--accent)]" />
              </div>
              <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] text-[var(--text-muted)] font-mono whitespace-nowrap">
                {t('camera.capture').toUpperCase()}
              </span>
            </button>
            <button
              onClick={stopCamera}
              className="btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              {t('camera.cancel')}
            </button>
          </>
        )}

        {capturedImage && (
          <>
            <button
              onClick={handleRetake}
              className="btn-secondary flex items-center gap-2"
            >
              <Camera className="w-4 h-4" />
              {t('camera.retake')}
            </button>
            <button
              onClick={handleConfirm}
              className="btn-primary flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              {t('camera.usePhoto')}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
