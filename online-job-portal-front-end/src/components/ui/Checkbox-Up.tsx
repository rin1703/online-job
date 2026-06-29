import * as React from "react"

import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const CheckboxUp = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, children, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          className={cn(
            "h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500 focus:ring-2",
            className
          )}
          ref={ref}
          {...props}
        />
        {(label || children) && (
          <label className="text-sm text-gray-600 cursor-pointer">
            {label || children}
          </label>
        )}
      </div>
    )
  }
)
CheckboxUp.displayName = "Checkbox"

export { CheckboxUp }