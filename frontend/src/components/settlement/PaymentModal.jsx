import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import PayPalButtonPlaceholder from './PayPalButtonPlaceholder';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { ArrowRight, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export default function PaymentModal({
  isOpen,
  onClose,
  settlement, // { fromUser, toUser, amount }
  currency = 'INR',
}) {
  const { settleDebt } = useApp();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txnResult, setTxnResult] = useState(null);

  if (!settlement) return null;

  const { fromUser, toUser, amount } = settlement;

  const handlePayPalPayment = async () => {
    setLoading(true);

    try {
      // Simulate PayPal Order creation and capture delay
      await new Promise((r) => setTimeout(r, 1400));

      const result = settleDebt({
        fromUserId: fromUser.id,
        toUserId: toUser.id,
        amount: Number(amount),
        paymentMethod: 'PayPal',
        note: `Settled via PayPal to ${toUser.name}`,
      });

      setTxnResult(result);
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    setSuccess(false);
    setTxnResult(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={success ? handleDone : onClose}
      title={success ? 'Payment Completed!' : 'Settle Debt via PayPal'}
      subtitle={success ? 'Transaction verified and recorded' : 'Instant peer-to-peer settlement'}
    >
      {success ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <h4 className="text-lg font-bold text-navy-900">
              {formatCurrency(amount, currency)} Sent!
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Paid to <span className="font-semibold text-navy-800">{toUser.name}</span> ({toUser.paypalEmail})
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
            <div className="flex justify-between text-slate-500">
              <span>PayPal Transaction ID:</span>
              <span className="font-mono font-semibold text-navy-800">
                {txnResult?.paypalTxnId || 'PAYID-MT79102948'}
              </span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Status:</span>
              <span className="font-semibold text-emerald-600">Settled (0% Fee)</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Timestamp:</span>
              <span className="text-navy-700">Just now</span>
            </div>
          </div>

          <Button variant="primary" size="md" onClick={handleDone} className="w-full">
            Done & Return to Ledger
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Transfer Visual */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            {/* Sender */}
            <div className="flex flex-col items-center gap-1.5 text-center min-w-[90px]">
              <Avatar src={fromUser.avatar} name={fromUser.name} size="md" />
              <span className="text-xs font-bold text-navy-900 truncate max-w-[100px]">
                {fromUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-slate-400">Payer</span>
            </div>

            {/* Amount in center */}
            <div className="flex flex-col items-center px-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Paying
              </span>
              <span className="text-xl font-black text-brand-600">
                {formatCurrency(amount, currency)}
              </span>
              <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-medium mt-0.5">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Recipient */}
            <div className="flex flex-col items-center gap-1.5 text-center min-w-[90px]">
              <Avatar src={toUser.avatar} name={toUser.name} size="md" />
              <span className="text-xs font-bold text-navy-900 truncate max-w-[100px]">
                {toUser.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-emerald-600 font-semibold">Receiver</span>
            </div>
          </div>

          {/* Recipient Account Details */}
          <div className="p-3.5 bg-brand-50/60 rounded-xl border border-brand-100 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-800 block">
              Recipient PayPal Account
            </span>
            <p className="font-semibold text-brand-950 font-mono">
              {toUser.paypalEmail || `${toUser.name.toLowerCase().replace(/\s+/g, '.')}@sandbox.paypal.com`}
            </p>
          </div>

          {/* PayPal Payment Button */}
          <PayPalButtonPlaceholder
            amount={amount}
            currency={currency}
            loading={loading}
            recipientName={toUser.name}
            onClick={handlePayPalPayment}
          />

          <div className="text-center">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}

