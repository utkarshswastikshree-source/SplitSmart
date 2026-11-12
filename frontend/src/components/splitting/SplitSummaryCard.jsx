import React from 'react';
import Button from '../common/Button';
import { CheckCircle2, AlertCircle, Users, Package } from 'lucide-react';

export default function SplitSummaryCard({
  items = [],
  members = [],
  onConfirmSplit,
}) {
  const getQuantity = (item) =>
    Number(item.qty ?? item.quantity ?? 0);

  const getAllocations = (item) =>
    Array.isArray(item.allocations) ? item.allocations : [];

  const allocationDetails = items.map((item) => {
    const purchasedQuantity = getQuantity(item);

    const allocations = getAllocations(item);

    const allocatedQuantity = allocations.reduce(
      (sum, allocation) =>
        sum + Number(allocation.quantity || 0),
      0
    );

    const remainingQuantity =
      purchasedQuantity - allocatedQuantity;

    const valid =
      purchasedQuantity > 0 &&
      remainingQuantity >= -0.000001 &&
      Math.abs(remainingQuantity) < 0.000001;

    return {
      id: item.id,
      name: item.name,
      purchasedQuantity,
      allocatedQuantity,
      remainingQuantity,
      allocations,
      valid,
    };
  });

  const fullyAllocated = allocationDetails.filter(
    (item) => item.valid
  ).length;

  const incompleteItems = allocationDetails.filter(
    (item) => !item.valid
  );

  const allAllocated =
    items.length > 0 &&
    fullyAllocated === items.length;

  const canConfirm =
    allAllocated &&
    members.length > 0;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-soft p-5 space-y-5">

      {/* Heading */}
      <div>
        <h3 className="text-base font-bold text-navy-900">
          Allocation Summary
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Review who is consuming each item.
        </p>
      </div>

      {/* Summary counters */}
      <div className="grid grid-cols-2 gap-3">

        <div className="rounded-2xl bg-brand-50 border border-brand-100 p-3">
          <div className="flex items-center gap-2 text-brand-600">
            <Package className="w-4 h-4" />

            <span className="text-xs font-semibold">
              Total Items
            </span>
          </div>

          <p className="text-2xl font-black text-navy-900 mt-2">
            {items.length}
          </p>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-3">
          <div className="flex items-center gap-2 text-emerald-600">
            <CheckCircle2 className="w-4 h-4" />

            <span className="text-xs font-semibold">
              Completed
            </span>
          </div>

          <p className="text-2xl font-black text-navy-900 mt-2">
            {fullyAllocated}
            <span className="text-sm text-slate-400">
              /{items.length}
            </span>
          </p>
        </div>

      </div>

      {/* Allocation progress */}
      <div>
        <div className="flex justify-between text-xs mb-2">
          <span className="font-semibold text-slate-600">
            Allocation progress
          </span>

          <span className="font-bold text-navy-900">
            {items.length > 0
              ? Math.round((fullyAllocated / items.length) * 100)
              : 0}%
          </span>
        </div>

        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{
              width: `${items.length > 0
                  ? (fullyAllocated / items.length) * 100
                  : 0
                }%`,
            }}
          />
        </div>
      </div>

      {/* Individual item status */}
      <div>
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Item-wise Allocation
        </h4>

        {allocationDetails.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-4">
            No items available.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">

            {allocationDetails.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 bg-slate-50"
              >
                <div className="flex items-start justify-between gap-2">

                  <div>
                    <p className="text-sm font-semibold text-navy-900">
                      {item.name || 'Unnamed item'}
                    </p>

                    <p className="text-xs text-slate-500 mt-1">
                      Allocated: {item.allocatedQuantity} / {item.purchasedQuantity}
                    </p>
                  </div>

                  {item.valid ? (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      Complete
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                      Incomplete
                    </span>
                  )}

                </div>

                {/* Assigned members */}
                <div className="flex flex-wrap gap-1.5 mt-3">

                  {item.allocations.map((allocation, index) => {
                    const member = members.find(
                      (person) => person.id === allocation.memberId
                    );

                    return (
                      <span
                        key={`${allocation.memberId}-${index}`}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600"
                      >
                        {member?.name || member?.id || 'Member'}: {allocation.quantity}
                      </span>
                    );
                  })}

                  {item.allocations.length === 0 && (
                    <span className="text-[10px] text-slate-400">
                      No members assigned
                    </span>
                  )}

                </div>

                {!item.valid && (
                  <p className="text-[11px] text-amber-600 mt-2">
                    {item.remainingQuantity > 0
                      ? `${item.remainingQuantity} quantity still needs allocation.`
                      : 'Allocated quantity exceeds purchased quantity.'}
                  </p>
                )}
              </div>
            ))}

          </div>
        )}
      </div>

      {/* Member count */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2 text-slate-500">
          <Users className="w-4 h-4" />

          <span className="text-xs font-medium">
            Group members
          </span>
        </div>

        <span className="text-sm font-bold text-navy-900">
          {members.length}
        </span>
      </div>

      {/* Validation message */}
      {!allAllocated && (
        <div className="flex gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />

          <p className="text-xs text-amber-700">
            Allocate the complete quantity of every item before continuing.
          </p>
        </div>
      )}

      {allAllocated && members.length > 0 && (
        <div className="flex gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />

          <p className="text-xs text-emerald-700">
            All item quantities have been allocated successfully.
          </p>
        </div>
      )}

      {/* Continue */}
      <Button
        variant="primary"
        className="w-full"
        disabled={!canConfirm}
        onClick={onConfirmSplit}
      >
        Review & Confirm
      </Button>

    </div>
  );
}