import * as React from 'react';

import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'link' | 'orange' | 'black';
}

const ButtonUppercase = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-gray-900 text-white hover:bg-gray-800': variant === 'default',
            'bg-orange-500 text-white hover:bg-orange-600': variant === 'orange',
            'border border-gray-300 bg-white hover:bg-gray-50 text-gray-800': variant === 'outline',
            'bg-transparent hover:bg-gray-100 text-gray-800': variant === 'ghost',
            'underline-offset-4 hover:underline text-blue-500': variant === 'link',
            'bg-black text-white hover:bg-gray-900': variant === 'black',
          },
          className,
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  },
);
ButtonUppercase.displayName = 'ButtonUppercase';

export { ButtonUppercase };
