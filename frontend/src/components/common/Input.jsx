import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

const Input = forwardRef(
  (
    {
      label,
      error,
      helperText,
      icon: Icon,
      iconPosition = 'left',
      prefix,
      suffix,
      className,
      containerClassName,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className={cn('w-full flex flex-col gap-1.5', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-semibold uppercase tracking-wider text-navy-700"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {Icon && iconPosition === 'left' && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
          {prefix && (
            <span className="absolute left-3.5 text-sm font-medium text-slate-500 pointer-events-none select-none">
              {prefix}
            </span>
          )}
          <input
            id={inputId}
            ref={ref}
            className={cn(
              'w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-navy-900 placeholder:text-slate-400 shadow-sm transition-all duration-150',
              'focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20',
              'disabled:bg-slate-50 disabled:text-slate-500 disabled:border-slate-200',
              error
                ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-300 hover:border-slate-400',
              Icon && iconPosition === 'left' && 'pl-10',
              Icon && iconPosition === 'right' && 'pr-10',
              prefix && 'pl-9',
              suffix && 'pr-9',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3.5 text-sm font-medium text-slate-500 pointer-events-none select-none">
              {suffix}
            </span>
          )}
          {Icon && iconPosition === 'right' && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
              <Icon className="w-4 h-4" />
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-rose-600 font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-slate-500">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

