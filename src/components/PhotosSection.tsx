import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import gsap from 'gsap'

type Mode = 'photos' | 'drawings'

const DATA: Record<Mode, Array<{ direction: 'left' | 'right'; duration: number; seeds: Array<number> }>> = {
  photos: [
    { direction: 'left', duration: 40, seeds: [10, 20, 30, 40, 50, 60, 70, 80] },
    { direction: 'right', duration: 30, seeds: [90, 100, 110, 120, 130, 140, 150, 160] },
    { direction: 'left', duration: 50, seeds: [170, 180, 190, 200, 210, 220, 230, 240] },
    { direction: 'right', duration: 35, seeds: [250, 260, 270, 280, 290, 300, 310, 320] },
  ],
  drawings: [
    { direction: 'left', duration: 38, seeds: [11, 22, 33, 44, 55, 66, 77, 88] },
    { direction: 'right', duration: 28, seeds: [99, 111, 122, 133, 144, 155, 166, 177] },
    { direction: 'left', duration: 48, seeds: [188, 199, 211, 222, 233, 244, 255, 266] },
    { direction: 'right', duration: 33, seeds: [277, 288, 299, 311, 322, 333, 344, 355] },
  ],
}

export default function PhotosSection() {
  const [mode, setMode] = useState<Mode>('photos')
  const rowRefs = useRef<Array<HTMLDivElement | null>>([])
  const scrollAnims = useRef<Array<gsap.core.Tween>>([])
  const isAnimating = useRef(false)
  const isFirstRender = useRef(true)

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
      if (!el || DATA.photos[i].direction !== 'right') return
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
              {[...row.seeds, ...row.seeds].map((seed, imgIndex) => (
                <img
                  key={imgIndex}
                  src={`https://picsum.photos/seed/${seed}/600/400`}
                  alt=""
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
