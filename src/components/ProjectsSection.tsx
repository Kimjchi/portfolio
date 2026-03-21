import { useEffect, useLayoutEffect, useRef } from 'react'

import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Project as ProjectType } from '@/lib/strapi'
import Project from '@/components/Project'

import { strapiImageUrl } from '@/lib/strapi'

gsap.registerPlugin(ScrollTrigger)

export default function ProjectsSection({ projects }: { projects: Array<ProjectType> }) {
  const worksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.from('.works-title', {
      autoAlpha: 0,
      yPercent: 30,
      duration: 1,
      ease: 'expo.out',
      scrollTrigger: {
        trigger: '.works-title',
        start: 'top 85%',
      },
    })
  }, [])

  // Set initial card states before paint to avoid flash:
  // - odd cards (image right) are hidden via clip-path for the side-by-side reveal
  // - even cards (image left, index > 0) are hidden below via yPercent
  useLayoutEffect(() => {
    if (!projects.length) return
    const container = worksRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-project-card]'))
    cards.forEach((card, i) => {
      if (i === 0) return
      if (i % 2 !== 0) {
        gsap.set(card, { clipPath: 'inset(0 100% 0 0)' })
      } else {
        gsap.set(card, { yPercent: 100 })
      }
    })
  }, [projects])

  // Stacking cards: pin the works container and drive transitions via a scrubbed timeline.
  // Odd cards reveal via clip-path (right → left) creating a side-by-side moment with the
  // previous card. Even cards slide up from below with a short pause so the current card
  // is seen alone before the transition.
  useEffect(() => {
    if (!projects.length) return
    const container = worksRef.current
    if (!container) return

    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-project-card]'))
    const images = Array.from(container.querySelectorAll<HTMLElement>('[data-project-image]'))
    if (cards.length === 0) return

    const tl = gsap.timeline()
    cards.forEach((card, i) => {
      if (i === 0) return

      if (i % 2 !== 0) {
        tl.to(card, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 1 })
      } else {
        tl.to({}, { duration: 0.4 })
        tl.to(card, { yPercent: 0, ease: 'none', duration: 1 })
        tl.to(images[i - 1], { yPercent: -12, ease: 'none', duration: 1 }, '<')
      }
    })

    const st = ScrollTrigger.create({
      animation: tl,
      trigger: container,
      pin: true,
      start: 'top top',
      end: `+=${window.innerHeight * tl.duration()}`,
      scrub: 1,
      anticipatePin: 1,
    })

    return () => {
      st.kill()
      tl.kill()
    }
  }, [projects])

  return (
    <>
      <h2
        id="works"
        className="works-title text-2xl md:text-7xl text-gray-200 font-[vcr-jp] py-8 text-center"
      >
        My works
      </h2>
      <div ref={worksRef} className="relative h-screen overflow-hidden">
        {projects.map((project, index) => (
          <Project
            key={project.id}
            title={project.title}
            description={project.description}
            image={strapiImageUrl(project.screenshots[0])}
            link={project.url}
            index={index}
          />
        ))}
      </div>
    </>
  )
}
