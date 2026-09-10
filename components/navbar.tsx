"use client"

import { Camera } from "lucide-react"
import { SITE_NAME, SITE_TAGLINE } from "@/lib/photobooth-config"

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 w-full border-b-4 border-primary/30 bg-card/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-5 py-3">
        <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-pop-gold">
          <Camera className="size-6" aria-hidden="true" />
        </span>
        <div className="leading-tight">
          {/* Change SITE_NAME / SITE_TAGLINE in lib/photobooth-config.ts */}
          <h1 className="text-2xl font-bold tracking-tight text-primary">
            {SITE_NAME}
          </h1>
          <p className="text-xs font-medium text-muted-foreground">
            {SITE_TAGLINE}
          </p>
        </div>
      </div>
    </header>
  )
}
