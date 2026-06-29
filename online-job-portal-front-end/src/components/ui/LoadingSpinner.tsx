import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Reusable Loading Spinner Component
 * Displays consistent loading state across the application
 *
 * Usage:
 *   <LoadingSpinner />
 *   <LoadingSpinner size="lg" message="Loading jobs..." />
 *   <LoadingSpinner fullScreen message="Processing..." />
 */
export function LoadingSpinner({
  size = 'md',
  message,
  className,
  fullScreen = false,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const spinner = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 className={cn('animate-spin text-primary', sizeClasses[size])} />
      {message && (
        <p className="text-sm text-muted-foreground font-medium animate-pulse">{message}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}

/**
 * Inline Loading Spinner (for buttons, small spaces)
 */
export function InlineSpinner({ className }: { className?: string }) {
  return <Loader2 className={cn('h-4 w-4 animate-spin', className)} />;
}
