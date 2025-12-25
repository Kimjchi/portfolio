import { Link, createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import Project from '@/components/Project'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const { t } = useTranslation()

  return (
    <>
      <div className="min-h-screen bg-[url('assets/photos/train.jpg')] bg-cover bg-center font-[vcr-jp] flex flex-col items-center">
        <h2 className="text-2xl md:text-3xl text-gray-800 font-[vcr-jp] pt-6 max-w-2xl text-center">
          Freelance fullstack developer from Paris, France with a small passion
          for creative stuff.
        </h2>
        <div className="flex-1" />
        <h1 className="text-4xl md:text-9xl text-gray-800 font-[vcr-jp] pb-4">
          Jeremy Kim
        </h1>
        <div className="grid grid-cols-3 w-full text-white p-2 text-xl">
          <div className="col-span-1">Freelance web developer</div>
          <div className="col-span-1 flex items-center justify-center">
            <a>Instagram</a>/<a>LinkedIn</a>/<a>GitHub</a>
          </div>
          <nav className="col-span-1 flex items-center justify-end gap-4 pr-2">
            <Link to="/">Home</Link>
            <Link to="/demo/start/server-funcs">Works</Link>
            <Link to="/demo/tanstack-query">About</Link>
          </nav>
        </div>
      </div>
      <div className="flex flex-col self-stretch">
        <Project
          title="Heatmap features"
          description="Heatmap features"
          image="https://strapi-production-e78b.up.railway.app/uploads/0ed25923_eae7_4241_bc8f_8d898c72af2a_Heatmap_features_4b4e39083e.png"
          link="https://www.google.com"
        />
      </div>
    </>
  )
}
