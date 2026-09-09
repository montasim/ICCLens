import * as React from 'react'

import { cn } from '../../lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full resize-none rounded-xl border border-divider bg-surface px-4 py-3 text-sm leading-6 text-content outline-none placeholder:text-content-muted focus-visible:border-action focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]/25',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
