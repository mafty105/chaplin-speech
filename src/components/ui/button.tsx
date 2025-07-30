import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[#0052CC] text-white hover:bg-[#0065FF] active:bg-[#0747A6] focus-visible:ring-[#0052CC]",
        secondary:
          "bg-transparent text-[#172B4D] border border-[#DFE1E6] hover:bg-[#F4F5F7] active:bg-[#DFE1E6]",
        danger:
          "bg-[#FF5630] text-white hover:bg-[#FF7452] active:bg-[#DE350B] focus-visible:ring-[#FF5630]",
        subtle:
          "bg-transparent text-black hover:bg-[#F4F5F7] hover:text-[#172B4D] active:bg-[#DFE1E6]",
        link:
          "bg-transparent text-[#0052CC] hover:text-[#0065FF] hover:underline active:text-[#0747A6] p-0 h-auto",
      },
      size: {
        default: "h-9 px-3 py-2 text-sm rounded",
        sm: "h-8 px-2 py-1.5 text-xs rounded",
        lg: "h-10 px-4 py-2.5 text-base rounded",
        icon: "h-9 w-9 rounded",
      },
      spacing: {
        default: "",
        compact: "px-2",
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
      spacing: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, spacing, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, spacing, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }