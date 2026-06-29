import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "outline" | "ghost" | "link" | "orange" | "black" | "gray" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const ButtonLowercase = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gray-900 text-white hover:bg-gray-800": variant === "default",
            "bg-orange-500 text-white hover:bg-orange-600": variant === "orange",
            "bg-gray-300 text-gray-500 cursor-not-allowed": variant === "gray",
            "border border-gray-300 bg-white hover:bg-gray-50 text-gray-800": variant === "outline",
            "bg-transparent hover:bg-gray-100 text-gray-800": variant === "ghost",
            "underline-offset-4 hover:underline text-blue-500": variant === "link",
            "bg-black text-white hover:bg-gray-900": variant === "black",
            "bg-red-500 text-white hover:bg-red-600": variant === "destructive",
          },
          {
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
ButtonLowercase.displayName = "ButtonLowercase"

export { ButtonLowercase }