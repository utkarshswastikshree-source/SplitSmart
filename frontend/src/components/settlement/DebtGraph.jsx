import React, { useState } from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import PaymentModal from './PaymentModal';
import { formatCurrency, simplifyDebts } from '../../utils/formatters';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Send,
  UserCheck,
  Lock,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useApp } from '../../context/AppContext';

export default function DebtGraph({
  members,
  balances,
  settlements,
  currency = 'INR',
  currentUserId,
}) {
  const { currentUser, setCurrentUser, addToast } = useApp();
  const [activePayment, setActivePayment] = useState(null);
  const [filterTab, setFilterTab] = useState('suggested'); // 'suggested' | 'history'

  // Calculate simplified transactions from net balances
  const simplifiedTransactions = simplifyDebts(balances);

  const getMember = (id) => members.find((m) => m.id === id) || { id, name: 'Unknown' };

  // Personal transactions for the logged in user
  const myDebtsToPay = simplifiedTransactions.filter((tx) => tx.from === currentUserId);
  const myReceivables = simplifiedTransactions.filter((tx) => tx.to === currentUserId);

  const handleSendReminder = (toMember, amount) => {
    addToast({
      type: 'info',
      title: 'Payment Reminder Sent',
      message: `Friendly WhatsApp & email notification sent to ${toMember.name} for ${formatCurrency(amount, currency)}.`,
    });
  };

  const handleSwitchUser = (member) => {
    setCurrentUser(member);
    addToast({
      type: 'info',
      title: 'Switched Demo Identity',
      message: `Now viewing from ${member.name}'s perspective.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Demo Perspective Switcher Pill */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-900 to-navy-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-brand-800">
        <div className="flex items-center gap-2.5">
          <UserCheck className="w-5 h-5 text-brand-300" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-brand-200">
              Demo Identity Perspective
            </h4>
            <p className="text-xs text-slate-300">
              Currently acting as <strong className="text-white">{currentUser.name}</strong> ({currentUser.role || 'Member'}).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-slate-400 mr-1">Switch to:</span>
          {members.map((m) => {
            const isMe = m.id === currentUserId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => handleSwitchUser(m)}
                className={cn(
                  'px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5',
                  isMe
                    ? 'bg-brand-500 text-white shadow-xs ring-1 ring-white/40'
                    : 'bg-white/10 hover:bg-white/20 text-slate-200'
                )}
              >
                <Avatar src={m.avatar} name={m.name} size="xs" showBorder={false} />
                <span>{m.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Overview Cards: Net balances for all members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {members.map((member) => {
          const balance = balances[member.id] || 0;
          const isCreditor = balance > 0.01;
          const isDebtor = balance < -0.01;
          const isSettled = !isCreditor && !isDebtor;

          return (
            <div
              key={member.id}
              className={cn(
                'p-4 rounded-2xl border transition-all duration-150 bg-white shadow-card',
                member.id === currentUserId && 'ring-2 ring-brand-500 border-brand-400 bg-brand-50/10',
                isCreditor && 'border-emerald-200/80',
                isDebtor && 'border-rose-200/80'
              )}
            >
              <div className="flex items-center gap-3 mb-3">
                <Avatar src={member.avatar} name={member.name} size="sm" />
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-navy-900 truncate flex items-center gap-1">
                    {member.name}
                    {member.id === currentUserId && (
                      <span className="text-[10px] text-brand-600 font-bold bg-brand-50 px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </h4>
                  <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Net Balance
                </span>
                <span
                  className={cn(
                    'text-lg font-black tracking-tight block mt-0.5',
                    isCreditor && 'text-emerald-600',
                    isDebtor && 'text-rose-600',
                    isSettled && 'text-slate-400'
                  )}
                >
                  {isCreditor && '+'}
                  {isDebtor && '-'}
                  {formatCurrency(Math.abs(balance), currency)}
                </span>
                <span className="text-[11px] font-medium text-slate-500">
                  {isCreditor && 'receives from group'}
                  {isDebtor && 'owes to group'}
                  {isSettled && 'all settled up'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SECTION 1: Personal Actionable Payments (Strictly for Current User) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Your Personal Actions ({currentUser.name})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Only debts you personally owe can be settled from your account.
            </p>
          </div>
          <Badge variant={myDebtsToPay.length > 0 ? 'warning' : 'success'} size="sm">
            {myDebtsToPay.length > 0 ? `${myDebtsToPay.length} Payment Required` : 'No Debts to Pay'}
          </Badge>
        </div>

        {myDebtsToPay.length > 0 ? (
          <div className="space-y-3">
            {myDebtsToPay.map((tx, idx) => {
              const to = getMember(tx.to);
              return (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar src={to.avatar} name={to.name} size="md" />
                    <div>
                      <h4 className="text-sm font-bold text-navy-900">
                        You owe {to.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        PayPal payee: <span className="font-mono text-slate-700">{to.paypalEmail}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <span className="text-lg font-black text-rose-600">
                      {formatCurrency(tx.amount, currency)}
                    </span>
                    <Button
                      variant="paypal"
                      size="sm"
                      onClick={() =>
                        setActivePayment({
                          fromUser: currentUser,
                          toUser: to,
                          amount: tx.amount,
                        })
                      }
                    >
                      Pay with PayPal (Demo)
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : myReceivables.length > 0 ? (
          <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>You have incoming receivables!</span>
            </div>
            <p className="text-xs text-emerald-700">
              You are owed money by other members. Other members must initiate payments from their respective accounts.
            </p>
            <div className="pt-2 space-y-2">
              {myReceivables.map((tx, idx) => {
                const from = getMember(tx.from);
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-200/80 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar src={from.avatar} name={from.name} size="xs" />
                      <span className="font-semibold text-navy-900">
                        {from.name} owes you {formatCurrency(tx.amount, currency)}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="xs"
                      icon={Send}
                      onClick={() => handleSendReminder(from, tx.amount)}
                    >
                      Send Reminder
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-slate-500">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-navy-900">You are all squared up!</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              You have no outstanding debts or receivables in this group.
            </p>
          </div>
        )}
      </div>

      {/* SECTION 2: Group-Wide Settlement Plan & History */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
        {/* Card header with tabs */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <h3 className="text-base font-bold text-navy-900">
                Group-Wide Min-Cash-Flow Plan
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Complete settlement matrix for all members ({members.length} people).
            </p>
          </div>

          <div className="flex items-center bg-slate-200/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setFilterTab('suggested')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                filterTab === 'suggested'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Suggested Transfers ({simplifiedTransactions.length})
            </button>
            <button
              onClick={() => setFilterTab('history')}
              className={cn(
                'px-3 py-1.5 rounded-lg transition-all',
                filterTab === 'history'
                  ? 'bg-white text-navy-900 shadow-xs'
                  : 'text-slate-600 hover:text-navy-900'
              )}
            >
              Payment History ({settlements.length})
            </button>
          </div>
        </div>

        {/* Tab 1: Suggested Transactions */}
        {filterTab === 'suggested' && (
          <div className="divide-y divide-slate-100">
            {simplifiedTransactions.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                <p className="font-bold text-navy-900 text-sm">All Debts Fully Settled!</p>
                <p className="text-xs text-slate-400 mt-1">
                  Nobody in this group owes any money right now.
                </p>
              </div>
            ) : (
              simplifiedTransactions.map((tx, idx) => {
                const from = getMember(tx.from);
                const to = getMember(tx.to);
                const canPay = from.id === currentUserId;

                return (
                  <div
                    key={idx}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {/* Payer */}
                      <div className="flex items-center gap-2">
                        <Avatar src={from.avatar} name={from.name} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-navy-900">
                            {from.name}
                            {from.id === currentUserId && (
                              <span className="text-brand-600 ml-1 font-semibold">(You)</span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400">owes</span>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mx-1" />

                      {/* Receiver */}
                      <div className="flex items-center gap-2">
                        <Avatar src={to.avatar} name={to.name} size="sm" />
                        <div>
                          <p className="text-xs font-bold text-navy-900">
                            {to.name}
                            {to.id === currentUserId && (
                              <span className="text-emerald-600 ml-1 font-semibold">(You)</span>
                            )}
                          </p>
                          <span className="text-[10px] text-slate-400">receives</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3">
                      <div className="text-right">
                        <span className="text-base font-black text-navy-950 block">
                          {formatCurrency(tx.amount, currency)}
                        </span>
                        <span className="text-[10px] font-semibold text-amber-600 uppercase">
                          Pending
                        </span>
                      </div>

                      {canPay ? (
                        <Button
                          variant="paypal"
                          size="sm"
                          onClick={() =>
                            setActivePayment({
                              fromUser: from,
                              toUser: to,
                              amount: tx.amount,
                            })
                          }
                        >
                          Pay with PayPal
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/80 inline-flex items-center gap-1.5">
                          <Lock className="w-3 h-3 text-slate-400" />
                          <span>{from.name.split(' ')[0]} must initiate</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Tab 2: Settlement History */}
        {filterTab === 'history' && (
          <div className="divide-y divide-slate-100">
            {settlements.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="font-bold text-navy-900 text-sm">No Settlement Records Yet</p>
                <p className="text-xs text-slate-400 mt-1">
                  Completed payments will appear here with transaction receipts.
                </p>
              </div>
            ) : (
              settlements.map((s) => {
                const from = getMember(s.fromUserId);
                const to = getMember(s.toUserId);

                return (
                  <div
                    key={s.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-navy-900">
                          {from.name} paid {to.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {s.note || 'Settlement'} • {s.paymentMethod || 'PayPal'}
                          {s.paypalTxnId && ` (${s.paypalTxnId})`}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-bold text-emerald-700 block">
                        {formatCurrency(s.amount, currency)}
                      </span>
                      <Badge variant="success" size="sm">
                        Completed
                      </Badge>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Payment execution modal */}
      <PaymentModal
        isOpen={!!activePayment}
        onClose={() => setActivePayment(null)}
        settlement={activePayment}
        currency={currency}
      />
    </div>
  );
}

