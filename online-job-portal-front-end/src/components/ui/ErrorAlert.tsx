import { AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  message: string;
  onDismiss?: () => void;
  className?: string;
  variant?: 'error' | 'warning' | 'info';
}

/**
 * Reusable Error Alert Component
 * Displays error messages in a consistent, user-friendly way
 *
 * Usage:
 *   <ErrorAlert message="Failed to save profile" onDismiss={() => setError(null)} />
 *   <ErrorAlert message="Please check your connection" variant="warning" />
 */
export function ErrorAlert({ message, onDismiss, className, variant = 'error' }: ErrorAlertProps) {
  const variantStyles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconStyles = {
    error: 'text-red-600',
    warning: 'text-yellow-600',
    info: 'text-blue-600',
  };

  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border',
        variantStyles[variant],
        className
      )}
    >
      <AlertCircle className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[variant])} />
      <div className="flex-1">
        <p className="text-sm font-medium leading-relaxed">{message}</p>
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 rounded-md p-1 hover:bg-black/5 transition-colors',
            iconStyles[variant]
          )}
          aria-label="Dismiss error"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
