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
        'inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-divider bg-surface-muted p-0.5 outline-none transition-colors data-[state=checked]:border-action data-[state=checked]:bg-action focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]/35',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-5 rounded-full bg-content shadow-sm transition-transform data-[state=checked]:translate-x-5 data-[state=checked]:bg-action-foreground" />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
