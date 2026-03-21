import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import gsap from 'gsap'

import type { Drawing, Photo } from '@/lib/strapi'

type Mode = 'photos' | 'drawings'

interface RowConfig {
  direction: 'left' | 'right'
  duration: number
}

const ROW_CONFIGS: Record<Mode, Array<RowConfig>> = {
  photos: [
    { direction: 'left', duration: 40 },
    { direction: 'right', duration: 30 },
    { direction: 'left', duration: 50 },
    { direction: 'right', duration: 35 },
  ],
  drawings: [
    { direction: 'left', duration: 38 },
    { direction: 'right', duration: 28 },
    { direction: 'left', duration: 48 },
    { direction: 'right', duration: 33 },
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
  return configs.map((config, i) => {
    // Offset each row so they show different images at start
    const offset = Math.floor((images.length / configs.length) * i)
    const shifted = [...images.slice(offset), ...images.slice(0, offset)]
    return { ...config, images: tileImages(shifted) }
  })
}

interface Props {
  photos: Array<Photo>
  drawings: Array<Drawing>
}

export default function PhotosSection({ photos, drawings }: Props) {
  const [mode, setMode] = useState<Mode>('photos')
  const rowRefs = useRef<Array<HTMLDivElement | null>>([])
  const scrollAnims = useRef<Array<gsap.core.Tween>>([])
  const isAnimating = useRef(false)
  const isFirstRender = useRef(true)

  const photoImages = photos.map(p => ({ url: p.photo.url, alt: p.description ?? '' }))
  const drawingImages = drawings.map(d => ({ url: d.image.url, alt: d.title }))

  const DATA: Record<Mode, Array<RowConfig & { images: Array<RowImage> }>> = {
    photos: buildRows(photoImages, ROW_CONFIGS.photos),
    drawings: buildRows(drawingImages, ROW_CONFIGS.drawings),
  }

  const rows = DATA[mode]

  // Kick off the infinite horizontal scroll for each row
  const startScroll = (rowData: typeof rows) => {
    scrollAnims.current.forEach(a => a.kill())
    scrollAnims.current = []
    rowRefs.current.forEach((el, i) => {
      if (!el) return
      const { direction, duration } = rowData[i]
      scrollAnims.current.push(
        gsap.to(el, {
          xPercent: direction === 'left' ? -50 : 0,
          duration,
          ease: 'none',
          repeat: -1,
        }),
      )
    })
  }

  // Before paint: put right-moving rows at their start position
  useLayoutEffect(() => {
    rowRefs.current.forEach((el, i) => {
      if (!el || ROW_CONFIGS.photos[i].direction !== 'right') return
      gsap.set(el, { xPercent: -50 })
    })
  }, [])

  // Mount: start scroll
  useEffect(() => {
    startScroll(DATA.photos)
  }, [])

  // After mode change: animate rows in, then restart scroll
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    const els = rowRefs.current.filter(Boolean) as Array<HTMLDivElement>

    // Reset xPercent for the new mode's directions
    els.forEach((el, i) => {
      gsap.set(el, { xPercent: rows[i].direction === 'right' ? -50 : 0 })
    })

    // Rows are already at yPercent ±100 from the out animation — bring them back in
    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false
        startScroll(rows)
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

  const handleToggle = (next: Mode) => {
    if (next === mode || isAnimating.current) return
    isAnimating.current = true

    scrollAnims.current.forEach(a => a.kill())
    scrollAnims.current = []

    const els = rowRefs.current.filter(Boolean) as Array<HTMLDivElement>

    // Stagger rows out: even rows exit up, odd rows exit down
    const tl = gsap.timeline({ onComplete: () => setMode(next) })
    els.forEach((el, i) => {
      tl.to(
        el,
        { yPercent: i % 2 === 0 ? -120 : 120, autoAlpha: 0, duration: 0.45, ease: 'expo.in' },
        i * 0.07,
      )
    })
  }

  return (
    <section className="h-screen bg-[#121212] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between px-6 md:px-10 py-6 shrink-0">
        <h2 className="text-2xl md:text-7xl text-gray-200 font-[vcr-jp]">
          Gallery
        </h2>

        {/* Toggle pill */}
        <div className="flex border border-white/30 rounded-full p-1 text-xs md:text-sm font-[vcr-jp]">
          {(['photos', 'drawings'] as Array<Mode>).map((m) => (
            <button
              key={m}
              onClick={() => handleToggle(m)}
              className={`px-3 md:px-5 py-1.5 rounded-full capitalize transition-all duration-300 ${
                mode === m ? 'bg-white text-black' : 'text-white hover:text-gray-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-2 pb-4">
        {rows.map((row, rowIndex) => (
          <div key={rowIndex} className="flex-1 overflow-hidden">
            <div
              ref={(el) => {
                rowRefs.current[rowIndex] = el
              }}
              className="flex gap-2 h-full"
            >
              {[...row.images, ...row.images].map((img, imgIndex) => (
                <img
                  key={imgIndex}
                  src={img.url}
                  alt={img.alt}
                  className="h-full object-cover shrink-0 w-[300px]"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
