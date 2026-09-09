import { Slot } from 'radix-ui'
import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/utils'

export const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-300/45 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-amber-400 text-white shadow-[0_8px_24px_rgba(133,77,14,0.18)] hover:-translate-y-0.5 hover:bg-amber-500',
        outline:
          'border border-[#cfc3af] bg-[#fffaf0] text-[#181713] hover:-translate-y-0.5 hover:border-[#a99c86]',
        dark: 'bg-[#181713] text-white hover:-translate-y-0.5 hover:bg-black',
      },
      size: {
        default: 'min-h-11 px-5',
        large: 'min-h-12 px-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Component = asChild ? Slot.Root : 'button'

  return (
    <Component
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
