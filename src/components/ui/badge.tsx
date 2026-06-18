import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center rounded-tag border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-interactive focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-brand-primary text-white',
        secondary: 'border-transparent bg-brand-light text-brand-primary',
        success: 'border-transparent bg-status-success/10 text-status-success',
        warning: 'border-transparent bg-status-warning/10 text-status-warning',
        danger: 'border-transparent bg-status-danger/10 text-status-danger',
        outline: 'text-text-primary border-gray-200',
        gold: 'border-transparent bg-accent-gold/10 text-accent-gold',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
