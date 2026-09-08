import * as React from 'react'

import { cn } from '../../lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-32 w-full resize-none rounded-xl border-2 border-[var(--ink)] bg-white px-4 py-3 text-[15px] text-zinc-900 leading-6 outline-none placeholder:text-zinc-600 focus-visible:ring-3 focus-visible:ring-[var(--ring)]/35',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
