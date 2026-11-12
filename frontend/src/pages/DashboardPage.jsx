import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { cn } from '../utils/cn';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import GroupCard from '../components/groups/GroupCard';
import CreateGroupModal from '../components/groups/CreateGroupModal';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ScanLine,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Sparkles,
  ChevronRight,
  Utensils,
  Hotel,
  Car,
  GlassWater,
  Coffee,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Accommodation': Hotel,
  'Transport': Car,
  'Entertainment': GlassWater,
  'Coffee & Snacks': Coffee,
};

export default function DashboardPage() {
  const {
    currentUser,
    setCurrentUser,
    currentGroup,
    groups,
    expenses,
    settlements,
    currency,
    calculateGroupBalances,
  } = useApp();

  const [createGroupModalOpen, setCreateGroupModalOpen] = useState(false);
  const navigate = useNavigate();

  const groupExpenses = expenses.filter((e) => e.groupId === currentGroup?.id);
  const balances = calculateGroupBalances(currentGroup?.id);
  const myNetBalance = balances[currentUser.id] || 0;
  const isOwed = myNetBalance > 0.01;
  const owes = myNetBalance < -0.01;
  const isSettled = !isOwed && !owes;

  const amountReceivable = isOwed ? myNetBalance : 0;
  const amountOwed = owes ? Math.abs(myNetBalance) : 0;

  // Total group expenses
  const totalGroupSpend = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  // Dynamic Pending & Completed settlements count for this group
  const groupSettlements = settlements.filter((s) => s.groupId === currentGroup?.id);
  const pendingSettlementsCount = groupSettlements.filter((s) => s.status === 'Pending').length;

  // Dynamic chart data from actual expenses grouped by date
  const expensesByDate = {};
  groupExpenses.forEach((exp) => {
    const d = new Date(exp.date);
    const dateLabel = isNaN(d.getTime())
      ? 'Nov 08'
      : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    expensesByDate[dateLabel] = (expensesByDate[dateLabel] || 0) + Number(exp.amount);
  });

  const chartData = Object.entries(expensesByDate).map(([date, amount]) => ({
    date,
    amount,
  }));

  if (chartData.length === 0) {
    chartData.push({ date: 'Today', amount: 0 });
  }

  const recentTransactions = groupExpenses.slice(0, 5);

  const getMember = (id) =>
    currentGroup?.members?.find((m) => m.id === id) || { id, name: 'Unknown' };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-navy-950 via-brand-950 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-brand-900/60">
        <div className="absolute -top-12 -right-12 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">
              {currentGroup?.name || 'Goa Trip 2024'}
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs text-slate-300">
              {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Welcome back, {currentUser.name.split(' ')[0]} 👋
          </h2>

          <p className="text-xs md:text-sm text-slate-300 max-w-xl">
            {isOwed && (
              <>
                You are currently owed{' '}
                <strong className="text-emerald-400 font-bold">
                  {formatCurrency(amountReceivable, currency)}
                </strong>{' '}
                across {pendingSettlementsCount} pending transfers in this group.
              </>
            )}
            {owes && (
              <>
                You currently owe{' '}
                <strong className="text-rose-400 font-bold">
                  {formatCurrency(amountOwed, currency)}
                </strong>{' '}
                in pending settlements for this trip.
              </>
            )}
            {isSettled && (
              <>
                You are completely <strong className="text-emerald-400">squared up (₹0 debt)</strong> in {currentGroup?.name}.
              </>
            )}
          </p>

          {/* Quick Perspective Switcher on Dashboard */}
          <div className="pt-2 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-semibold">Demo Identity:</span>
            {currentGroup?.members?.map((m) => {
              const isSelected = m.id === currentUser.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setCurrentUser(m)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${isSelected
                    ? 'bg-brand-500 text-white shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-slate-300'
                    }`}
                >
                  <Avatar
                    src={m.avatar}
                    name={m.name || m.id || 'Member'}
                    size="xs"
                    showBorder={false}
                  />
                  <span>
                    {String(m.name || m.id || 'Member').split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          <Button
            variant="primary"
            size="md"
            icon={ScanLine}
            onClick={() => navigate('/scan')}
            className="bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/30"
          >
            Scan Receipt
          </Button>
          <Button
            variant="outline"
            size="md"
            icon={Plus}
            onClick={() => setCreateGroupModalOpen(true)}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20"
          >
            Create Group
          </Button>
        </div>
      </div>

      {/* Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Group Expenses */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Group Expenses
            </span>
            <div className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-950 tracking-tight">
            {formatCurrency(totalGroupSpend, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Across {groupExpenses.length} recorded bills
          </p>
        </Card>

        {/* You Are Owed (Receivable) */}
        <Card className="p-5 border-emerald-200/80 bg-gradient-to-br from-white to-emerald-50/20">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              You Are Owed
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">
            +{formatCurrency(amountReceivable, currency)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {isOwed ? 'Receivable from group members' : 'No receivables pending'}
          </p>
        </Card>

        {/* You Owe (Payable) */}
        <Card className={cn('p-5', owes && 'border-rose-200 bg-rose-50/20')}>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className={cn('text-xs font-bold uppercase tracking-wider', owes ? 'text-rose-700' : 'text-slate-400')}>
              You Owe
            </span>
            <div className={cn('w-8 h-8 rounded-xl flex items-center justify-center', owes ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500')}>
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className={cn('text-2xl font-black tracking-tight', owes ? 'text-rose-600' : 'text-slate-800')}>
            {owes ? `-${formatCurrency(amountOwed, currency)}` : `${currency === 'INR' ? '₹' : '$'}0`}
          </div>
          <p className={cn('text-xs font-semibold mt-1', owes ? 'text-rose-600' : 'text-emerald-600')}>
            {owes ? 'Personal payment pending' : '✓ All personal debts clear'}
          </p>
        </Card>

        {/* Net Settlement Status */}
        <Card className="p-5">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Settlements
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#0070BA]/10 text-[#003087] flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-navy-950 tracking-tight">
            {pendingSettlementsCount} Pending
          </div>
          <p
            className="text-xs text-brand-600 font-semibold mt-1 cursor-pointer hover:underline"
            onClick={() => navigate('/settlement')}
          >
            View Settlement Matrix →
          </p>
        </Card>
      </div>

      {/* Charts & Split Flow Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expense Overview Recharts AreaChart (2 cols) */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader
              action={
                <Badge variant="brand" size="sm">
                  Goa Trip Timeline
                </Badge>
              }
            >
              <CardTitle subtitle="Daily group expenditure and lodging costs">
                Expense Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                    <XAxis
                      dataKey="date"
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#94A3B8"
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v}`}
                    />
                    <Tooltip
                      formatter={(val) => [formatCurrency(val, currency), 'Spend']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderRadius: '12px',
                        border: 'none',
                        color: '#FFF',
                        fontSize: '12px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#4F46E5"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorSpend)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Assistant Quick Card (1 col) */}
        <div className="flex flex-col gap-4">
          <Card className="p-6 bg-gradient-to-br from-indigo-900 to-navy-950 text-white flex flex-col justify-between h-full shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-brand-500/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-brand-300 animate-pulse" />
                <Badge variant="brand" size="sm" className="bg-brand-500/30 text-brand-200 border-none font-bold">
                  AI Assistant
                </Badge>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                Need to split a complicated bill?
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Just ask in plain English: "Rahul and Aman share pizza. Kumar gets the burger. Everyone shares drinks."
              </p>

              <div className="space-y-2 text-xs">
                <button
                  type="button"
                  onClick={() => navigate('/assistant')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 text-xs"
                >
                  💬 "Who owes me the most money?"
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/assistant')}
                  className="w-full text-left p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 transition-colors border border-white/10 text-xs"
                >
                  ⚡ "How much did we spend on food?"
                </button>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-white/10">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/assistant')}
                className="w-full bg-brand-500 hover:bg-brand-600"
              >
                Chat with SplitSmart AI
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Active Groups & Recent Transactions Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Groups (1 col) */}
        <div className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">
              Active Groups ({groups.length})
            </h3>
            <button
              onClick={() => navigate('/groups')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {groups.slice(0, 3).map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                isCurrent={group.id === currentGroup?.id}
                currency={currency}
              />
            ))}
          </div>
        </div>

        {/* Recent Transactions (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-navy-900">
              Recent Transactions
            </h3>
            <button
              onClick={() => navigate(`/groups/${currentGroup?.id}`)}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View Full Ledger
            </button>
          </div>

          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-100">
              {recentTransactions.map((exp) => {
                const payer = getMember(exp.paidById);
                const Icon = CATEGORY_ICONS[exp.category] || Utensils;

                return (
                  <div
                    key={exp.id}
                    className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 text-navy-700 flex items-center justify-center shrink-0 border border-slate-200/80">
                        <Icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-navy-900 truncate">
                          {exp.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span>Paid by {payer.name.split(' ')[0]}</span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                          {exp.splitType && (
                            <>
                              <span>•</span>
                              <span className="text-brand-600 font-semibold">
                                {exp.splitType}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm sm:text-base font-bold text-navy-950 block">
                        {formatCurrency(exp.amount, currency)}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-600">
                        {exp.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={createGroupModalOpen}
        onClose={() => setCreateGroupModalOpen(false)}
      />
    </div>
  );
}

