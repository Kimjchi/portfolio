import { createFileRoute } from '@tanstack/react-router'

import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useEffect, useLayoutEffect, useRef } from 'react'
import Project from '@/components/Project'
import PhotosSection from '@/components/PhotosSection'
import AboutSection from '@/components/AboutSection'

gsap.registerPlugin(ScrambleTextPlugin, SplitText)
gsap.registerPlugin(ScrollTrigger) 


export const Route = createFileRoute('/')({ component: App })

function App() {
  // const { t } = useTranslation()
  const worksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let split
    split = SplitText.create('.split', {
      type: 'words, lines',
      mask: 'words',
      onSplit: (self) => {
        split = gsap.from(self.lines, {
          duration: 0.6,
          yPercent: 100,
          opacity: 0,
          stagger: 0.1,
          ease: 'expo.out',
        })
        return split
      },
    })
    gsap.from(split.words, {
      duration: 1,
      y: -100, // animate from 100px above
      autoAlpha: 0, // fade in from opacity: 0 and visibility: hidden
      stagger: 0.05, // 0.05 seconds between each
    })

    const nameText = new SplitText('.name', {
      type: 'chars',
      charsClass: 'char',
      position: 'relative',
    })
    gsap.from(nameText.chars, {
      duration: 1,
      autoAlpha: 0,
      stagger: 0.05,
      ease: 'expo.out',
      scrambleText: {
        text: 'x',
        chars: 'lowerCase',
        speed: 0.3,
        delimiter: ' ',
        tweenLength: false,
      },
    })

    let split2
    split2 = SplitText.create('.nav', {
      type: 'words, lines',
      mask: 'words',
      onSplit: (self) => {
        split2 = gsap.from(self.lines, {
          duration: 0.6,
          yPercent: 100,
          opacity: 0,
          stagger: 0.1,
          ease: 'expo.out',
        })
        return split2
      },
    })
    gsap.from(split2.words, {
      duration: 1,
      y: 100,
      autoAlpha: 0,
      stagger: 0.05,
      ease: 'expo.out',
    })

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
    const container = worksRef.current
    if (!container) return
    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-project-card]'))
    cards.forEach((card, i) => {
      if (i === 0) return
      if (i % 2 !== 0) {
        // Odd: will be revealed via clip-path from the right
        gsap.set(card, { clipPath: 'inset(0 100% 0 0)' })
      } else {
        // Even: will slide up from below
        gsap.set(card, { yPercent: 100 })
      }
    })
  }, [])

  // Stacking cards: pin the works container and drive transitions via a scrubbed timeline.
  // Odd cards reveal via clip-path (right → left) creating a side-by-side moment with the
  // previous card. Even cards slide up from below with a short pause so the current card
  // is seen alone before the transition.
  useEffect(() => {
    const container = worksRef.current
    if (!container) return

    const cards = Array.from(container.querySelectorAll<HTMLElement>('[data-project-card]'))
    const images = Array.from(container.querySelectorAll<HTMLElement>('[data-project-image]'))
    const N = cards.length
    if (N === 0) return

    const tl = gsap.timeline()
    cards.forEach((card, i) => {
      if (i === 0) return

      if (i % 2 !== 0) {
        // Odd card (image on right): clip-path reveal from right.
        // At 50% progress both images are simultaneously visible — side by side.
        tl.to(card, { clipPath: 'inset(0 0% 0 0)', ease: 'none', duration: 1 })
      } else {
        // Even card (image on left): brief pause so current card is seen alone,
        // then slide up from below with parallax on the outgoing image.
        tl.to({}, { duration: 0.4 })
        tl.to(card, { yPercent: 0, ease: 'none', duration: 1 })
        tl.to(images[i - 1], { yPercent: -12, ease: 'none', duration: 1 }, '<')
      }
    })

    // tl.duration() accounts for all tweens + pauses automatically
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
  }, [])

  return (
    <>
      <div className="min-h-screen bg-[url('assets/photos/train.jpg')] bg-cover bg-center font-[vcr-jp] flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl text-gray-800 font-[vcr-jp] pt-6 max-w-2xl text-center split">
          Freelance fullstack developer from Paris, France with a small passion
          for creative stuff.
        </h2>
        <div className="flex-1" />
        <h1 className="text-4xl md:text-9xl text-gray-300 font-[vcr-jp] pb-4 name">
          Jeremy Kim
        </h1>
        <div className="flex flex-col md:grid md:grid-cols-3 w-full text-white p-2 text-sm md:text-xl gap-2 md:gap-0">
          <div className="hidden md:block nav">Freelance web developer</div>
          <div className="flex items-center justify-center gap-1">
            <a className="group nav" href="https://www.instagram.com/kimjchi/" target="_blank" rel="noopener noreferrer">
              Instagram
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white" />
            </a>/
            <a className="nav group" href="https://www.linkedin.com/in/jérémy-v-kim" target="_blank" rel="noopener noreferrer">LinkedIn
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white" />
            </a>/
            <a className="nav group" href="https://github.com/Kimjchi" target="_blank" rel="noopener noreferrer">GitHub
              <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white" />
            </a>
          </div>
          <nav className="flex items-center justify-center md:justify-end gap-4 pr-2">
            {[
              { label: 'Works', id: 'works' },
              { label: 'Gallery', id: 'gallery' },
              { label: 'About', id: 'about' },
            ].map(({ label, id }) => (
              <button
                key={id}
                className="nav group cursor-pointer"
                onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })}
              >
                {label}
                <span className="block max-w-0 group-hover:max-w-full transition-all duration-500 h-0.5 bg-white" />
              </button>
            ))}
          </nav>
        </div>
      </div>
      <h2 id="works" className="works-title text-2xl md:text-7xl text-gray-200 font-[vcr-jp] py-8 text-center">
        My works
      </h2>
      {/* Pinned container — all cards are absolute inside, ScrollTrigger slides them in */}
      <div ref={worksRef} className="relative h-screen overflow-hidden">
        <Project
          title="Mytraffic"
          description="Mytraffic is a company that works on mobility."
          image="https://strapi-production-e78b.up.railway.app/uploads/0ed25923_eae7_4241_bc8f_8d898c72af2a_Heatmap_features_4b4e39083e.png"
          link="https://www.mytraffic.io/fr"
          index={0}
        />
        <Project
          title="Product showcase"
          description="This website was coded from scratch using React."
          image="https://strapi-production-e78b.up.railway.app/uploads/Chat_GPT_720c1a0bed.png"
          link="https://gpt-showcase.vercel.app/"
          index={1}
        />
        <Project
          title="Obangsaek"
          description="A blog website using react, next.js and tailwind."
          image="https://strapi-production-e78b.up.railway.app/uploads/Capture_d_ecran_2024_04_10_a_14_52_36_2964864f21.png"
          link="https://www.obangsaek.fr/"
          index={2}
        />
        <Project
          title="Photography portfolio"
          description="A portfolio for my photography work."
          image="https://strapi-production-e78b.up.railway.app/uploads/Photo_Portfolio_de69fa716b.png"
          link="https://photo-portfolio-puce.vercel.app/"
          index={3}
        />
        <Project
          title="Jammmming"
          description="This web application allow you to search for musics, add them to a playlist and add this playlist to your Spotify account."
          image="https://strapi-production-e78b.up.railway.app/uploads/projet_Jamming_e0e1cd8_0e418a6339.png"
          link="http://jamming.jeremykim.fr/"
          index={4}
        />
        <Project
          title="Ravenous"
          description="This is a yelp like web application that search and list restaurants depending on the location of your choice."
          image="https://strapi-production-e78b.up.railway.app/uploads/projet_Ravenous_a78f360_66f0f292e7.png"
          link="http://ravenous.jeremykim.fr/"
          index={5}
        />
      </div>
      <div id="gallery"><PhotosSection /></div>
      <div id="about"><AboutSection /></div>
    </>
  )
}
