import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FieldErrorProps {
  message?: string;
  className?: string;
}

/**
 * Reusable Field Error Component
 * Displays validation errors below form fields
 *
 * Usage:
 *   <FieldError message={errors.email} />
 *   <FieldError message="This field is required" className="mt-1" />
 */
export function FieldError({ message, className }: FieldErrorProps) {
  if (!message) {
    return null;
  }

  return (
    <div
      role="alert"
      className={cn('flex items-center gap-1.5 text-sm text-red-600 mt-1', className)}
    >
      <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}
