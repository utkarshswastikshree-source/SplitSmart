import React from 'react';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { formatCurrency } from '../../utils/formatters';
import { Users, Check, RotateCcw } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ItemAssigner({
  items,
  members,
  onChangeItems,
  currency = 'INR',
}) {
  // Toggle a member assignment on an item
  const handleToggleMember = (itemId, memberId) => {
    const updated = items.map((item) => {
      if (item.id === itemId) {
        const assigned = item.assignedMemberIds || [];
        const exists = assigned.includes(memberId);
        const newAssigned = exists
          ? assigned.filter((id) => id !== memberId)
          : [...assigned, memberId];

        // Ensure at least 1 person or default to all if empty
        return {
          ...item,
          assignedMemberIds: newAssigned,
        };
      }
      return item;
    });
    onChangeItems(updated);
  };

  // Assign all members to all items (Equal Split All)
  const handleEqualSplitAll = () => {
    const allMemberIds = members.map((m) => m.id);
    const updated = items.map((item) => ({
      ...item,
      assignedMemberIds: [...allMemberIds],
    }));
    onChangeItems(updated);
  };

  // Clear assignments
  const handleResetAssignments = () => {
    const updated = items.map((item) => ({
      ...item,
      assignedMemberIds: [],
    }));
    onChangeItems(updated);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Header with Quick Actions */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
        <div>
          <h3 className="text-base font-bold text-navy-900">
            Assign Items to Group Members
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Click member names to add or remove them from each bill line item.
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

      {/* Items list with member chips */}
      <div className="divide-y divide-slate-100">
        {items.map((item, index) => {
          const assignedIds = item.assignedMemberIds || [];
          const assignedCount = assignedIds.length || 1;
          const sharePerPerson = item.amount / assignedCount;

          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 hover:bg-slate-50/60 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">
                      {item.name}
                    </h4>
                    <span className="text-xs text-slate-500">
                      Qty: {item.qty} × {formatCurrency(item.price, currency)}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-bold text-navy-950 block">
                    {formatCurrency(item.amount, currency)}
                  </span>
                  {assignedIds.length > 0 && (
                    <span className="text-[11px] font-medium text-brand-600">
                      {formatCurrency(sharePerPerson, currency)} / person
                    </span>
                  )}
                </div>
              </div>

              {/* Member toggle selector */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                  Assigned to:
                </span>

                {members.map((member) => {
                  const isAssigned = assignedIds.includes(member.id);

                  return (
                    <button
                      key={member.id}
                      type="button"
                      onClick={() => handleToggleMember(item.id, member.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold transition-all select-none',
                        isAssigned
                          ? 'bg-brand-600 text-white shadow-xs ring-1 ring-brand-600'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
                      )}
                    >
                      <Avatar
                        src={member.avatar}
                        name={member.name}
                        size="xs"
                        showBorder={false}
                      />
                      <span>{member.name.split(' ')[0]}</span>
                      {isAssigned && <Check className="w-3 h-3 text-white ml-0.5" />}
                    </button>
                  );
                })}

                {assignedIds.length === 0 && (
                  <span className="text-xs text-amber-600 font-medium italic">
                    Unassigned (Tap members to split)
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

