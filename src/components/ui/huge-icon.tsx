import type { HugeiconsIconProps } from '@hugeicons/react'
import { HugeiconsIcon } from '@hugeicons/react'

export function HugeIcon({ strokeWidth = 2, ...props }: HugeiconsIconProps) {
  return (
    <HugeiconsIcon strokeWidth={strokeWidth} aria-hidden="true" {...props} />
  )
}
