import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  ScanLine,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Button from '../common/Button';
import Avatar from '../common/Avatar';

export default function TopNav({ onMenuToggle, onOpenAddExpense }) {
  const { currentGroup, groups, setCurrentGroupId, currency, setCurrency, currentUser, setCurrentUser } = useApp();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Overview Dashboard';
    if (path === '/groups') return 'All Groups';
    if (path.startsWith('/groups/')) return currentGroup.name || 'Group Details';
    if (path === '/scan') return 'AI Receipt Scanner';
    if (path === '/split') return 'Smart Bill Splitting';
    if (path === '/settlement') return 'PayPal Debt Settlement';
    if (path === '/assistant') return 'Fintech AI Assistant';
    return 'SplitSmart';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200/80 h-16 flex items-center px-4 sm:px-6 justify-between select-none">
      {/* Left: Mobile hamburger & Page Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-base sm:text-lg font-bold text-navy-900 tracking-tight flex items-center gap-2">
            <span>{getPageTitle()}</span>
          </h1>
        </div>
      </div>

      {/* Right: Group dropdown, Currency toggle, Action CTAs */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Group Selector Dropdown */}
        <div className="hidden sm:flex items-center">
          <select
            value={currentGroup?.id}
            onChange={(e) => setCurrentGroupId(e.target.value)}
            className="text-xs font-semibold text-navy-800 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500/20 cursor-pointer"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {/* Currency Switcher */}
        <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200/60 text-xs font-bold">
          <button
            type="button"
            onClick={() => setCurrency('INR')}
            className={`px-2 py-1 rounded-lg transition-all ${
              currency === 'INR'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            ₹ INR
          </button>
          <button
            type="button"
            onClick={() => setCurrency('USD')}
            className={`px-2 py-1 rounded-lg transition-all ${
              currency === 'USD'
                ? 'bg-white text-navy-900 shadow-xs'
                : 'text-slate-500 hover:text-navy-900'
            }`}
          >
            $ USD
          </button>
        </div>

        {/* Scan Receipt Quick CTA */}
        <Button
          variant="outline"
          size="sm"
          icon={ScanLine}
          onClick={() => navigate('/scan')}
          className="hidden md:inline-flex border-brand-200 text-brand-700 hover:bg-brand-50"
        >
          Scan Bill
        </Button>

        {/* Add Expense Modal Trigger */}
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onOpenAddExpense}
        >
          <span className="hidden sm:inline">Add Expense</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* User Switcher Pill & Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200 hover:border-brand-300 hover:bg-slate-50 transition-all text-left"
          >
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="xs"
              status="online"
            />
            <div className="hidden xl:block min-w-0 pr-1">
              <p className="text-xs font-bold text-navy-900 truncate leading-none">
                {currentUser.name.split(' ')[0]}
              </p>
              <span className="text-[10px] text-slate-400 leading-none">
                Switch ▾
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-elevated border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3.5 py-2 border-b border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Switch Active Perspective
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Test balances & payments as:
                </p>
              </div>

              <div className="p-1 space-y-0.5">
                {(currentGroup?.members || []).map((m) => {
                  const isCurrent = m.id === currentUser.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setCurrentUser(m);
                        setUserMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors ${
                        isCurrent
                          ? 'bg-brand-50 text-brand-700 font-bold'
                          : 'hover:bg-slate-50 text-navy-900 text-xs font-medium'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Avatar src={m.avatar} name={m.name} size="xs" />
                        <div className="min-w-0">
                          <p className="text-xs font-bold truncate">
                            {m.name} {isCurrent && '(You)'}
                          </p>
                          <span className="text-[10px] text-slate-400 truncate block">
                            {m.role || 'Member'}
                          </span>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

