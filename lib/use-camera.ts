"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CameraStatus = "idle" | "loading" | "ready" | "error"

type UseCameraResult = {
  videoRef: React.RefObject<HTMLVideoElement | null>
  status: CameraStatus
  error: string | null
  /** Restart the stream (e.g. after a device change). */
  restart: () => void
}

/**
 * Opens a webcam stream for the given deviceId and binds it to a <video>.
 * Cleans up the stream on unmount or when the deviceId changes.
 */
export function useCamera(
  deviceId: string | null,
  enabled: boolean = true,
): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [status, setStatus] = useState<CameraStatus>("idle")
  const [error, setError] = useState<string | null>(null)
  const [nonce, setNonce] = useState(0)

  const restart = useCallback(() => setNonce((n) => n + 1), [])

  useEffect(() => {
    if (!enabled) return
    let cancelled = false

    async function start() {
      setStatus("loading")
      setError(null)
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error("This browser does not support camera access.")
        }
        const constraints: MediaStreamConstraints = {
          video: deviceId
            ? { deviceId: { exact: deviceId } }
            : { facingMode: "user" },
          audio: false,
        }
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop())
          return
        }
        streamRef.current = stream
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await videoRef.current.play().catch(() => {})
        }
        setStatus("ready")
      } catch (err) {
        if (cancelled) return
        const message =
          err instanceof DOMException && err.name === "NotAllowedError"
            ? "Camera permission was denied. Please allow access and try again."
            : err instanceof DOMException && err.name === "NotFoundError"
              ? "No camera device was found."
              : err instanceof Error
                ? err.message
                : "Could not start the camera."
        setError(message)
        setStatus("error")
      }
    }

    start()

    return () => {
      cancelled = true
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [deviceId, enabled, nonce])

  return { videoRef, status, error, restart }
}
