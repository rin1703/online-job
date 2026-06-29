import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, message }) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg border border-stroke">
      <Icon className="w-12 h-12 text-text-blur mx-auto mb-3 opacity-50" />
      <p className="text-text-blur">{message}</p>
    </div>
  );
};
