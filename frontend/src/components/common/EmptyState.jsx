import React from 'react';
import { cn } from '../../utils/cn';
import Button from './Button';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 md:p-12 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50',
        className
      )}
    >
      {Icon && (
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-white shadow-card text-brand-600 mb-4 ring-8 ring-brand-50">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h4 className="text-base font-bold text-navy-900">{title}</h4>
      {description && (
        <p className="text-sm text-slate-500 max-w-sm mt-1 mb-5">{description}</p>
      )}
      {actionText && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}

