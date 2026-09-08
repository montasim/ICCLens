import { Switch as SwitchPrimitive } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        'inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-[var(--ink)] bg-white p-0.5 outline-none transition-colors data-[state=checked]:bg-[var(--signal)] focus-visible:ring-3 focus-visible:ring-[var(--ring)]/35',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-[var(--ink)] transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
