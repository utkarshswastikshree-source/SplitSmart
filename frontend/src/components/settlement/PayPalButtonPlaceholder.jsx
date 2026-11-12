import React from 'react';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { cn } from '../../utils/cn';

export default function PayPalButtonPlaceholder({
  onClick,
  amount,
  currency = 'INR',
  loading = false,
  recipientName = '',
  className,
}) {
  return (
    <div className={cn('w-full flex flex-col items-center gap-2', className)}>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className={cn(
          'w-full relative flex items-center justify-center gap-2.5 py-3 px-6 rounded-xl font-bold text-sm transition-all duration-200 select-none shadow-sm hover:shadow active:scale-[0.99] cursor-pointer',
          'bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] border border-[#E0A820]',
          loading && 'opacity-80 cursor-wait'
        )}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <LoadingSpinner size="sm" color="#003087" />
            <span>Connecting to PayPal Sandbox...</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 font-bold tracking-tight">
            <span className="italic font-extrabold text-base">Pay<span className="text-[#0079C1]">Pal</span></span>
            <span className="font-semibold text-xs ml-1 text-[#003087]">
              Checkout
            </span>
          </div>
        )}
      </button>

      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-medium">
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Secured by PayPal Sandbox SDK • 0% Peer Transfer Fee</span>
      </div>
    </div>
  );
}

