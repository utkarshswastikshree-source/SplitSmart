
import React, { useState } from 'react';
import Modal from '../common/Modal';
import Avatar from '../common/Avatar';
import PayPalButtonPlaceholder from './PayPalButtonPlaceholder';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  settlement,
  currency = 'INR',
}) {
  const { startPayPalPayment } = useApp();

  const [loading, setLoading] = useState(false);

  if (!settlement) return null;

  const { fromUser, toUser, amount } = settlement;

  const handlePayPalPayment = async () => {
    if (loading) return;

    setLoading(true);

    try {
      // Start the real backend PayPal payment flow
      await startPayPalPayment({
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: Number(amount),
      });

      // startPayPalPayment redirects to PayPal.
      // The browser leaves this page after successful initiation.

    } catch (error) {
      console.error('PayPal payment initiation failed:', error);

      // The error toast is already handled in AppContext.
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={loading ? () => { } : onClose}
      title="Settle Debt via PayPal"
      subtitle="Secure peer-to-peer settlement"
    >
      <div className="space-y-6">

        {/* Transfer Visual */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">

          {/* Sender */}
          <div className="flex flex-col items-center gap-1.5 text-center min-w-[90px]">
            <Avatar
              src={fromUser.avatar}
              name={fromUser.name}
              size="md"
            />

            <span className="text-xs font-bold text-navy-900 truncate max-w-[100px]">
              {fromUser.name.split(' ')[0]}
            </span>

            <span className="text-[10px] text-slate-400">
              Payer
            </span>
          </div>

          {/* Amount */}
          <div className="flex flex-col items-center px-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Paying
            </span>

            <span className="text-xl font-black text-brand-600">
              {formatCurrency(amount, currency)}
            </span>

            <ArrowRight className="w-4 h-4 text-emerald-600 mt-1" />
          </div>

          {/* Recipient */}
          <div className="flex flex-col items-center gap-1.5 text-center min-w-[90px]">
            <Avatar
              src={toUser.avatar}
              name={toUser.name}
              size="md"
            />

            <span className="text-xs font-bold text-navy-900 truncate max-w-[100px]">
              {toUser.name.split(' ')[0]}
            </span>

            <span className="text-[10px] text-emerald-600 font-semibold">
              Receiver
            </span>
          </div>
        </div>

        {/* Payment Information */}
        <div className="p-3.5 bg-brand-50/60 rounded-xl border border-brand-100 text-xs space-y-2">

          <div className="flex items-center gap-2 text-brand-900 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Secure PayPal Payment
          </div>

          <p className="text-brand-800">
            You will be redirected to PayPal to approve your payment.
            Your settlement will be marked completed only after
            the backend verifies the payment.
          </p>
        </div>

        {/* PayPal Button */}
        <PayPalButtonPlaceholder
          amount={amount}
          currency={currency}
          loading={loading}
          recipientName={toUser.name}
          onClick={handlePayPalPayment}
        />

        {/* Cancel */}
        <div className="text-center">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xs text-slate-400 hover:text-slate-600 font-medium disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </div>
    </Modal>
  );
}