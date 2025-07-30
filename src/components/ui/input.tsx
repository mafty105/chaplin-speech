import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded border border-[#DFE1E6] bg-[#FAFBFC] px-3 py-2 text-sm text-[#172B4D]",
          "placeholder:text-black file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "hover:bg-[#EBECF0] focus:bg-white focus:border-[#0052CC] focus:outline-none focus:ring-2 focus:ring-[#0052CC]/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-[#F4F5F7]",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }