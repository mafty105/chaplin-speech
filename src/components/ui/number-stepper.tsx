'use client'

import { Minus, Plus } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface NumberStepperProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  disabled?: boolean
  className?: string
}

export function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className
}: NumberStepperProps) {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="h-10 w-10 rounded-full"
        aria-label="減らす"
      >
        <Minus className="h-4 w-4" />
      </Button>
      
      <div className="w-16 text-center">
        <span className="text-2xl font-bold text-[#172B4D]">{value}</span>
      </div>
      
      <Button
        type="button"
        variant="secondary"
        size="icon"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="h-10 w-10 rounded-full"
        aria-label="増やす"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}