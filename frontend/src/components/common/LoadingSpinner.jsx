import React from 'react';
import { cn } from '../../utils/cn';

export default function LoadingSpinner({ size = 'md', className, color = 'currentColor' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-9 h-9 border-3',
    xl: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]',
        sizeClasses[size] || sizeClasses.md,
        className
      )}
      style={{ color }}
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

