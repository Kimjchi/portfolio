import { useEffect, useRef, useState } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import type { Project as ProjectType } from '@/lib/strapi'
import { strapiImageUrl } from '@/lib/strapi'

gsap.registerPlugin(ScrollTrigger)


export default function ProjectsSection({ projects }: { projects: Array<ProjectType> }) {
  // ── Refs ──────────────────────────────────────────────────────────────────
  const sectionRef = useRef<HTMLDivElement>(null)
  const rowsRef = useRef<Array<HTMLAnchorElement | null>>([])

  // Desktop panel
  const imagesRef = useRef<Array<HTMLDivElement | null>>([])
  const descRef = useRef<HTMLParagraphElement>(null)
  const hintRef = useRef<HTMLDivElement>(null)
  const hintFloatRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef(-1)

  // Tooltip
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Mobile accordion
  const mobileExpandRefs = useRef<Array<HTMLDivElement | null>>([])
  const [mobileActiveIndex, setMobileActiveIndex] = useState<number | null>(null)

  // Tooltip content (state so React re-renders the marquee)
  const [tooltipStack, setTooltipStack] = useState<Array<string>>([])

  // ── Scroll-in animations ──────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.works-label', {
        autoAlpha: 0,
        y: 10,
        duration: 0.6,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 75%' },
      })
      gsap.from(rowsRef.current, {
        autoAlpha: 0,
        y: 24,
        stagger: 0.07,
        duration: 0.8,
        ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      })
      gsap.from(hintRef.current, {
        autoAlpha: 0,
        duration: 1,
        ease: 'expo.out',
        delay: 0.3,
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%' },
      })
    }, sectionRef)

    const floatTween = gsap.to(hintFloatRef.current, {
      y: -8,
      duration: 2.8,
      ease: 'sine.inOut',
      yoyo: true,
      repeat: -1,
    })

    return () => {
      ctx.revert()
      floatTween.kill()
    }
  }, [])

  // ── Desktop: hover handlers ───────────────────────────────────────────────
  const onMouseMove = (e: React.MouseEvent) => {
    if (!tooltipRef.current) return
    tooltipRef.current.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`
  }

  const onEnter = (i: number) => {
    if (activeRef.current === i) return
    const prev = activeRef.current
    activeRef.current = i

    rowsRef.current.forEach((row, j) => {
      if (!row) return
      gsap.to(row, { opacity: j === i ? 1 : 0.2, duration: 0.3, overwrite: 'auto' })
    })

    if (prev >= 0 && imagesRef.current[prev]) {
      gsap.to(imagesRef.current[prev], { autoAlpha: 0, duration: 0.2, overwrite: 'auto' })
    }

    const img = imagesRef.current[i]
    if (img) {
      gsap.fromTo(
        img,
        { clipPath: 'inset(100% 0 0% 0)', autoAlpha: 1 },
        { clipPath: 'inset(0% 0 0% 0)', autoAlpha: 1, duration: 0.6, ease: 'expo.out', overwrite: 'auto' },
      )
    }

    const descEl = descRef.current
    if (descEl) {
      gsap.to(descEl, {
        autoAlpha: 0,
        y: -8,
        duration: 0.15,
        overwrite: 'auto',
        onComplete: () => {
          descEl.textContent = projects[i].description
          gsap.fromTo(descEl, { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.5, ease: 'expo.out' })
        },
      })
    }

    setTooltipStack(projects[i].stack)
    gsap.to(tooltipRef.current, { autoAlpha: 1, duration: 0.18, overwrite: 'auto' })
    gsap.to(hintRef.current, { autoAlpha: 0, duration: 0.25, overwrite: 'auto' })
  }

  const onLeave = () => {
    activeRef.current = -1
    rowsRef.current.forEach((row) => {
      if (row) gsap.to(row, { opacity: 1, duration: 0.4, overwrite: 'auto' })
    })
    imagesRef.current.forEach((img) => {
      if (img) gsap.to(img, { autoAlpha: 0, duration: 0.4, overwrite: 'auto' })
    })
    if (descRef.current) gsap.to(descRef.current, { autoAlpha: 0, y: -8, duration: 0.3, overwrite: 'auto' })
    gsap.to(tooltipRef.current, { autoAlpha: 0, duration: 0.18, overwrite: 'auto' })
    gsap.to(hintRef.current, { autoAlpha: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' })
  }

  // ── Mobile: accordion tap handler ─────────────────────────────────────────
  const onMobileTap = (i: number) => {
    const prev = mobileActiveIndex

    // Collapse the previously open item
    if (prev !== null && prev !== i) {
      const prevEl = mobileExpandRefs.current[prev]
      if (prevEl) gsap.to(prevEl, { height: 0, opacity: 0, duration: 0.35, ease: 'expo.inOut', overwrite: 'auto' })
    }

    const el = mobileExpandRefs.current[i]
    if (!el) return

    if (prev === i) {
      // Collapse current
      gsap.to(el, { height: 0, opacity: 0, duration: 0.35, ease: 'expo.inOut', overwrite: 'auto' })
      setMobileActiveIndex(null)
    } else {
      // Expand new
      gsap.fromTo(el, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: 0.5, ease: 'expo.out', overwrite: 'auto' })
      setMobileActiveIndex(i)
    }
  }

  const handleRowClick = (e: React.MouseEvent, i: number) => {
    if (window.innerWidth < 1024) {
      e.preventDefault()
      onMobileTap(i)
    }
    // Desktop: let the <a> href handle navigation naturally
  }

  const marqueeItems = Array(20).fill(tooltipStack).flat()

  return (
    <>
      {/* ── Cursor-following terminal tooltip (desktop only) ────────────── */}
      <div
        ref={tooltipRef}
        className="hidden lg:block fixed top-0 left-0 pointer-events-none z-50 font-mono text-xs select-none"
        style={{ opacity: 0, visibility: 'hidden', willChange: 'transform' }}
      >
        <div className="bg-[#0a0a0a] border border-[#00ff41]/30 rounded-sm shadow-[0_0_14px_rgba(0,255,65,0.12)] overflow-hidden">
          <div className="flex items-center gap-2 px-2.5 py-1 border-b border-[#00ff41]/15">
            <span className="text-[#00ff41]/40 text-[10px] tracking-widest uppercase">stack</span>
            <span className="ml-auto text-[#00ff41]/50 text-[9px] animate-pulse leading-none">█</span>
          </div>
          <div className="w-48 overflow-hidden px-2 py-1.5">
            <div
              className="flex items-center gap-4 whitespace-nowrap"
              style={{ animation: 'tooltip-marquee 8s linear infinite' }}
            >
              {marqueeItems.map((tech, i) => (
                <span key={i} className="flex items-center gap-1.5 shrink-0 text-[#00ff41]">
                  <span className="text-[#00ff41]/35">/</span>
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section ───────────────────────────────────────────────────────── */}
      <section ref={sectionRef} id="works" className="px-6 md:px-20 py-24" onMouseMove={onMouseMove}>
        <p className="works-label text-xs font-mono text-gray-500 uppercase tracking-[0.2em] mb-12">
          My works
        </p>

        <div className="flex gap-16 xl:gap-24 items-start" onMouseLeave={onLeave}>
          {/* ── Project list ──────────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {projects.map((project, i) => (
              <a
                key={project.id}
                ref={(el) => { rowsRef.current[i] = el }}
                onMouseEnter={() => onEnter(i)}
                onClick={(e) => handleRowClick(e, i)}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={project.title}
                className="border-t border-white/10 group cursor-pointer block"
              >
                {/* Row header */}
                <div className="flex items-center gap-5 py-7">
                  <span className="text-gray-600 text-xs font-mono w-6 shrink-0 leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 text-4xl md:text-5xl lg:text-6xl font-bold font-[vcr-jp] text-white leading-none">
                    {project.title}
                  </span>

                  {/* Desktop: view arrow */}
                  <span className="hidden lg:block text-white/40 text-sm translate-x-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 shrink-0">
                    View →
                  </span>

                  {/* Mobile: expand indicator */}
                  <span
                    className="lg:hidden text-white/40 text-2xl font-extralight leading-none shrink-0 transition-transform duration-300"
                    style={{ transform: mobileActiveIndex === i ? 'rotate(45deg)' : 'rotate(0deg)' }}
                  >
                    +
                  </span>
                </div>

                {/* Mobile accordion */}
                <div
                  ref={(el) => { mobileExpandRefs.current[i] = el }}
                  className="overflow-hidden lg:hidden"
                  style={{ height: 0, opacity: 0 }}
                >
                  <div className="pb-8 flex flex-col gap-4">
                    {/* Image */}
                    <div className="w-full aspect-video overflow-hidden rounded-sm bg-white/5">
                      <img
                        src={strapiImageUrl(project.screenshots[0])}
                        alt={project.title}
                        width={project.screenshots[0]?.width}
                        height={project.screenshots[0]?.height}
                        className="w-full h-full object-cover object-top"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Description */}
                    <p className="text-gray-400 text-sm leading-relaxed">
                      {project.description}
                    </p>

                    {/* Inline terminal stack tooltip */}
                    <div className="bg-[#0a0a0a] border border-[#00ff41]/30 rounded-sm overflow-hidden shadow-[0_0_14px_rgba(0,255,65,0.12)] font-mono text-xs">
                      <div className="flex items-center gap-2 px-2.5 py-1 border-b border-[#00ff41]/15">
                        <span className="text-[#00ff41]/40 text-[10px] tracking-widest uppercase">stack</span>
                        <span className="ml-auto text-[#00ff41]/50 text-[9px] animate-pulse leading-none">█</span>
                      </div>
                      <div className="overflow-hidden px-2 py-1.5">
                        <div
                          className="flex items-center gap-4 whitespace-nowrap"
                          style={{ animation: 'tooltip-marquee 8s linear infinite' }}
                        >
                          {Array(20).fill(project.stack).flat().map((tech: string, j: number) => (
                            <span key={j} className="flex items-center gap-1.5 shrink-0 text-[#00ff41]">
                              <span className="text-[#00ff41]/35">/</span>
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Link */}
                    <a
                      href={project.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-white text-sm border-b border-white/60 w-fit pb-0.5 hover:text-gray-300 transition-colors relative z-10"
                    >
                      View project →
                    </a>
                  </div>
                </div>
              </a>
            ))}
            <div className="border-t border-white/10" />
          </div>

          {/* ── Desktop sticky panel ──────────────────────────────────────── */}
          <div className="hidden lg:block w-[380px] xl:w-[440px] shrink-0 sticky top-[15vh]">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-white/5">
              {/* Idle hint */}
              <div
                ref={hintRef}
                className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
              >
                <span className="absolute top-3 left-3  font-mono text-[11px] text-white/25">┌</span>
                <span className="absolute top-3 right-3 font-mono text-[11px] text-white/25">┐</span>
                <span className="absolute bottom-3 left-3  font-mono text-[11px] text-white/25">└</span>
                <span className="absolute bottom-3 right-3 font-mono text-[11px] text-white/25">┘</span>

                <div ref={hintFloatRef} className="flex flex-col items-center gap-5">
                  <div className="flex items-center gap-2">
                    {[0, 1, 2].map((j) => (
                      <span
                        key={j}
                        className="text-white text-2xl leading-none font-thin"
                        style={{
                          animation: 'hint-arrow-wave 1.8s ease-in-out infinite',
                          animationDelay: `${j * 0.22}s`,
                        }}
                      >
                        ←
                      </span>
                    ))}
                  </div>
                  <span className="font-mono text-[11px] tracking-[0.45em] uppercase text-white/45">
                    hover a project
                  </span>
                </div>
              </div>

              {/* Project images */}
              {projects.map((project, i) => (
                <div
                  key={project.id}
                  ref={(el) => { imagesRef.current[i] = el }}
                  className="absolute inset-0"
                  style={{ opacity: 0, visibility: 'hidden' }}
                >
                  <img
                    src={strapiImageUrl(project.screenshots[0])}
                    alt={project.title}
                    width={project.screenshots[0]?.width}
                    height={project.screenshots[0]?.height}
                    className="w-full h-full object-cover object-top"
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              ))}
            </div>

            {/* Description */}
            <p
              ref={descRef}
              className="mt-4 text-gray-400 text-sm leading-relaxed"
              style={{ opacity: 0, visibility: 'hidden' }}
            />
          </div>
        </div>
      </section>
    </>
  )
}
