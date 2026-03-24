import { useEffect, useRef } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { Project } from '@/lib/strapi'

gsap.registerPlugin(ScrollTrigger)

// Fallback gradient per card index when no screenshot is available
const FALLBACK_GRADIENTS = [
  'from-[#130228] via-[#07011a] to-[#080808]',
  'from-[#001528] via-[#000a1a] to-[#080808]',
  'from-[#001a0f] via-[#000d08] to-[#080808]',
  'from-[#1a0c00] via-[#100800] to-[#080808]',
  'from-[#0b001a] via-[#060010] to-[#080808]',
  'from-[#1a0000] via-[#0f0000] to-[#080808]',
]

// Col-span pattern for a 3-col grid — produces a zigzag layout:
//   Row 1: [wide] [small]
//   Row 2: [small] [wide]
//   Row 3: [wide] [small]  …repeating
const COL_SPANS = [2, 1, 1, 2, 2, 1]

interface Props {
  experiments: Project[]
}

export default function LabSection({ experiments }: Props) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<Array<HTMLAnchorElement | null>>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.lab-label', {
        autoAlpha: 0, y: 10, duration: 0.6, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      gsap.from('.lab-heading', {
        autoAlpha: 0, y: 20, duration: 0.7, ease: 'expo.out', delay: 0.05,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%' },
      })
      gsap.from(cardsRef.current.filter(Boolean), {
        autoAlpha: 0, y: 36, stagger: 0.08, duration: 0.9, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [])

  const handleMouseEnter = (i: number) => {
    const card = cardsRef.current[i]
    if (!card) return
    const scanline = card.querySelector<HTMLElement>('.lab-scanline')
    if (scanline) {
      gsap.fromTo(
        scanline,
        { top: '0%', opacity: 1 },
        { top: '100%', opacity: 0, duration: 0.65, ease: 'power1.in', overwrite: 'auto' },
      )
    }
  }

  if (experiments.length === 0) return null

  return (
    <section ref={sectionRef} id="lab" className="px-6 md:px-20 py-24">
      <p className="lab-label text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-3">
        Lab
      </p>
      <h2 className="lab-heading text-2xl md:text-7xl font-[vcr-jp] text-gray-200 mb-12">
        Experimentations
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[260px] gap-3">
        {experiments.map((exp, i) => {
          const preview = exp.screenshots[0]
          const fallback = FALLBACK_GRADIENTS[i % FALLBACK_GRADIENTS.length]

          return (
            <a
              key={exp.id}
              ref={(el) => { cardsRef.current[i] = el }}
              onMouseEnter={() => handleMouseEnter(i)}
              href={exp.url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={exp.title}
              className={[
                'relative overflow-hidden rounded-sm',
                preview ? 'bg-[#080808]' : `bg-gradient-to-br ${fallback}`,
                'border border-white/[0.06] group cursor-pointer',
                COL_SPANS[i % COL_SPANS.length] === 2 ? 'lg:col-span-2' : '',
              ].join(' ')}
            >
              {/* Screenshot (when available) */}
              {preview && (
                <img
                  src={preview.url}
                  alt={exp.title}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-500"
                />
              )}

              {/* Scanline sweep */}
              <div
                className="lab-scanline pointer-events-none absolute left-0 right-0 h-px z-30"
                style={{
                  top: 0,
                  opacity: 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)',
                }}
              />

              {/* ASCII corner brackets */}
              <span className="absolute top-3 left-3  font-mono text-[11px] text-white/0 group-hover:text-white/30 transition-colors duration-300 z-10 select-none">┌</span>
              <span className="absolute top-3 right-3 font-mono text-[11px] text-white/0 group-hover:text-white/30 transition-colors duration-300 z-10 select-none">┐</span>
              <span className="absolute bottom-3 left-3  font-mono text-[11px] text-white/0 group-hover:text-white/30 transition-colors duration-300 z-10 select-none">└</span>
              <span className="absolute bottom-3 right-3 font-mono text-[11px] text-white/0 group-hover:text-white/30 transition-colors duration-300 z-10 select-none">┘</span>

              {/* Bottom vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent group-hover:from-black/85 transition-all duration-300" />

              {/* Index number */}
              <span className="absolute top-4 left-5 font-mono text-xs text-white/15 z-10 select-none">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* View indicator */}
              <span className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 text-white/60 font-mono text-xs z-20">
                View →
              </span>

              {/* Default: dim title */}
              <div className="absolute bottom-4 left-5 z-10 group-hover:opacity-0 group-hover:translate-y-1 transition-all duration-200">
                <p className="font-[vcr-jp] text-white/35 text-base leading-none">{exp.title}</p>
              </div>

              {/* Hover: stack tags + title + description */}
              <div className="absolute inset-x-0 bottom-0 p-5 z-10 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
                {exp.stack.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {exp.stack.map((tag) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] text-[#00ff41] border border-[#00ff41]/30 px-1.5 py-0.5"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="font-[vcr-jp] text-white text-xl leading-tight mb-1">{exp.title}</p>
                {exp.description && (
                  <p className="font-mono text-white/45 text-xs leading-relaxed">{exp.description}</p>
                )}
              </div>
            </a>
          )
        })}
      </div>
    </section>
  )
}
