"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "motion/react"
import { Download, Home, Loader2 } from "lucide-react"
import { SITE_NAME, TEMPLATE } from "@/lib/photobooth-config"

type Props = {
  photos: string[]
  onRestart: () => void
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/** Draw an image "cover"-style into a rounded rectangle. */
function drawCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
) {
  ctx.save()
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, radius)
  ctx.clip()

  const scale = Math.max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  const dx = x + (w - dw) / 2
  const dy = y + (h - dh) / 2
  ctx.drawImage(img, dx, dy, dw, dh)
  ctx.restore()
}

export function ResultScreen({ photos, onRestart }: Props) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  const [building, setBuilding] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    let cancelled = false
    async function build() {
      setBuilding(true)
      const { photoWidth, photoAspect, outerPadding, gap, cornerRadius } =
        TEMPLATE
      const photoHeight = Math.round(photoWidth / photoAspect)
      const width = photoWidth + outerPadding * 2
      const height =
        outerPadding * 2 +
        photos.length * photoHeight +
        (photos.length - 1) * gap

      const canvas = canvasRef.current ?? document.createElement("canvas")
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Transparent background — leave the canvas cleared so the padding
      // and the gaps between photos stay see-through in the exported PNG.
      ctx.clearRect(0, 0, width, height)

      const imgs = await Promise.all(photos.map(loadImage))
      if (cancelled) return

      imgs.forEach((img, i) => {
        const x = outerPadding
        const y = outerPadding + i * (photoHeight + gap)
        drawCover(ctx, img, x, y, photoWidth, photoHeight, cornerRadius)
      })

      const url = canvas.toDataURL("image/png")
      if (!cancelled) {
        setDataUrl(url)
        setBuilding(false)
      }
    }
    build()
    return () => {
      cancelled = true
    }
  }, [photos])

  function handleDownload() {
    if (!dataUrl) return
    const link = document.createElement("a")
    link.href = dataUrl
    link.download = `${SITE_NAME.toLowerCase()}-photostrip-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.1fr] lg:items-center"
    >
      <canvas ref={canvasRef} className="hidden" />

      {/* Preview on a transparency grid so gaps are visibly see-through */}
      <div className="order-2 lg:order-1">
        <div className="rounded-[2rem] border-4 border-primary/40 bg-transparency-grid p-4 shadow-pop">
          {building || !dataUrl ? (
            <div className="flex aspect-[3/4] items-center justify-center">
              <Loader2 className="size-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.img
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              src={dataUrl}
              alt="Finished photo strip preview"
              className="mx-auto max-h-[70vh] w-auto"
            />
          )}
        </div>
        <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
          The checkered areas are transparent in your PNG — perfect for adding
          your own designs.
        </p>
      </div>

      {/* Actions */}
      <div className="order-1 flex flex-col gap-5 lg:order-2">
        <div>
          <h2 className="text-3xl font-bold text-primary">Your strip is ready!</h2>
          <p className="mt-2 text-sm font-medium text-muted-foreground">
            Your {photos.length} photos are stacked vertically with transparent
            padding and gaps, exported as a printable PNG.
          </p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleDownload}
          disabled={building || !dataUrl}
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-primary px-8 py-5 text-xl font-bold text-primary-foreground shadow-pop-gold transition active:translate-y-1 disabled:opacity-50"
        >
          <Download className="size-6" /> Download PNG
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] border-4 border-primary/30 bg-secondary px-8 py-4 text-lg font-bold text-foreground shadow-pop transition active:translate-y-1"
        >
          <Home className="size-5" /> Back to start
        </motion.button>
      </div>
    </motion.div>
  )
}
