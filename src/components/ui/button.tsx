import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import * as React from 'react'

import { cn } from '../../lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[0.7rem] text-sm font-bold transition-[transform,background-color,color,box-shadow] outline-none focus-visible:ring-3 focus-visible:ring-[var(--ring)]/35 disabled:pointer-events-none disabled:opacity-45 active:translate-y-px',
  {
    variants: {
      variant: {
        default:
          'bg-[var(--primary)] text-white shadow-[0_8px_22px_rgba(17,18,15,0.18)] hover:-translate-y-0.5 hover:shadow-[0_10px_26px_rgba(17,18,15,0.22)]',
        outline:
          'border-2 border-[var(--ink)] bg-transparent text-[var(--ink)] hover:bg-[var(--signal)]',
        ghost: 'text-[var(--ink)] hover:bg-black/7',
      },
      size: {
        default: 'h-11 px-4',
        sm: 'h-9 px-3 text-xs',
        icon: 'size-10',
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
