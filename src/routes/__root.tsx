import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Suspense } from 'react'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import '../i18n'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Jeremy Kim — Fullstack Developer',
      },
      {
        name: 'description',
        content:
          'Freelance fullstack developer from Paris, France with a small passion for creative stuff.',
      },
      // Open Graph
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:url',
        content: 'https://jeremykim.fr/',
      },
      {
        property: 'og:title',
        content: 'Jeremy Kim — Fullstack Developer',
      },
      {
        property: 'og:description',
        content:
          'Freelance fullstack developer from Paris, France with a small passion for creative stuff.',
      },
      {
        property: 'og:image',
        content: 'https://jeremykim.fr/og-image.jpg',
      },
      // Twitter / X
      {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
      {
        name: 'twitter:title',
        content: 'Jeremy Kim — Fullstack Developer',
      },
      {
        name: 'twitter:description',
        content:
          'Freelance fullstack developer from Paris, France with a small passion for creative stuff.',
      },
      {
        name: 'twitter:image',
        content: 'https://jeremykim.fr/og-image.jpg',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        href: '/logo.svg',
        type: 'image/svg+xml',
      },
      {
        rel: 'preload',
        href: '/train.jpg',
        as: 'image',
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {/* <Header /> */}
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
        <Analytics />
      </body>
    </html>
  )
}
