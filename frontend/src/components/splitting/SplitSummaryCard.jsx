import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { CheckCircle2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export default function SplitSummaryCard({
  items,
  members,
  taxAmount = 0,
  serviceCharge = 0,
  grandTotal = 0,
  onConfirmSplit,
  currency = 'INR',
  isSubmitting = false,
}) {
  // Check for any unassigned items
  const unassignedItems = items.filter(
    (it) => !it.assignedMemberIds || it.assignedMemberIds.length === 0
  );

  // Calculate raw subtotal per member from assigned items
  const subtotal = items.reduce((acc, it) => acc + (Number(it.amount) || 0), 0);

  const memberShares = members.map((member) => {
    let itemTotal = 0;

    items.forEach((item) => {
      const assigned = item.assignedMemberIds || [];
      if (assigned.includes(member.id)) {
        itemTotal += item.amount / assigned.length;
      }
    });

    // Proportionate distribution of tax and service charge based on item share
    const ratio = subtotal > 0 ? itemTotal / subtotal : 1 / members.length;
    const taxShare = taxAmount * ratio;
    const serviceShare = serviceCharge * ratio;
    const totalShare = itemTotal + taxShare + serviceShare;

    return {
      ...member,
      itemTotal,
      taxShare,
      serviceShare,
      totalShare: Math.round(totalShare * 100) / 100,
    };
  });

  const totalAllocated = memberShares.reduce((sum, m) => sum + m.totalShare, 0);
  const isBalanced = Math.abs(totalAllocated - grandTotal) <= 1.0; // Allow 1 rupee rounding margin

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-card p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div>
            <h3 className="text-base font-bold text-navy-900">
              Individual Shares Summary
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Taxes and service charges are allocated proportionally.
            </p>
          </div>
          <Badge variant="brand" size="md">
            {members.length} Members
          </Badge>
        </div>

        {/* Validation warning if any item is unassigned */}
        {unassignedItems.length > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
            <span className="font-bold">⚠️</span>
            <span>
              <strong>{unassignedItems.length} item(s) unassigned:</strong> Assign all items to members to balance the bill total.
            </span>
          </div>
        )}

        {/* Member breakdown cards */}
        <div className="space-y-3">
          {memberShares.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Avatar src={m.avatar} name={m.name} size="sm" />
                <div>
                  <h4 className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                    {m.name}
                    {m.isCurrentUser && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 font-semibold px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Items: {formatCurrency(m.itemTotal, currency)} + Tax/Tip: {formatCurrency(m.taxShare + m.serviceShare, currency)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-sm font-extrabold text-navy-950 block">
                  {formatCurrency(m.totalShare, currency)}
                </span>
                <span className="text-[10px] text-slate-400">
                  {subtotal > 0 ? Math.round((m.itemTotal / subtotal) * 100) : 25}% of bill
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bill Total & Validation Balance recap */}
        <div className="mt-5 p-4 rounded-2xl bg-brand-50/50 border border-brand-100 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-600" />
              <span className="text-xs font-semibold text-brand-900">
                Sum of Allocations
              </span>
            </div>
            <span className="text-base font-black text-brand-900">
              {formatCurrency(totalAllocated, currency)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1 border-t border-brand-200/50 text-slate-600">
            <span>Bill Grand Total:</span>
            <span className="font-bold text-navy-900">{formatCurrency(grandTotal, currency)}</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-slate-500">Audit Status:</span>
            {isBalanced && unassignedItems.length === 0 ? (
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Balanced
              </span>
            ) : (
              <span className="font-bold text-amber-600">
                Pending full item assignment
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Action */}
      <div className="mt-6 pt-5 border-t border-slate-100 space-y-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => onConfirmSplit(memberShares)}
          loading={isSubmitting}
          disabled={unassignedItems.length > 0}
          icon={CheckCircle2}
          className="w-full shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:pointer-events-none"
        >
          {unassignedItems.length > 0
            ? 'Assign All Items to Continue'
            : 'Confirm Split & Record Expense'}
        </Button>

        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Generates instant debt balances for 1-click PayPal settlement</span>
        </div>
      </div>
    </div>
  );
}

