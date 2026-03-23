import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-full border-2 px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-sm',
  {
    variants: {
      variant: {
        default: 'border-primary/30 bg-primary text-primary-foreground hover:bg-primary/80',
        secondary: 'border-secondary/30 bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive: 'border-destructive/30 bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground border-gray-400',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
