import { ArrowRight01Icon } from '@hugeicons/core-free-icons'

import { HugeIcon } from '../../components/ui/huge-icon'

interface PageBreadcrumbProps {
  homeHref: string
  currentLabel: string
  section?: { label: string; href?: string }
}

export function PageBreadcrumb({
  homeHref,
  currentLabel,
  section,
}: PageBreadcrumbProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mx-auto max-w-[1656px] px-4 pt-2 sm:px-6 lg:px-8 lg:pt-3"
    >
      <ol className="flex min-h-11 min-w-0 items-center gap-1 text-sm">
        <li className="shrink-0">
          <a
            href={homeHref}
            className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium text-content-secondary transition hover:bg-surface hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
          >
            Home
          </a>
        </li>
        <li aria-hidden="true" className="shrink-0 text-content-muted">
          <HugeIcon icon={ArrowRight01Icon} className="size-4" />
        </li>
        {section ? (
          <>
            <li className="shrink-0">
              {section.href ? (
                <a
                  href={section.href}
                  className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium text-content-secondary transition hover:bg-surface hover:text-action-on-surface focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-action/30"
                >
                  {section.label}
                </a>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-lg px-2 font-medium text-content-secondary">
                  {section.label}
                </span>
              )}
            </li>
            <li aria-hidden="true" className="shrink-0 text-content-muted">
              <HugeIcon icon={ArrowRight01Icon} className="size-4" />
            </li>
          </>
        ) : null}
        <li className="min-w-0">
          <span
            aria-current="page"
            title={currentLabel}
            className="block truncate px-2 font-medium text-content"
          >
            {currentLabel}
          </span>
        </li>
      </ol>
    </nav>
  )
}
