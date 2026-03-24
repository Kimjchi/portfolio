import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const SKILLS = [
  { category: 'Frontend', items: ['React', 'TanStack', 'TypeScript', 'Tailwind', 'GSAP', 'D3.js', 'Vite', 'Pixi.js', 'Three.js'] },
  { category: 'Backend', items: ['Node.js', 'PostgreSQL', 'REST / GraphQL', 'Python', 'FastAPI'] },
  { category: 'Tooling', items: ['Git', 'Docker', 'Kubernetes', 'CI/CD', 'Figma', 'GCP'] },
]

export default function AboutSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const imageRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const bioRef = useRef<HTMLParagraphElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const skillsRef = useRef<HTMLDivElement>(null)
  const ctaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      })

      tl.from(labelRef.current, { autoAlpha: 0, y: 10, duration: 0.5, ease: 'expo.out' })
        .from(titleRef.current, { autoAlpha: 0, y: 30, duration: 0.8, ease: 'expo.out' }, '-=0.2')
        .from(imageRef.current, { autoAlpha: 0, clipPath: 'inset(100% 0 0% 0)', duration: 0.9, ease: 'expo.out' }, '-=0.5')
        .from(bioRef.current, { autoAlpha: 0, y: 16, duration: 0.7, ease: 'expo.out' }, '-=0.4')
        .from(metaRef.current?.children ?? [], { autoAlpha: 0, y: 12, stagger: 0.08, duration: 0.6, ease: 'expo.out' }, '-=0.4')
        .from(skillsRef.current, { autoAlpha: 0, y: 16, duration: 0.6, ease: 'expo.out' }, '-=0.3')
        .from(ctaRef.current, { autoAlpha: 0, y: 10, duration: 0.5, ease: 'expo.out' }, '-=0.3')
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      id="about"
      className="min-h-screen bg-[#121212] px-6 md:px-20 pt-24 pb-16 flex flex-col gap-16"
    >
      {/* ── Top: image + intro ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-start gap-10 md:gap-20">
        {/* Image */}
        <div
          ref={imageRef}
          className="shrink-0 w-48 h-48 md:w-72 md:h-72 overflow-hidden border border-white/10"
          style={{ clipPath: 'inset(0% 0 0% 0)' }}
        >
          <img
            src="https://res.cloudinary.com/dy1eb4rez/image/upload/f_auto,q_auto,w_576/v1774389738/000081430030_389337c91a.jpg"
            alt="Jeremy Kim"
            width={288}
            height={288}
            decoding="async"
            className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
          />
        </div>

        {/* Intro text */}
        <div className="flex flex-col gap-6 max-w-2xl">
          <p
            ref={labelRef}
            className="text-white/40 text-xs font-mono tracking-widest uppercase"
          >
            About
          </p>
          <h2
            ref={titleRef}
            className="text-5xl md:text-7xl font-bold text-white font-[vcr-jp] leading-tight"
          >
            Jeremy Kim
          </h2>
          <p
            ref={bioRef}
            className="text-gray-400 text-base md:text-lg leading-relaxed font-[vcr-jp]"
          >
            Fullstack developer based in Paris, France. I build web applications
            with a focus on clean code and thoughtful user experiences. Outside of
            work I shoot film photography and sketch — two things that keep my eye
            sharp.
          </p>

          {/* Meta grid */}
          <div ref={metaRef} className="grid grid-cols-2 gap-x-8 gap-y-5 border-t border-white/10 pt-6">
            {[
              { label: 'Based in', value: 'Paris, France' },
              { label: 'Available', value: 'Freelance' },
              { label: 'Languages', value: 'French · English' },
              { label: 'Experience', value: '5+ years' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-white/30 text-[10px] font-mono tracking-widest uppercase mb-1">
                  {label}
                </p>
                <p className="text-white text-sm font-[vcr-jp]">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Skills terminal ───────────────────────────────────────────────── */}
      <div
        ref={skillsRef}
        className="bg-[#0a0a0a] border border-[#00ff41]/20 rounded-sm shadow-[0_0_40px_rgba(0,255,65,0.04)] overflow-hidden"
      >
        {/* Terminal header */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#00ff41]/15">
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
          <span className="ml-3 text-[#00ff41]/40 text-[11px] font-mono tracking-widest uppercase">
            skills.sh
          </span>
          <span className="ml-auto text-[#00ff41]/50 text-[10px] font-mono animate-pulse">█</span>
        </div>

        {/* Terminal body */}
        <div className="px-4 py-5 flex flex-col gap-4 md:grid md:grid-cols-3 md:gap-0 md:divide-x md:divide-[#00ff41]/10">
          {SKILLS.map(({ category, items }) => (
            <div key={category} className="md:px-6 first:md:pl-0 last:md:pr-0 flex flex-col gap-3">
              <p className="text-[#00ff41]/50 text-[10px] font-mono tracking-widest uppercase">
                <span className="text-[#00ff41]/25">$ </span>{category.toLowerCase()}
              </p>
              <div className="flex flex-wrap gap-2">
                {items.map((item) => (
                  <span
                    key={item}
                    className="text-[#00ff41] text-xs font-mono border border-[#00ff41]/20 px-2.5 py-1 rounded-sm hover:border-[#00ff41]/50 hover:bg-[#00ff41]/5 transition-colors duration-200"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <div ref={ctaRef} className="flex flex-wrap gap-4">
        <a
          href="mailto:jeremy.vir.kim@gmail.com"
          className="w-fit border border-white text-white font-[vcr-jp] text-sm px-6 py-3 hover:bg-white hover:text-black transition-colors duration-300"
        >
          Get in touch →
        </a>
        {/* <a
          href="https://res.cloudinary.com/dy1eb4rez/image/upload/v1774224507/CV_2024_b334df9f64.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="w-fit border border-white/30 text-white/60 font-[vcr-jp] text-sm px-6 py-3 hover:border-white hover:text-white transition-colors duration-300"
        >
          Resume ↓
        </a> */}
      </div>
    </section>
  )
}
