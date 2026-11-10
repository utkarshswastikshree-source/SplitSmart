import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import Card, { CardHeader, CardTitle, CardContent } from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import AddExpenseModal from '../components/groups/AddExpenseModal';
import DebtGraph from '../components/settlement/DebtGraph';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  ScanLine,
  Plus,
  Users,
  Receipt,
  CreditCard,
  BarChart3,
  Calendar,
  Utensils,
  Hotel,
  Car,
  GlassWater,
  Coffee,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';

const CATEGORY_ICONS = {
  'Food & Dining': Utensils,
  'Accommodation': Hotel,
  'Transport': Car,
  'Entertainment': GlassWater,
  'Coffee & Snacks': Coffee,
};

export default function GroupDetailPage() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const {
    groups,
    expenses,
    settlements,
    currentUser,
    currency,
    calculateGroupBalances,
  } = useApp();

  const [activeTab, setActiveTab] = useState('expenses'); // 'expenses' | 'balances' | 'members'
  const [addExpenseOpen, setAddExpenseOpen] = useState(false);

  const group = groups.find((g) => g.id === groupId) || groups[0];
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const balances = calculateGroupBalances(group.id);

  const totalSpend = groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

  const getMember = (id) =>
    group.members?.find((m) => m.id === id) || { id, name: 'Unknown' };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Group Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-navy-950 text-white p-6 sm:p-8 shadow-xl">
        {/* Cover Image Background */}
        {group.coverImage && (
          <div className="absolute inset-0 opacity-20">
            <img
              src={group.coverImage}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/90 to-brand-950/80" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" size="sm" className="bg-brand-500/20 text-brand-300 border-none font-bold">
                {group.category}
              </Badge>
              <span className="text-xs text-slate-400">Created {formatDate(group.createdAt)}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {group.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {group.description}
            </p>

            {/* Member Avatars list */}
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center -space-x-2">
                {group.members?.map((m) => (
                  <Avatar key={m.id} src={m.avatar} name={m.name} size="sm" />
                ))}
              </div>
              <span className="text-xs text-slate-300 font-semibold ml-2">
                {group.members?.map((m) => m.name.split(' ')[0]).join(', ')}
              </span>
            </div>
          </div>

          {/* Quick Action buttons & Total spend summary */}
          <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 text-right w-full md:w-auto">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">
                Total Expenses
              </span>
              <span className="text-2xl font-black text-white">
                {formatCurrency(totalSpend, currency)}
              </span>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button
                variant="primary"
                size="sm"
                icon={ScanLine}
                onClick={() => navigate('/scan')}
                className="bg-brand-500 hover:bg-brand-600 flex-1 md:flex-initial"
              >
                Scan Receipt
              </Button>
              <Button
                variant="outline"
                size="sm"
                icon={Plus}
                onClick={() => setAddExpenseOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 flex-1 md:flex-initial"
              >
                Add Expense
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        <button
          onClick={() => setActiveTab('expenses')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'expenses'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses ({groupExpenses.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'balances'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Balances & Settlement</span>
        </button>

        <button
          onClick={() => setActiveTab('members')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'members'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Members ({group.members?.length || 4})</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'analytics'
              ? 'border-brand-600 text-brand-600'
              : 'border-transparent text-slate-500 hover:text-navy-900'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Breakdown</span>
        </button>
      </div>

      {/* TAB 1: Expenses Timeline */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="divide-y divide-slate-100">
              {groupExpenses.map((exp) => {
                const payer = getMember(exp.paidById);
                const Icon = CATEGORY_ICONS[exp.category] || Utensils;

                return (
                  <div
                    key={exp.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-navy-900 truncate">
                          {exp.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                          <span>
                            Paid by <strong className="text-navy-800">{payer.name}</strong>
                          </span>
                          <span>•</span>
                          <span>{formatDate(exp.date)}</span>
                          <span>•</span>
                          <span className="text-brand-600 font-semibold bg-brand-50 px-2 py-0.5 rounded-md">
                            {exp.splitType}
                          </span>
                        </div>
                        {exp.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 italic">
                            "{exp.notes}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-black text-navy-950 block">
                        {formatCurrency(exp.amount, currency)}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {exp.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: Balances & PayPal Debt Matrix */}
      {activeTab === 'balances' && (
        <DebtGraph
          members={group.members || []}
          balances={balances}
          settlements={settlements.filter((s) => s.groupId === group.id)}
          currency={currency}
          currentUserId={currentUser.id}
        />
      )}

      {/* TAB 3: Members */}
      {activeTab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {group.members?.map((m) => (
            <Card key={m.id} className="p-5 flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <Avatar src={m.avatar} name={m.name} size="md" />
                <div>
                  <h4 className="text-sm font-bold text-navy-900 flex items-center gap-1.5">
                    {m.name}
                    {m.isCurrentUser && (
                      <span className="text-[10px] bg-brand-100 text-brand-700 font-semibold px-1.5 py-0.2 rounded">
                        You
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-slate-500">{m.email}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    PayPal: {m.paypalEmail || 'sandbox.paypal.com'}
                  </p>
                </div>
              </div>
              <Badge variant={m.role === 'Admin' ? 'brand' : 'neutral'} size="sm">
                {m.role || 'Member'}
              </Badge>
            </Card>
          ))}
        </div>
      )}

      {/* TAB 4: Trip Analytics */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category Spend Card */}
            <Card className="p-6">
              <CardTitle subtitle="Distribution of expenses across categories">
                Category Spending
              </CardTitle>
              <div className="mt-4 space-y-3.5">
                {Object.entries(
                  groupExpenses.reduce((acc, exp) => {
                    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
                    return acc;
                  }, {})
                ).map(([category, amount]) => {
                  const percent = totalSpend > 0 ? Math.round((amount / totalSpend) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold text-navy-900">
                        <span>{category}</span>
                        <span>{formatCurrency(amount, currency)} ({percent}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-brand-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Who Paid What BarChart */}
            <Card className="p-6">
              <CardTitle subtitle="Upfront payments made by each member">
                Who Paid What
              </CardTitle>
              <div className="h-64 w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={(group.members || []).map((m) => {
                      const paid = groupExpenses
                        .filter((e) => e.paidById === m.id)
                        .reduce((sum, e) => sum + Number(e.amount), 0);
                      return {
                        name: m.name.split(' ')[0],
                        amount: paid,
                      };
                    })}
                  >
                    <XAxis dataKey="name" fontSize={11} stroke="#94A3B8" />
                    <YAxis fontSize={11} stroke="#94A3B8" tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val) => [formatCurrency(val, currency), 'Paid']} />
                    <Bar dataKey="amount" fill="#6366F1" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      <AddExpenseModal
        isOpen={addExpenseOpen}
        onClose={() => setAddExpenseOpen(false)}
      />
    </div>
  );
}

