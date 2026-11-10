import React, { useState } from 'react';
import { cn } from '../../utils/cn';
import { getInitials, getAvatarColor } from '../../utils/formatters';

export default function Avatar({
  src,
  name = '',
  size = 'md',
  className,
  status,
  showBorder = true,
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm font-semibold',
    lg: 'w-12 h-12 text-base font-bold',
    xl: 'w-16 h-16 text-lg font-bold',
  };

  const statusColors = {
    online: 'bg-emerald-500',
    offline: 'bg-slate-300',
    away: 'bg-amber-400',
    settled: 'bg-brand-500',
  };

  const statusSize = {
    xs: 'w-1.5 h-1.5 ring-1',
    sm: 'w-2 h-2 ring-1.5',
    md: 'w-2.5 h-2.5 ring-2',
    lg: 'w-3 h-3 ring-2',
    xl: 'w-3.5 h-3.5 ring-2',
  };

  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);

  return (
    <div className={cn('relative inline-flex shrink-0 select-none', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full overflow-hidden',
          sizeClasses[size] || sizeClasses.md,
          showBorder && 'ring-2 ring-white shadow-sm',
          !src || imgError ? bgColor : 'bg-slate-100'
        )}
      >
        {src && !imgError ? (
          <img
            src={src}
            alt={name || 'Avatar'}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full ring-white',
            statusColors[status] || 'bg-slate-400',
            statusSize[size] || statusSize.md
          )}
        />
      )}
    </div>
  );
}

export function AvatarGroup({ children, max = 4, className }) {
  const childrenArray = React.Children.toArray(children);
  const visible = childrenArray.slice(0, max);
  const extra = childrenArray.length - max;

  return (
    <div className={cn('flex items-center -space-x-2 overflow-hidden', className)}>
      {visible.map((child, index) => (
        <div key={index} className="transition-transform hover:z-10 hover:scale-105">
          {child}
        </div>
      ))}
      {extra > 0 && (
        <div className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-200 text-navy-800 text-xs font-semibold ring-2 ring-white">
          +{extra}
        </div>
      )}
    </div>
  );
}

