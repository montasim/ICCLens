import { Film01Icon, FolderLibraryIcon } from '@hugeicons/core-free-icons'
import { useState } from 'react'

import { HugeIcon } from '../../components/ui/huge-icon'
import type { CatalogItem } from '../../domain/icc-page'

interface CatalogCardProps {
  item: CatalogItem
  imageLoading?: 'eager' | 'lazy'
}

export function CatalogCard({ item, imageLoading = 'lazy' }: CatalogCardProps) {
  const [failedImageHref, setFailedImageHref] = useState<string | null>(null)
  const showImage = Boolean(
    item.imageHref && item.imageHref !== failedImageHref,
  )

  return (
    <article className="min-w-0">
      <a
        href={item.href}
        className="group block rounded-2xl focus:outline-none focus:ring-4 focus:ring-violet-200 motion-reduce:transform-none"
        aria-label={`${item.title}. ${item.action === 'download' ? 'Starts a download.' : 'Opens details.'}`}
      >
        <span className="relative block aspect-[3/4] overflow-hidden rounded-2xl bg-zinc-200 shadow-[0_8px_24px_rgba(24,24,27,0.08)] transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_18px_36px_rgba(24,24,27,0.16)] motion-reduce:transform-none motion-reduce:transition-none">
          {showImage ? (
            <img
              src={item.imageHref ?? undefined}
              alt=""
              loading={imageLoading}
              decoding="async"
              onError={() => setFailedImageHref(item.imageHref)}
              className="size-full object-cover transition duration-500 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
            />
          ) : (
            <span
              data-icc-lens-poster-placeholder=""
              aria-hidden="true"
              className="grid size-full place-items-center bg-violet-100 text-violet-700"
            >
              <HugeIcon
                icon={
                  item.action === 'download' ? FolderLibraryIcon : Film01Icon
                }
                className="size-12"
              />
            </span>
          )}
          <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent p-4 pt-16 text-white">
            <strong className="line-clamp-1 text-[15px] font-bold leading-[1.3] tracking-[-0.01em] group-hover:line-clamp-none group-focus:line-clamp-none">
              {item.title}
            </strong>
          </span>
        </span>
        <span className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold text-zinc-600">
          {item.age ? <span>{item.age}</span> : <span>Recently added</span>}
          {item.hits ? <span>{item.hits}</span> : null}
        </span>
      </a>
    </article>
  )
}
