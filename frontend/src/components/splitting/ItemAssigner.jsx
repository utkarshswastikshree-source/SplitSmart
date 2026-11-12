import React from 'react';
import Avatar from '../common/Avatar';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Users, RotateCcw, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ItemAssigner({
  items,
  members,
  onChangeItems,
  currency = 'INR',
}) {
  // Get the purchased quantity, supporting the old and new item formats.
  const getItemQuantity = (item) =>
    Number(item.quantity ?? item.qty ?? 0);

  // Get the current allocations.
  const getAllocations = (item) =>
    Array.isArray(item.allocations) ? item.allocations : [];

  // Update one member's allocated quantity for an item.
  const handleQuantityChange = (itemId, memberId, value) => {
    const updated = items.map((item) => {
      if (item.id !== itemId) return item;

      const allocations = getAllocations(item);
      const quantity = value === '' ? 0 : Number(value);

      const otherAllocations = allocations.filter(
        (allocation) => allocation.memberId !== memberId
      );

      if (!Number.isFinite(quantity) || quantity < 0) {
        return item;
      }

      return {
        ...item,
        allocations:
          quantity > 0
            ? [...otherAllocations, { memberId, quantity }]
            : otherAllocations,
      };
    });

    onChangeItems(updated);
  };

  // Divide each item's quantity equally among all members.
  const handleEqualSplitAll = () => {
    if (members.length === 0) return;

    const updated = items.map((item) => {
      const totalQuantity = getItemQuantity(item);
      const quantityPerMember = totalQuantity / members.length;

      const allocations = members.map((member, index) => {
        // Give the final member the remainder to avoid rounding differences.
        const allocatedQuantity =
          index === members.length - 1
            ? totalQuantity -
            quantityPerMember * (members.length - 1)
            : quantityPerMember;

        return {
          memberId: member.id,
          quantity: Number(allocatedQuantity.toFixed(6)),
        };
      });

      return {
        ...item,
        allocations,
      };
    });

    onChangeItems(updated);
  };

  // Remove all allocations.
  const handleResetAssignments = () => {
    const updated = items.map((item) => ({
      ...item,
      allocations: [],
    }));

    onChangeItems(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">

      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-navy-900">
            Assign Items to Group Members
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Enter how much of each item's quantity each member consumed.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Users}
            onClick={handleEqualSplitAll}
            className="text-xs"
          >
            Split All Equally
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={RotateCcw}
            onClick={handleResetAssignments}
            className="text-xs text-slate-500 hover:text-navy-900"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Items */}
      <div className="divide-y divide-slate-100">
        {items.map((item, index) => {
          const purchasedQuantity = getItemQuantity(item);
          const allocations = getAllocations(item);

          const allocatedQuantity = allocations.reduce(
            (sum, allocation) =>
              sum + Number(allocation.quantity || 0),
            0
          );

          const remainingQuantity =
            purchasedQuantity - allocatedQuantity;

          const isValid =
            purchasedQuantity > 0 &&
            Math.abs(remainingQuantity) < 0.000001;

          const unitPrice = Number(
            item.unitPrice ?? item.unit_price ?? item.price ?? 0
          );

          const totalPrice = Number(
            item.totalPrice ?? item.total_price ?? item.amount ?? 0
          );

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
            >
              {/* Item information */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>

                  <div>
                    <h4 className="text-sm font-bold text-navy-900">
                      {item.name}
                    </h4>

                    <span className="text-xs text-slate-500">
                      Qty: {purchasedQuantity} ×{' '}
                      {formatCurrency(unitPrice, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-navy-950 block">
                    {formatCurrency(totalPrice, currency)}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Original item total
                  </span>
                </div>
              </div>

              {/* Quantity allocation inputs */}
              <div className="space-y-3">
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Quantity consumed by each member
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {members.map((member) => {
                    const allocation = allocations.find(
                      (entry) => entry.memberId === member.id
                    );

                    const memberQuantity = allocation
                      ? allocation.quantity
                      : '';

                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-3 p-2.5 rounded-xl border border-slate-200 bg-slate-50/70"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Avatar
                            src={member.avatar}
                            name={member.name || member.id || 'Member'}
                            size="xs"
                            showBorder={false}
                          />

                          <span className="text-xs font-semibold text-navy-900 truncate">
                            {member.name || member.id || 'Member'}
                          </span>
                        </div>

                        <input
                          type="number"
                          min="0"
                          max={purchasedQuantity}
                          step="any"
                          value={memberQuantity}
                          placeholder="0"
                          onChange={(event) =>
                            handleQuantityChange(
                              item.id,
                              member.id,
                              event.target.value
                            )
                          }
                          className="w-20 px-2 py-1.5 text-sm text-center font-semibold border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Allocation validation */}
              <div
                className={cn(
                  'mt-3 flex items-center justify-between gap-2 text-xs font-medium',
                  isValid
                    ? 'text-emerald-600'
                    : 'text-amber-600'
                )}
              >
                <span className="flex items-center gap-1.5">
                  {isValid ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}

                  {isValid
                    ? 'Quantity fully allocated'
                    : 'Quantity allocation incomplete or exceeds total'}
                </span>

                <span>
                  Allocated: {allocatedQuantity.toFixed(3)} /{' '}
                  {purchasedQuantity}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}