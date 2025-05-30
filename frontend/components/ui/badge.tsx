"use client"; 

import type React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary-600",
        secondary: "bg-secondary-100 text-secondary-900 hover:bg-secondary-200",
        destructive: "bg-red-500 text-white hover:bg-red-600",
        outline: "text-gray-900 border border-gray-300",
        success: "bg-green-500 text-white hover:bg-green-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }

