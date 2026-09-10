"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import {
  AlertTriangle,
  Camera,
  Minus,
  Plus,
  RefreshCw,
  Timer,
  Video,
} from "lucide-react"
import { useCamera } from "@/lib/use-camera"
import {
  DEFAULT_TIMER,
  MAX_TIMER,
  MIN_TIMER,
  PICTURE_COUNT_OPTIONS,
  SHORT_TIMER_WARNING_THRESHOLD,
  type Settings,
} from "@/lib/photobooth-config"

type Props = {
  settings: Settings
  onChange: (next: Settings) => void
  onStart: () => void
}

export function SetupScreen({ settings, onChange, onStart }: Props) {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const { videoRef, status, error, restart } = useCamera(settings.deviceId)

  // Enumerate cameras once permission has been granted.
  useEffect(() => {
    if (status !== "ready") return
    let active = true
    navigator.mediaDevices.enumerateDevices().then((all) => {
      if (!active) return
      const cams = all.filter((d) => d.kind === "videoinput")
      setDevices(cams)
      // Adopt the active device id if none selected yet.
      if (!settings.deviceId && cams[0]?.deviceId) {
        onChange({ ...settings, deviceId: cams[0].deviceId })
      }
    })
    return () => {
      active = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const cameraFailed = status === "error"
  const timerTooShort = settings.timer < SHORT_TIMER_WARNING_THRESHOLD
  const canStart = status === "ready" && !cameraFailed

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="grid gap-6 lg:grid-cols-[1.3fr_1fr]"
    >
      {/* Camera preview */}
      <div className="relative overflow-hidden rounded-[2rem] border-4 border-primary/40 bg-black shadow-pop">
        <video
          ref={videoRef}
          playsInline
          muted
          className="aspect-[4/3] w-full -scale-x-100 object-cover"
        />
        {status !== "ready" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-card/90 p-6 text-center">
            {cameraFailed ? (
              <>
                <AlertTriangle className="size-10 text-destructive" />
                <p className="max-w-xs text-sm font-medium text-foreground">
                  {error}
                </p>
                <button
                  onClick={restart}
                  className="mt-1 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-pop-gold transition active:translate-y-1"
                >
                  <RefreshCw className="size-4" /> Try again
                </button>
              </>
            ) : (
              <>
                <Camera className="size-10 animate-pulse text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Starting camera…
                </p>
              </>
            )}
          </div>
        )}
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground shadow-pop-gold">
          Live preview
        </span>
      </div>

      {/* Controls */}
      <div className="flex flex-col gap-5">
        {/* Camera device */}
        <section className="rounded-[1.75rem] border-4 border-primary/20 bg-card p-5 shadow-pop">
          <label className="mb-2 flex items-center gap-2 text-sm font-bold text-primary">
            <Video className="size-4" /> Camera device
          </label>
          <select
            value={settings.deviceId ?? ""}
            onChange={(e) => onChange({ ...settings, deviceId: e.target.value })}
            className="w-full cursor-pointer rounded-2xl border-2 border-primary/30 bg-secondary px-4 py-3 text-sm font-medium text-foreground outline-none focus-visible:border-primary"
          >
            {devices.length === 0 && (
              <option value="">Waiting for camera access…</option>
            )}
            {devices.map((d, i) => (
              <option key={d.deviceId} value={d.deviceId}>
                {d.label || `Camera ${i + 1}`}
              </option>
            ))}
          </select>
        </section>

        {/* Timer */}
        <section className="rounded-[1.75rem] border-4 border-primary/20 bg-card p-5 shadow-pop">
          <div className="mb-3 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm font-bold text-primary">
              <Timer className="size-4" /> Countdown timer
            </label>
            <span className="rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground">
              {settings.timer}s
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Stepper
              label="Decrease timer"
              onClick={() =>
                onChange({
                  ...settings,
                  timer: Math.max(MIN_TIMER, settings.timer - 1),
                })
              }
              disabled={settings.timer <= MIN_TIMER}
            >
              <Minus className="size-4" />
            </Stepper>
            <input
              type="range"
              min={MIN_TIMER}
              max={MAX_TIMER}
              value={settings.timer}
              onChange={(e) =>
                onChange({ ...settings, timer: Number(e.target.value) })
              }
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-secondary accent-primary"
              aria-label="Countdown seconds per picture"
            />
            <Stepper
              label="Increase timer"
              onClick={() =>
                onChange({
                  ...settings,
                  timer: Math.min(MAX_TIMER, settings.timer + 1),
                })
              }
              disabled={settings.timer >= MAX_TIMER}
            >
              <Plus className="size-4" />
            </Stepper>
          </div>
          {timerTooShort && (
            <p className="mt-3 flex items-center gap-2 rounded-2xl bg-destructive/15 px-3 py-2 text-xs font-semibold text-destructive">
              <AlertTriangle className="size-4 shrink-0" />
              That&apos;s a quick countdown — you might not have time to pose!
            </p>
          )}
        </section>

        {/* Picture count */}
        <section className="rounded-[1.75rem] border-4 border-primary/20 bg-card p-5 shadow-pop">
          <label className="mb-3 flex items-center gap-2 text-sm font-bold text-primary">
            <Camera className="size-4" /> Number of pictures
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PICTURE_COUNT_OPTIONS.map((n) => {
              const active = settings.count === n
              return (
                <button
                  key={n}
                  onClick={() => onChange({ ...settings, count: n })}
                  className={`rounded-2xl border-4 py-4 text-2xl font-bold transition active:translate-y-1 ${
                    active
                      ? "border-primary bg-primary text-primary-foreground shadow-pop-gold"
                      : "border-primary/20 bg-secondary text-foreground hover:border-primary/50"
                  }`}
                  aria-pressed={active}
                >
                  {n}
                </button>
              )
            })}
          </div>
        </section>

        {/* Start */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          disabled={!canStart}
          className="mt-1 rounded-[1.5rem] bg-primary py-5 text-xl font-bold text-primary-foreground shadow-pop-gold transition active:translate-y-1 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {canStart ? "Start the photobooth!" : "Waiting for camera…"}
        </motion.button>
      </div>
    </motion.div>
  )
}

function Stepper({
  children,
  onClick,
  disabled,
  label,
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-10 shrink-0 items-center justify-center rounded-full border-2 border-primary/30 bg-secondary text-foreground transition active:translate-y-0.5 disabled:opacity-40"
    >
      {children}
    </button>
  )
}
