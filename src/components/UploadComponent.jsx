import { useRef, useCallback } from 'react'
import { Upload, X, FileImage } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '../utils/cn'
import { useImageUpload } from '../hooks/useImageUpload'

export default function UploadComponent({ onImageSelect, className }) {
  const { t } = useTranslation()
  const fileInputRef = useRef(null)
  const { 
    previewUrl, 
    isDragging, 
    error, 
    handleDragOver, 
    handleDragLeave, 
    handleDrop, 
    handleInputChange,
    reset 
  } = useImageUpload()

  const handleClear = useCallback(() => {
    reset()
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [reset])

  const handleFileDrop = useCallback((e) => {
    handleDrop(e)
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        onImageSelect(files[0], ev.target.result)
      }
      reader.readAsDataURL(files[0])
    }
  }, [handleDrop, onImageSelect])

  const handleFileInput = useCallback((e) => {
    handleInputChange(e)
    const files = e.target.files
    if (files.length > 0) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        onImageSelect(files[0], ev.target.result)
      }
      reader.readAsDataURL(files[0])
    }
  }, [handleInputChange, onImageSelect])

  return (
    <div className={cn("w-full", className)}>
      {!previewUrl ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleFileDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "relative aspect-[4/3] rounded-2xl border-2 border-dashed cursor-pointer",
            "flex flex-col items-center justify-center gap-4 transition-all duration-300",
            isDragging 
              ? "border-[var(--accent)] bg-[var(--accent)]/5 scale-[1.02]" 
              : "border-[var(--border-color)] bg-[var(--bg-secondary)] hover:border-[var(--border-light)] hover:bg-[var(--bg-surface)]/50"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="hidden"
          />

          <div className={cn(
            "w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300",
            isDragging ? "bg-[var(--accent)]/20" : "bg-[var(--bg-surface)]"
          )}>
            <Upload className={cn(
              "w-8 h-8 transition-colors duration-300",
              isDragging ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
            )} />
          </div>

          <div className="text-center px-6">
            <p className="text-sm font-medium text-[var(--text-secondary)]">
              {isDragging ? t('upload.dropHere') : t('upload.dragDrop')}
            </p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {t('upload.formats')}
            </p>
          </div>

          {isDragging && (
            <div className="absolute inset-0 rounded-2xl bg-[var(--accent)]/5 animate-pulse pointer-events-none" />
          )}
        </div>
      ) : (
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border-color)]/50 group">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleClear()
              }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--error)]/20 border border-[var(--error)]/30 text-[var(--error)] text-sm font-medium hover:bg-[var(--error)]/30 transition-colors"
            >
              <X className="w-4 h-4" />
              {t('upload.remove')}
            </button>
          </div>

          <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-sm border border-white/10">
            <FileImage className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="text-[11px] text-white/80 font-mono">{t('upload.ready')}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20">
          <X className="w-4 h-4 text-[var(--error)] shrink-0" />
          <span className="text-xs text-[var(--error)]">{error}</span>
        </div>
      )}
    </div>
  )
}
