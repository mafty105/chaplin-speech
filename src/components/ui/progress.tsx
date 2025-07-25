import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  indicatorClassName?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, variant = 'default', ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variantStyles = {
      default: 'bg-[#0052CC]',
      success: 'bg-[#36B37E]',
      warning: 'bg-[#FFAB00]',
      danger: 'bg-[#FF5630]',
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "relative h-2 w-full overflow-hidden rounded-full bg-[#DFE1E6]",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full w-full flex-1 transition-all duration-300 ease-out",
            variantStyles[variant],
            indicatorClassName
          )}
          style={{ transform: `translateX(-${100 - percentage}%)` }}
        />
      </div>
    )
  }
)
Progress.displayName = "Progress"

export { Progress }