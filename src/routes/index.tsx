import { createFileRoute } from '@tanstack/react-router'

import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { useEffect } from 'react'
import AboutSection from '@/components/AboutSection'
import PhotosSection from '@/components/PhotosSection'
import ProjectsSection from '@/components/ProjectsSection'
import { getProjects } from '@/data/strapi.server'

gsap.registerPlugin(ScrambleTextPlugin, SplitText)

export const Route = createFileRoute('/')({
  component: App,
  loader: () => getProjects(),
})

function App() {
  // const { t } = useTranslation()
  const projects = Route.useLoaderData()

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
      <ProjectsSection projects={projects} />
      <div id="gallery"><PhotosSection /></div>
      <div id="about"><AboutSection /></div>
    </>
  )
}
