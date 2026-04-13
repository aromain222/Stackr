import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide uppercase transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-[#1A2A4A] text-[#5B8BF5] border border-[#2D4070]',
        success: 'bg-[#002A20] text-[#00D4A0] border border-[#004030]',
        warning: 'bg-[#2A1A00] text-[#F5A623] border border-[#3A2A00]',
        danger: 'bg-[#2A0A0A] text-[#F56060] border border-[#3A1010]',
        purple: 'bg-[#1A0A2A] text-[#C084FC] border border-[#2A1040]',
        muted: 'bg-[#141720] text-[#7C8599] border border-[#1C2030]',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
