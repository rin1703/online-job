import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const iconVariants = cva(
  `
    relative w-10 h-10 md:w-fit md:h-fit inline-flex items-center justify-center overflow-hidden
    font-default font-bold rounded-xl
    transition-all duration-300 active:scale-[0.97]
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
           border border-transparent
        `,
        primary: `
          bg-icon
          text-default
          border border-stroke
        `,
        custom: `
        text-black
        `,
      },
      size: {
        default: 'text-sm',
        sm: ' text-xs',
        lg: ' text-2xl',
      },
    },
    defaultVariants: {
      variant: 'custom',
      size: 'default',
    },
  },
);

interface IconBoxProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconVariants> {
  animation?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const IconBox = React.forwardRef<HTMLButtonElement, IconBoxProps>(
  ({ className, variant, size, animation = true, icon, ...props }, ref) => {
    // hover logic
    const hoverStyles =
      variant === 'default'
        ? 'hover:bg-icon hover:text-black hover:border hover:border-stroke'
        : variant === 'primary'
          ? 'hover:bg-default hover:text-white hover:border-default'
          : '';

    return (
      <span
        ref={ref}
        className={cn(
          'py-3 px-3',
          iconVariants({ variant, size }),
          animation && hoverStyles,
          className,
        )}
        {...props}
      >
        {icon}
        {props.children}
      </span>
    );
  },
);

IconBox.displayName = 'IconBox';
