import React from 'react';
import { cn } from '../../utils/cn';

export default function Card({
  children,
  className,
  hoverable = false,
  bordered = true,
  onClick,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white rounded-2xl transition-all duration-200',
        bordered && 'border border-slate-200/80',
        'shadow-card',
        hoverable && 'hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, action }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-5 md:p-6 border-b border-slate-100',
        className
      )}
    >
      <div>{children}</div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function CardTitle({ children, className, subtitle }) {
  return (
    <div>
      <h3 className={cn('text-base md:text-lg font-bold text-navy-900 tracking-tight', className)}>
        {children}
      </h3>
      {subtitle && <p className="text-xs md:text-sm text-slate-500 mt-0.5">{subtitle}</p>}
    </div>
  );
}

export function CardContent({ children, className }) {
  return <div className={cn('p-5 md:p-6', className)}>{children}</div>;
}

export function CardFooter({ children, className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-between p-4 md:p-5 bg-slate-50/60 rounded-b-2xl border-t border-slate-100',
        className
      )}
    >
      {children}
    </div>
  );
}

