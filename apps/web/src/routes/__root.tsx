import '@fontsource-variable/manrope'
import '@fontsource-variable/space-grotesk'
import '@fontsource/ibm-plex-mono/500.css'
import '../styles.css'

import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import type { ReactNode } from 'react'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      {
        name: 'description',
        content:
          'ICC Lens turns the ICC local media server into a clear, private Chrome catalog.',
      },
      { title: 'ICC Lens — A clearer local screening room' },
    ],
    links: [
      { rel: 'icon', href: '/brand/icc-lens.svg', type: 'image/svg+xml' },
    ],
  }),
  notFoundComponent: NotFoundPage,
  shellComponent: RootDocument,
})

function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-16">
      <div className="max-w-lg text-center">
        <p className="font-mono text-xs font-medium uppercase tracking-[0.16em] text-[#8a5a08]">
          Page not found
        </p>
        <h1 className="mt-4 font-display text-4xl font-medium tracking-[-0.03em] sm:text-5xl">
          This screening room is empty.
        </h1>
        <p className="mt-5 text-base font-medium leading-7 text-[#665f53]">
          The page you requested does not exist. Return to the ICC Lens overview
          to explore the extension.
        </p>
        <a
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-[#181713] px-6 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:bg-black focus-visible:ring-4 focus-visible:ring-amber-300/45"
        >
          Return home
        </a>
      </div>
    </main>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
