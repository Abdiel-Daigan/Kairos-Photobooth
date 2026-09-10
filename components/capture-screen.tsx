"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { AlertTriangle } from "lucide-react"
import { useCamera } from "@/lib/use-camera"
import {
  DONE_TEXT,
  SPLASH_TEXTS,
  type Settings,
} from "@/lib/photobooth-config"

type Props = {
  settings: Settings
  onDone: (photos: string[]) => void
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))
const randomSplash = () =>
  SPLASH_TEXTS[Math.floor(Math.random() * SPLASH_TEXTS.length)] ?? "Smile!"

export function CaptureScreen({ settings, onDone }: Props) {
  const { videoRef, status, error } = useCamera(settings.deviceId)
  const [countdown, setCountdown] = useState(settings.timer)
  const [splash, setSplash] = useState(randomSplash)
  const [photoIndex, setPhotoIndex] = useState(0)
  const [flash, setFlash] = useState(false)
  const [done, setDone] = useState(false)
  const startedRef = useRef(false)

  const capture = useCallback((): string => {
    const video = videoRef.current
    if (!video) return ""
    const canvas = document.createElement("canvas")
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 960
    const ctx = canvas.getContext("2d")
    if (!ctx) return ""
    // Mirror to match the on-screen preview.
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    return canvas.toDataURL("image/png")
  }, [videoRef])

  useEffect(() => {
    if (status !== "ready" || startedRef.current) return
    startedRef.current = true
    let cancelled = false

    async function run() {
      const photos: string[] = []
      await sleep(600)
      for (let i = 0; i < settings.count; i++) {
        if (cancelled) return
        setPhotoIndex(i)
        setSplash(randomSplash())
        for (let t = settings.timer; t > 0; t--) {
          if (cancelled) return
          setCountdown(t)
          await sleep(1000)
        }
        if (cancelled) return
        setCountdown(0)
        setFlash(true)
        photos.push(capture())
        await sleep(350)
        if (cancelled) return
        setFlash(false)
        await sleep(650)
      }
      if (cancelled) return
      setDone(true)
      setSplash(DONE_TEXT)
      await sleep(1400)
      if (cancelled) return
      onDone(photos)
    }

    run()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
      className="mx-auto max-w-3xl"
    >
      <div className="relative overflow-hidden rounded-[2.5rem] border-4 border-primary/40 bg-black shadow-pop">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-[4/3] w-full -scale-x-100 object-cover"
        />

        {/* Flash overlay when a shot is captured */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.9 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="pointer-events-none absolute inset-0 bg-white"
            />
          )}
        </AnimatePresence>

        {status === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 p-6 text-center">
            <AlertTriangle className="size-10 text-destructive" />
            <p className="max-w-xs text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Photo progress dots */}
        <div className="absolute left-1/2 top-4 flex -translate-x-1/2 gap-2">
          {Array.from({ length: settings.count }).map((_, i) => (
            <span
              key={i}
              className={`size-3 rounded-full border-2 border-white/70 transition ${
                i < photoIndex || (done && true)
                  ? "bg-primary"
                  : i === photoIndex
                    ? "bg-white"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Splash text */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-4">
          <AnimatePresence mode="wait">
            <motion.p
              key={splash + photoIndex + String(done)}
              initial={{ opacity: 0, scale: 0.5, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: -3 }}
              exit={{ opacity: 0, scale: 1.3 }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="rounded-3xl bg-primary px-6 py-2 text-4xl font-bold text-primary-foreground shadow-pop-gold sm:text-5xl"
            >
              {splash}
            </motion.p>
          </AnimatePresence>

          {/* Countdown number */}
          <AnimatePresence mode="wait">
            {!done && countdown > 0 && (
              <motion.span
                key={`c-${photoIndex}-${countdown}`}
                initial={{ opacity: 0, scale: 1.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.4 }}
                className="text-8xl font-bold text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.4)] sm:text-9xl"
              >
                {countdown}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      <p className="mt-5 text-center text-sm font-semibold text-muted-foreground">
        {done
          ? "That's a wrap!"
          : `Taking picture ${photoIndex + 1} of ${settings.count}`}
      </p>
    </motion.div>
  )
}
