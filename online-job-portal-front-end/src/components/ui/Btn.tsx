import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Variants:
 * - default: bg var(--default), text var(--text-default)
 * - primary: bg var(--bg-btn-orange), text black, border 1px solid var(--color-default)
 * - outline: border var(--bg-btn-orange), text var(--bg-btn-orange), hover bg orange-50
 * - outlined: border màu cam, bg trắng, text cam (giống ảnh "More Opportunities")
 * - custom: chỉ giữ layout (font, size, radius, padding), để người dùng tự style qua className
 */
const buttonVariants = cva(
  `
    relative inline-flex items-center justify-center overflow-hidden
    font-default text-base font-medium rounded-xl
    py-2 px-3 transition-all duration-300 active:scale-[0.97]
    disabled:pointer-events-none disabled:opacity-50
    outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[color:var(--ring)]
    cursor-pointer
  `,
  {
    variants: {
      variant: {
        default: `
          bg-default
          text-white
          border-transparent
          hover:bg-primary-hover
        `,
        primary: `
          bg-btn-orange
          text-black
          border border-default
        `,
        outline: `
          bg-transparent
          text-[color:var(--bg-btn-orange)]
          border-2 border-[color:var(--bg-btn-orange)]
          hover:bg-orange-50
        `,
        outlineOrange: `
          bg-white
          text-orange-500
          border-2 border-orange-500
          rounded-full
          hover:bg-orange-50
          hover:border-orange-600
          hover:text-orange-600
        `,
        destructive: `
      bg-red-600
      text-white
      border border-transparent
      hover:bg-red-700
    `,
        filled: `
        bg-primary
        text-white
        border border-transparent
        hover:bg-primary-hover
        `,
        custom: `
          /* Không style màu — người dùng tự thêm qua className */
        `,
      },
      size: {
        default: "min-w-[100px]",
        sm: "text-[16px] py-1.5 px-3",
        lg: "text-[20px] py-3 px-6",
        icon: "p-2 rounded-[10px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  animation?: boolean; // bật/tắt hiệu ứng trượt text
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, animation = false, children, startIcon, endIcon, ...props },
    ref,
  ) => {
    const Comp = "button";

    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn("group/button", buttonVariants({ variant, size, className }))}
        {...props}
      >
        <div className="relative flex  items-center justify-center h-[1.5em]">
          <div className="flex flex-row items-center justify-center gap-2">
            {startIcon && (
              <span className="  flex-shrink-0 w-4 h-4 flex justify-center items-center">
                {startIcon}
              </span>
            )}
            <span
              className={cn(
                "transition-transform flex flex-row gap-2 items-center justify-center",
                animation && "group-hover/button:-translate-y-[130%]",
              )}
            >
              {children}
            </span>
            {endIcon && <span className="w-4 h-4 flex justify-center items-center">{endIcon}</span>}
          </div>
          {animation && (
            <div className="flex flex-row items-center gap-2">
              {startIcon && (
                <span className="w-4 h-4 flex justify-center items-center">{startIcon}</span>
              )}
              <span
                className={cn(
                  "absolute translate-y-[130%] transition-transform duration-200 ease-in-out",
                  "group-hover/button:translate-y-0",
                )}
              >
                {children}
              </span>
              {endIcon && (
                <span className="w-4 h-4 flex justify-center items-center">{endIcon}</span>
              )}
            </div>
          )}
        </div>
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
