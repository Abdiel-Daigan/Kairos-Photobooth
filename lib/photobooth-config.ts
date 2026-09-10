// ============================================================
//  PHOTOBOOTH CONFIG — edit these values to customize the app
// ============================================================

export type Settings = {
  deviceId: string | null
  count: number
  timer: number
}

// The name shown in the top navigation bar / logo.
export const SITE_NAME = "SnapPop"

// A short tagline shown under the name in a few spots.
export const SITE_TAGLINE = "Say cheese!"

// Splash texts shown randomly while each picture is being taken.
// Add as many as you like — one is picked at random for every shot.
export const SPLASH_TEXTS: string[] = [
  "Smile!",
  "Do a pose!",
  "Say cheese!",
  "Strike it!",
  "Work it!",
  "Big grin!",
  "Get silly!",
  "Look up!",
  "Peace sign!",
  "You got this!",
]

// Text shown when all pictures are done.
export const DONE_TEXT = "Done!"

// Allowed number of pictures the user can pick from.
export const PICTURE_COUNT_OPTIONS = [2, 3, 4] as const

// Timer (seconds per picture) bounds for the slider/stepper.
export const MIN_TIMER = 1
export const MAX_TIMER = 10
export const DEFAULT_TIMER = 3

// Warn the user if they pick a countdown shorter than this.
export const SHORT_TIMER_WARNING_THRESHOLD = 2

// ---- Printable template layout (in pixels) ----
export const TEMPLATE = {
  // Width of each photo in the final strip.
  photoWidth: 900,
  // 4:3 photos -> height derived from aspect at capture time, but we
  // normalize every photo to this aspect for a clean strip.
  photoAspect: 4 / 3, // width / height
  // Transparent padding around the whole strip.
  outerPadding: 60,
  // Transparent gap between photos.
  gap: 48,
  // Rounded corner radius for each photo tile.
  cornerRadius: 40,
}
