import { useState, useRef, useCallback, useEffect } from 'react'

export function useCamera() {
  const [stream, setStream] = useState(null)
  const [isActive, setIsActive] = useState(false)
  const [error, setError] = useState(null)
  const videoRef = useRef(null)
  const canvasRef = useRef(null)

  const startCamera = useCallback(async () => {
    try {
      setError(null)
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      })

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        try {
          await videoRef.current.play()
        } catch (playError) {
          console.warn('Video playback failed:', playError)
        }
      }

      setStream(mediaStream)
      setIsActive(true)
    } catch (err) {
      console.error('Camera error:', err)
      setError(err.message || 'Failed to access camera')
      setIsActive(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
    }
    setStream(null)
    setIsActive(false)
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  useEffect(() => {
    if (!stream || !videoRef.current) return

    videoRef.current.srcObject = stream
    videoRef.current.play().catch((playError) => {
      console.warn('Video playback failed after mount:', playError)
    })
  }, [stream])

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null

    const video = videoRef.current
    const canvas = canvasRef.current

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

    return canvas.toDataURL('image/jpeg', 0.95)
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [stream])

  return {
    videoRef,
    canvasRef,
    stream,
    isActive,
    error,
    startCamera,
    stopCamera,
    capturePhoto
  }
}
