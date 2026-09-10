"use client"

import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { Navbar } from "@/components/navbar"
import { SetupScreen } from "@/components/setup-screen"
import { CaptureScreen } from "@/components/capture-screen"
import { ReviewScreen } from "@/components/review-screen"
import { ResultScreen } from "@/components/result-screen"
import { DEFAULT_TIMER, type Settings } from "@/lib/photobooth-config"

type Step = "setup" | "capture" | "review" | "result"

export default function Page() {
  const [step, setStep] = useState<Step>("setup")
  const [settings, setSettings] = useState<Settings>({
    deviceId: null,
    count: 3,
    timer: DEFAULT_TIMER,
  })
  const [photos, setPhotos] = useState<string[]>([])

  function reset() {
    setPhotos([])
    setStep("setup")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
        <AnimatePresence mode="wait">
          {step === "setup" && (
            <SetupScreen
              key="setup"
              settings={settings}
              onChange={setSettings}
              onStart={() => setStep("capture")}
            />
          )}
          {step === "capture" && (
            <CaptureScreen
              key="capture"
              settings={settings}
              onDone={(taken) => {
                setPhotos(taken)
                setStep("review")
              }}
            />
          )}
          {step === "review" && (
            <ReviewScreen
              key="review"
              photos={photos}
              onAgain={reset}
              onContinue={() => setStep("result")}
            />
          )}
          {step === "result" && (
            <ResultScreen key="result" photos={photos} onRestart={reset} />
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
