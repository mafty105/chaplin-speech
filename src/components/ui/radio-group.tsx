'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const radioGroupVariants = cva(
  'space-y-2',
  {
    variants: {
      orientation: {
        vertical: 'flex flex-col',
        horizontal: 'flex flex-row space-y-0 space-x-4'
      }
    },
    defaultVariants: {
      orientation: 'vertical'
    }
  }
)

const radioItemVariants = cva(
  'flex items-center space-x-2 cursor-pointer',
  {
    variants: {
      disabled: {
        true: 'opacity-50 cursor-not-allowed',
        false: ''
      }
    },
    defaultVariants: {
      disabled: false
    }
  }
)

export interface RadioGroupProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof radioGroupVariants> {
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}

export interface RadioGroupItemProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof radioItemVariants> {
  value: string
  disabled?: boolean
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
}>({})

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, orientation, value, onValueChange, disabled, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange, disabled }}>
        <div
          ref={ref}
          className={cn(radioGroupVariants({ orientation }), className)}
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = 'RadioGroup'

export const RadioGroupItem = React.forwardRef<HTMLDivElement, RadioGroupItemProps>(
  ({ className, value, disabled: itemDisabled, children, onClick, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isDisabled = itemDisabled || context.disabled
    const isChecked = context.value === value

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!isDisabled && context.onValueChange) {
        context.onValueChange(value)
      }
      onClick?.(e)
    }

    return (
      <div
        ref={ref}
        className={cn(radioItemVariants({ disabled: isDisabled }), className)}
        onClick={handleClick}
        {...props}
      >
        <div className="relative">
          <div
            className={cn(
              'h-4 w-4 rounded-full border-2 transition-colors',
              isChecked
                ? 'border-[#0052CC] bg-[#0052CC]'
                : 'border-[#DFE1E6] bg-white',
              isDisabled && 'opacity-50'
            )}
          >
            {isChecked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-1.5 w-1.5 rounded-full bg-white" />
              </div>
            )}
          </div>
        </div>
        <label
          className={cn(
            'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
            isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'
          )}
        >
          {children}
        </label>
      </div>
    )
  }
)
RadioGroupItem.displayName = 'RadioGroupItem'