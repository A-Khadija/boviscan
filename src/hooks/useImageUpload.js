import { useState, useCallback } from 'react'
import { readFileAsDataURL } from '../utils/imageUtils'

export function useImageUpload() {
  const [image, setImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState(null)

  const handleFile = useCallback(async (file) => {
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB')
      return
    }

    try {
      setError(null)
      const dataUrl = await readFileAsDataURL(file)
      setImage(file)
      setPreviewUrl(dataUrl)
    } catch (err) {
      setError('Failed to read image file')
      console.error(err)
    }
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const handleInputChange = useCallback((e) => {
    const files = e.target.files
    if (files.length > 0) {
      handleFile(files[0])
    }
  }, [handleFile])

  const reset = useCallback(() => {
    setImage(null)
    setPreviewUrl(null)
    setError(null)
    setIsDragging(false)
  }, [])

  return {
    image,
    previewUrl,
    isDragging,
    error,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleInputChange,
    reset,
    setImage,
    setPreviewUrl
  }
}
