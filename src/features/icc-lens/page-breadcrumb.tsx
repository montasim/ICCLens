import { ArrowRight02Icon, Home01Icon } from '@hugeicons/core-free-icons'

import { HugeIcon } from '../../components/ui/huge-icon'

interface PageBreadcrumbProps {
  homeHref: string
  currentLabel: string
}

export function PageBreadcrumb({
  homeHref,
  currentLabel,
}: PageBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-[1512px] px-4 pt-3 sm:px-6 lg:px-8 lg:pt-4"
    >
      <ol className="flex min-h-11 min-w-0 items-center gap-1 text-sm">
        <li className="shrink-0">
          <a
            href={homeHref}
            className="-ml-2 inline-flex min-h-11 items-center gap-2 rounded-lg px-2 font-medium text-zinc-600 transition hover:bg-white hover:text-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-100"
          >
            <HugeIcon icon={Home01Icon} className="size-4" />
            Home
          </a>
        </li>
        <li aria-hidden="true" className="shrink-0 text-zinc-400">
          <HugeIcon icon={ArrowRight02Icon} className="size-4" />
        </li>
        <li className="min-w-0">
          <span
            aria-current="page"
            title={currentLabel}
            className="block truncate font-semibold text-zinc-800"
          >
            {currentLabel}
          </span>
        </li>
      </ol>
    </nav>
  )
}
