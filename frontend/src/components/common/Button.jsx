import React from 'react';
import { cn } from '../../utils/cn';
import LoadingSpinner from './LoadingSpinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  type = 'button',
  onClick,
  ...props
}) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100 select-none cursor-pointer';

  const variants = {
    primary:
      'bg-brand-600 hover:bg-brand-700 text-white shadow-sm hover:shadow-md focus:ring-brand-500 border border-transparent',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-navy-800 focus:ring-slate-400 border border-slate-200/80',
    outline:
      'bg-white hover:bg-slate-50 text-navy-800 border border-slate-300 hover:border-slate-400 focus:ring-brand-500 shadow-sm',
    ghost:
      'bg-transparent hover:bg-slate-100 text-navy-700 hover:text-navy-900 focus:ring-slate-300',
    danger:
      'bg-rose-600 hover:bg-rose-700 text-white focus:ring-rose-500 shadow-sm',
    success:
      'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
    paypal:
      'bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-semibold border border-[#E0A820] shadow-sm hover:shadow focus:ring-[#0070BA]',
    paypalBlue:
      'bg-[#0070BA] hover:bg-[#003087] text-white font-semibold shadow-sm hover:shadow focus:ring-[#0070BA]',
  };

  const sizes = {
    xs: 'text-xs px-2.5 py-1.5 gap-1.5 rounded-lg',
    sm: 'text-sm px-3.5 py-2 gap-2 rounded-lg',
    md: 'text-sm px-4 py-2.5 gap-2.5',
    lg: 'text-base px-6 py-3 gap-3 rounded-2xl',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && (
        <LoadingSpinner
          size="sm"
          className="text-current"
        />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn('w-4 h-4 shrink-0', size === 'lg' && 'w-5 h-5')} />
      )}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn('w-4 h-4 shrink-0', size === 'lg' && 'w-5 h-5')} />
      )}
    </button>
  );
}

