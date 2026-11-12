import React from 'react';
import { useApp } from '../context/AppContext';
import DebtGraph from '../components/settlement/DebtGraph';
import Badge from '../components/common/Badge';
import { CreditCard, ShieldCheck, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SettlementPage() {
  const { currentGroup, currentUser, settlements, currency, calculateGroupBalances } = useApp();

  const balances = calculateGroupBalances(currentGroup?.id);
  const groupSettlements = settlements.filter((s) => s.groupId === currentGroup?.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="paypal" size="sm">
              PayPal Settlement Engine
            </Badge>
            <span className="text-xs text-slate-400">
              Active Group: {currentGroup?.name || 'Goa Trip 2024'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-navy-950 mt-1">
            Group Debt Settlement
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resolve balances with minimum transfers and 1-click PayPal checkout.
          </p>
        </div>

        {/* Security badge pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs font-semibold self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>PayPal Sandbox Verified • 0% Platform Fees</span>
        </div>
      </div>

      {/* Main Interactive Debt Graph / Matrix Component */}
      <DebtGraph
        members={currentGroup?.members || []}
        balances={balances}
        settlements={groupSettlements}
        currency={currency}
        currentUserId={currentUser.id}
      />
    </div>
  );
}

