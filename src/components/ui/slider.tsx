import * as React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  value: number[]
  onValueChange: (value: number[]) => void
  min?: number
  max?: number
  step?: number
}

const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  ({ className, value, onValueChange, min = 0, max = 100, step = 1, ...props }, ref) => {
    const percentage = ((value[0] - min) / (max - min)) * 100

    return (
      <div ref={ref} className={cn('relative flex w-full touch-none select-none items-center', className)} {...props}>
        <div className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-gray-200">
          <div className="absolute h-full bg-brand-primary" style={{ width: `${percentage}%` }} />
        </div>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => onValueChange([Number(e.target.value)])}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    )
  }
)
Slider.displayName = 'Slider'

export { Slider }
