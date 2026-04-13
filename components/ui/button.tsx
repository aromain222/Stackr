import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B8BF5] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080A0F] disabled:pointer-events-none disabled:opacity-40 select-none',
  {
    variants: {
      variant: {
        default:
          'bg-[#5B8BF5] text-white hover:bg-[#4A7AE4] active:bg-[#3A6AD4] shadow-lg shadow-[rgba(91,139,245,0.2)] hover:shadow-[rgba(91,139,245,0.35)] hover:shadow-xl',
        ghost:
          'text-[#7C8599] hover:text-[#F0F2F8] hover:bg-[#141720]',
        outline:
          'border border-[#1C2030] text-[#F0F2F8] hover:bg-[#141720] hover:border-[#2D3247]',
        success:
          'bg-[#00D4A0] text-[#080A0F] hover:bg-[#00C090] font-semibold shadow-lg shadow-[rgba(0,212,160,0.2)]',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-5 text-sm',
        lg: 'h-12 px-8 text-base',
        xl: 'h-14 px-10 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
