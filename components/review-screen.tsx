"use client"

import { motion } from "motion/react"
import { ArrowRight, RotateCcw } from "lucide-react"

type Props = {
  photos: string[]
  onAgain: () => void
  onContinue: () => void
}

export function ReviewScreen({ photos, onAgain, onContinue }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: "spring", stiffness: 260, damping: 26 }}
      className="mx-auto max-w-4xl"
    >
      <div className="mb-6 text-center">
        <h2 className="text-3xl font-bold text-primary">Looking good!</h2>
        <p className="mt-1 text-sm font-medium text-muted-foreground">
          Happy with these? Continue to build your strip, or shoot again.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((src, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8, rotate: i % 2 ? 3 : -3 }}
            animate={{ opacity: 1, scale: 1, rotate: i % 2 ? 2 : -2 }}
            transition={{
              delay: i * 0.08,
              type: "spring",
              stiffness: 260,
              damping: 20,
            }}
            className="overflow-hidden rounded-3xl border-4 border-primary/40 bg-card shadow-pop"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src || "/placeholder.svg"}
              alt={`Photo ${i + 1}`}
              className="aspect-[4/3] w-full object-cover"
            />
            <span className="block bg-primary py-1 text-center text-xs font-bold text-primary-foreground">
              #{i + 1}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onAgain}
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] border-4 border-primary/30 bg-secondary px-8 py-4 text-lg font-bold text-foreground shadow-pop transition active:translate-y-1"
        >
          <RotateCcw className="size-5" /> Again
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          className="inline-flex items-center justify-center gap-2 rounded-[1.5rem] bg-primary px-8 py-4 text-lg font-bold text-primary-foreground shadow-pop-gold transition active:translate-y-1"
        >
          Continue <ArrowRight className="size-5" />
        </motion.button>
      </div>
    </motion.div>
  )
}
