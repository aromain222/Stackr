import { Layers } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: 'sm' | 'md'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Layers
        className={size === 'md' ? 'w-5 h-5 text-[#5B8BF5]' : 'w-4 h-4 text-[#5B8BF5]'}
      />
      <span
        className={
          size === 'md'
            ? 'font-semibold text-[#F0F2F8] tracking-tight'
            : 'text-sm font-medium text-[#7C8599]'
        }
      >
        Stackwise
      </span>
    </div>
  )
}
