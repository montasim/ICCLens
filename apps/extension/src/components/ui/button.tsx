import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold transition-[transform,background-color,color,box-shadow,border-color] outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]/35 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-action text-action-foreground shadow-[0_8px_22px_var(--player-shadow-18)] hover:-translate-y-0.5 hover:bg-action-hover hover:shadow-[0_10px_26px_var(--player-shadow-20)]',
        outline:
          'border border-divider bg-surface text-content hover:border-action hover:bg-surface-muted',
        ghost:
          'text-content-secondary hover:bg-surface-muted hover:text-content',
        support:
          'bg-support text-support-foreground hover:-translate-y-0.5 hover:bg-support-hover',
        player: 'bg-player text-player-white hover:bg-player-hover',
      },
      size: {
        default: 'px-4',
        sm: 'h-9 px-3 text-xs',
        icon: 'size-11 min-h-0 p-0',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
