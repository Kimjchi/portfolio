import { useEffect, useRef } from 'react'

import gsap from 'gsap'
import { SplitText } from 'gsap/SplitText'

import { cn } from '@/lib/utils'

gsap.registerPlugin(SplitText)

const VARIANTS = [
  { imageFlex: 1.8 },
  { imageFlex: 0.9 },
  { imageFlex: 1.6 },
  { imageFlex: 1.0 },
  { imageFlex: 1.7 },
  { imageFlex: 0.85 },
]

interface ProjectProps {
  title: string
  description: string
  image: string
  link: string
  index?: number
}

export default function Project({ title, description, image, link, index = 0 }: ProjectProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const descRef = useRef<HTMLParagraphElement>(null)
  const linkRef = useRef<HTMLAnchorElement>(null)

  const isEven = index % 2 === 0
  const variant = VARIANTS[index % VARIANTS.length]

  useEffect(() => {
    const container = containerRef.current
    const desc = descRef.current
    const linkEl = linkRef.current
    if (!container || !desc || !linkEl) return

    // Touch devices have no hover — keep desc/link visible always
    const isMobile = window.innerWidth < 768
    if (isMobile) return

    gsap.set([desc, linkEl], { autoAlpha: 0 })

    let splitDesc: SplitText | null = null
    let hoverTl: gsap.core.Timeline | null = null

    const onEnter = () => {
      if (!splitDesc) splitDesc = new SplitText(desc, { type: 'words' })
      hoverTl?.kill()
      hoverTl = gsap.timeline()
      hoverTl
        .set(desc, { autoAlpha: 1 })
        .set(splitDesc.words, { autoAlpha: 0, yPercent: 40 })
        .to(splitDesc.words, {
          autoAlpha: 1,
          yPercent: 0,
          stagger: 0.05,
          duration: 0.5,
          ease: 'expo.out',
        })
        .to(linkEl, { autoAlpha: 1, duration: 0.3, ease: 'expo.out' }, '-=0.2')
    }

    const onLeave = () => {
      hoverTl?.kill()
      gsap.to([desc, linkEl], { autoAlpha: 0, duration: 0.2 })
    }

    container.addEventListener('mouseenter', onEnter)
    container.addEventListener('mouseleave', onLeave)

    return () => {
      container.removeEventListener('mouseenter', onEnter)
      container.removeEventListener('mouseleave', onLeave)
      hoverTl?.kill()
      splitDesc?.revert()
    }
  }, [])

  return (
    // Mobile: column (image top, text bottom). Desktop: row alternating sides.
    <div
      ref={containerRef}
      data-project-card
      className={cn(
        'absolute inset-0 flex flex-col bg-[#121212] cursor-default',
        isEven ? 'md:flex-row' : 'md:flex-row-reverse',
      )}
      style={{ zIndex: index + 1 }}
    >
      {/* Image — capped height on mobile so text has room */}
      <div
        className="overflow-hidden max-h-[45vh] md:max-h-full"
        style={{ flex: variant.imageFlex }}
      >
        <img
          data-project-image
          className="w-full h-full object-cover scale-[1.15] origin-center"
          src={image}
          alt={title}
          loading="lazy"
        />
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col justify-center gap-3 md:gap-6 px-5 md:px-12 py-4 md:py-0">
        <h2 className="text-2xl md:text-5xl lg:text-7xl font-bold text-white font-[vcr-jp] leading-tight">
          {title}
        </h2>
        <p ref={descRef} className="text-gray-300 text-sm md:text-xl leading-relaxed">
          {description}
        </p>
        <a
          ref={linkRef}
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white text-sm md:text-lg border-b border-white w-fit hover:text-gray-400 transition-colors"
        >
          View project →
        </a>
      </div>
    </div>
  )
}
