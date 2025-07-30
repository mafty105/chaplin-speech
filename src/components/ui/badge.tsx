import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-[#E6FCFF] text-[#0747A6] border border-[#B3F5FF]",
        primary:
          "bg-[#DEEBFF] text-[#0747A6] border border-[#B3D4FF]",
        success:
          "bg-[#E3FCEF] text-[#006644] border border-[#ABF5D1]",
        warning:
          "bg-[#FFF0B3] text-[#974F0C] border border-[#FFE380]",
        danger:
          "bg-[#FFEBE6] text-[#DE350B] border border-[#FFBDAD]",
        subtle:
          "bg-[#F4F5F7] text-black border border-[#DFE1E6]",
      },
      size: {
        default: "h-5",
        sm: "h-4 text-[11px]",
        lg: "h-6 text-sm",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }