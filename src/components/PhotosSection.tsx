import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import gsap from 'gsap'

import type { Drawing, Photo } from '@/lib/strapi'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

type Mode = 'photos' | 'drawings'

interface RowConfig {
  direction: 'left' | 'right'
  duration: number
}

const ROW_CONFIGS: Record<Mode, Array<RowConfig>> = {
  photos: [
    { direction: 'left', duration: 120 },
    { direction: 'right', duration: 100 },
    { direction: 'left', duration: 140 },
    { direction: 'right', duration: 110 },
  ],
  drawings: [
    { direction: 'left', duration: 116 },
    { direction: 'right', duration: 96 },
    { direction: 'left', duration: 136 },
    { direction: 'right', duration: 106 },
  ],
}

interface RowImage {
  url: string
  alt: string
}

// Tile images until we have at least `min` — enough to fill one screen width
function tileImages(images: Array<RowImage>, min: number = 8): Array<RowImage> {
  if (images.length === 0) return []
  const result: Array<RowImage> = []
  while (result.length < min) result.push(...images)
  return result
}

function buildRows(
  images: Array<RowImage>,
  configs: Array<RowConfig>,
): Array<RowConfig & { images: Array<RowImage> }> {
  // Interleave: row i gets every nth image (0, n, 2n, … for row 0; 1, n+1, … for row 1; etc.)
  // This ensures no photo appears in more than one row.
  return configs.map((config, i) => {
    const rowImages = images.filter((_, idx) => idx % configs.length === i)
    return { ...config, images: tileImages(rowImages) }
  })
}

// How many rows fit comfortably given the viewport height:
//   < 600px  → 1 big row
//   ≥ 600px  → 2 rows
// Returns 1 on the server so SSR and the initial client render match.
const getRowCount = (): number => {
  if (typeof window === 'undefined') return 1
  const h = window.innerHeight
  if (h < 600) return 1
  return 2
}

interface Props {
  photos: Array<Photo>
  drawings: Array<Drawing>
}

function preloadImages(urls: Array<string>): Promise<void> {
  return Promise.all(
    [...new Set(urls)].map(
      url =>
        new Promise<void>(resolve => {
          const img = new Image()
          img.onload = () => resolve()
          img.onerror = () => resolve()
          img.src = url
        }),
    ),
  ).then(() => {})
}

