import * as React from "react"
import { cn } from "@/lib/utils"

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  icon?: React.ReactNode
}

const SelectUp = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, icon, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          className={cn(
            "flex h-12 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none",
            icon && "pr-10",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {icon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }
)
SelectUp.displayName = "Select"

export { SelectUp }