export default function PhotosSection({ photos, drawings }: Props) {
  const [mode, setMode] = useState<Mode>('photos')
  const [isLoading, setIsLoading] = useState(false)
  // Always 1 on first render to match SSR; corrected to actual value on mount.
  const [rowCount, setRowCount] = useState(1)
  const [lightbox, setLightbox] = useState<RowImage | null>(null)
  const rowRefs = useRef<Array<HTMLDivElement | null>>([])
  const scrollAnims = useRef<Array<{ kill: () => void }>>([])
  const isAnimating = useRef(false)
  const isFirstRender = useRef(true)

  const photoImages = photos.map(p => ({ url: p.photo.url, alt: p.description || '' }))
  const drawingImages = drawings.map(d => ({ url: d.image.url, alt: d.title }))

  const DATA: Record<Mode, Array<RowConfig & { images: Array<RowImage> }>> = {
    photos: buildRows(photoImages, ROW_CONFIGS.photos.slice(0, rowCount)),
    drawings: buildRows(drawingImages, ROW_CONFIGS.drawings.slice(0, rowCount)),
  }

  const rows = DATA[mode]
  const visibleRows = rows.slice(0, rowCount)

  // Kick off the infinite horizontal scroll for each visible row using rAF + scrollLeft
  const startScroll = (rowData: Array<RowConfig & { images: Array<RowImage> }>) => {
    scrollAnims.current.forEach(a => a.kill())
    scrollAnims.current = []
    rowRefs.current.forEach((scrollEl, i) => {
      if (!scrollEl || !rowData[i]) return
      const innerEl = scrollEl.firstElementChild as HTMLElement
      if (!innerEl) return
      const { direction, duration } = rowData[i]
      const halfWidth = innerEl.scrollWidth / 2
      if (halfWidth <= 0) return
      const speed = halfWidth / duration // px/s

      // Set initial scroll position
      scrollEl.scrollLeft = direction === 'right' ? halfWidth : 0

      let rafId: number
      let lastTime: number | null = null
      let pausedByUser = false
      let resumeTimer: ReturnType<typeof setTimeout>

      const resumeAnimation = () => {
        pausedByUser = false
        lastTime = null
        rafId = requestAnimationFrame(tick)
      }

      const pause = () => {
        if (!pausedByUser) {
          cancelAnimationFrame(rafId)
          pausedByUser = true
        }
      }

      const handleWheel = (e: WheelEvent) => {
        // Only react to predominantly horizontal scroll intent
        if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return
        pause()
        clearTimeout(resumeTimer)
        resumeTimer = setTimeout(resumeAnimation, 1500)
      }

      const handleTouchStart = () => {
        pause()
        clearTimeout(resumeTimer)
      }

      const handleTouchEnd = () => {
        clearTimeout(resumeTimer)
        resumeTimer = setTimeout(resumeAnimation, 2000)
      }

      scrollEl.addEventListener('wheel', handleWheel, { passive: true })
      scrollEl.addEventListener('touchstart', handleTouchStart, { passive: true })
      scrollEl.addEventListener('touchend', handleTouchEnd, { passive: true })
      scrollEl.addEventListener('touchcancel', handleTouchEnd, { passive: true })

      const tick = (time: number) => {
        if (pausedByUser) return
        if (lastTime === null) lastTime = time
        const delta = time - lastTime
        lastTime = time

        if (direction === 'left') {
          scrollEl.scrollLeft += speed * (delta / 1000)
          if (scrollEl.scrollLeft >= halfWidth) scrollEl.scrollLeft -= halfWidth
        } else {
          scrollEl.scrollLeft -= speed * (delta / 1000)
          if (scrollEl.scrollLeft <= 0) scrollEl.scrollLeft += halfWidth
        }

        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)

      scrollAnims.current.push({
        kill: () => {
          cancelAnimationFrame(rafId)
          clearTimeout(resumeTimer)
          scrollEl.removeEventListener('wheel', handleWheel)
          scrollEl.removeEventListener('touchstart', handleTouchStart)
          scrollEl.removeEventListener('touchend', handleTouchEnd)
          scrollEl.removeEventListener('touchcancel', handleTouchEnd)
          pausedByUser = true
        },
      })
    })
  }

  // Mount: correct the SSR rowCount, start scroll, add resize listener
  useEffect(() => {
    setRowCount(getRowCount())
    startScroll(DATA.photos)

    const handleResize = () => setRowCount(getRowCount())
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // When rowCount changes (i.e. after mount correction or window resize), restart scroll
  useEffect(() => {
    rowRefs.current.forEach((el) => {
      if (!el) return
      gsap.set(el, { yPercent: 0, autoAlpha: 1 })
    })
    startScroll(visibleRows)
  }, [rowCount])

  // After mode change: fly rows in, then restart scroll
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const els = rowRefs.current.filter(Boolean) as Array<HTMLDivElement>

    // Reset scrollLeft while rows are still invisible (autoAlpha: 0 from exit)
    els.forEach((el, i) => {
      const innerEl = el.firstElementChild as HTMLElement
      if (!innerEl || !visibleRows[i]) return
      const halfWidth = innerEl.scrollWidth / 2
      if (halfWidth <= 0) return
      el.scrollLeft = visibleRows[i].direction === 'right' ? halfWidth : 0
    })

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
        startScroll(visibleRows)
      },
    })
    els.forEach((el, i) => {
      tl.to(
        el,
        { yPercent: 0, autoAlpha: 1, duration: 0.7, ease: 'expo.out' },
        i * 0.1,
      )
    })
  }, [mode])

  // Lightbox: close on Escape, lock body scroll
  useEffect(() => {
    if (!lightbox) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [lightbox])

  const handleToggle = (next: Mode) => {
    if (next === mode || isAnimating.current) return
    isAnimating.current = true
    setIsLoading(true)

    scrollAnims.current.forEach(a => a.kill())
    scrollAnims.current = []

    const els = rowRefs.current.filter(Boolean) as Array<HTMLDivElement>

    // Preload next mode's images in parallel with the exit animation
    const nextUrls = DATA[next].flatMap(row => row.images.map(img => img.url))
    const preloadPromise = preloadImages(nextUrls)

    const exitPromise = new Promise<void>(resolve => {
      const tl = gsap.timeline({ onComplete: resolve })
      els.forEach((el, i) => {
        tl.to(
          el,
          { yPercent: i % 2 === 0 ? -120 : 120, autoAlpha: 0, duration: 0.45, ease: 'expo.in' },
          i * 0.07,
        )
      })
    })

    Promise.all([preloadPromise, exitPromise]).then(() => {
      setIsLoading(false)
      setMode(next)
    })
  }

  const lightboxPortal = lightbox && createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-in fade-in duration-200"
      onClick={() => setLightbox(null)}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors cursor-pointer"
        onClick={() => setLightbox(null)}
        aria-label="Close"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Image — stop propagation so clicking the image doesn't close */}
      <img
        src={lightbox.url}
        alt={lightbox.alt}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[90vh] object-contain rounded-sm shadow-2xl"
      />

      {/* Alt text caption */}
      {/* {lightbox.alt && (
        <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 text-sm font-[vcr-jp] whitespace-nowrap">
          {lightbox.alt}
        </p>
      )} */}
    </div>,
    document.body,
  )

  return (
    <>
    <section className="h-svh bg-[#121212] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 md:px-10 py-6 shrink-0">
        <h2 className="text-2xl md:text-7xl text-gray-200 font-[vcr-jp]">
          Gallery
        </h2>

        <ToggleGroup
          type="single"
          value={mode}
          onValueChange={(val) => val && handleToggle(val as Mode)}
          className="border border-white/30 rounded-full p-1 gap-0 text-xs md:text-sm font-[vcr-jp]"
        >
          {(['photos', 'drawings'] as Array<Mode>).map((m) => (
            <ToggleGroupItem
              key={m}
              value={m}
              disabled={isLoading}
              className="px-3 md:px-5 py-1.5 !rounded-full capitalize text-white !bg-transparent data-[state=on]:!bg-white data-[state=on]:!text-black hover:!bg-transparent hover:text-gray-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && m === mode ? (
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full border border-current border-t-transparent animate-spin" />
                  {m}
                </span>
              ) : m}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex-1 min-h-0 flex flex-col gap-2 pb-4">
        {visibleRows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            ref={(el) => {
              rowRefs.current[rowIndex] = el
            }}
            className="flex-1 min-h-0 overflow-x-scroll no-scrollbar"
          >
            <div className="flex gap-2 h-full">
              {[...row.images, ...row.images].map((img, imgIndex) => (
                <img
                  key={imgIndex}
                  src={img.url}
                  alt={img.alt}
                  onClick={() => setLightbox(img)}
                  loading="lazy"
                  decoding="async"
                  className="h-full object-cover shrink-0 w-[300px] cursor-zoom-in"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
    {lightboxPortal}
    </>
  )
}
