import React from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ScanLine,
  Split,
  CreditCard,
  BotMessageSquare,
  Sparkles,
  ChevronRight,
  LogOut,
  PlusCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import { cn } from '../../utils/cn';

export default function Sidebar({ onItemClick }) {
  const { currentUser, currentGroup, groups, setCurrentGroupId } = useApp();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Groups', href: '/groups', icon: Users, badge: groups.length },
    { name: 'AI Scanner', href: '/scan', icon: ScanLine, tag: 'AI Vision' },
    { name: 'Smart Splitting', href: '/split', icon: Split, tag: 'NLP' },
    { name: 'Settlement', href: '/settlement', icon: CreditCard, tag: 'PayPal' },
    { name: 'AI Assistant', href: '/assistant', icon: BotMessageSquare, highlight: true },
  ];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 select-none">
      <div className="flex flex-col flex-1 overflow-y-auto">
        {/* Brand header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight text-navy-900 leading-none">
                Split<span className="text-brand-600">Smart</span>
              </span>
              <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                Scan • Split • Settle
              </span>
            </div>
          </Link>
        </div>

        {/* Current Active Group Switcher Pill */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 hover:border-brand-200 transition-colors">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
              <span>Active Group</span>
              <Link to="/groups" className="text-brand-600 hover:text-brand-700">
                Change
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                🏖️
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-navy-900 truncate">
                  {currentGroup?.name || 'Goa Trip 2024'}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentGroup?.members?.length || 4} Members • ₹{currentGroup?.totalExpenses?.toLocaleString('en-IN') || '28,440'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="px-3 py-3">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Platform
          </p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  onClick={onItemClick}
                  className={cn(
                    'flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-navy-900',
                    item.highlight && !isActive && 'text-brand-600 hover:bg-brand-50/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-colors',
                        isActive
                          ? 'text-brand-600'
                          : 'text-slate-400 group-hover:text-slate-600',
                        item.highlight && 'text-brand-500'
                      )}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  )}

                  {item.tag && (
                    <span
                      className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase',
                        item.tag === 'PayPal'
                          ? 'bg-[#0070BA]/10 text-[#003087]'
                          : 'bg-brand-100 text-brand-700'
                      )}
                    >
                      {item.tag}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* AI Quick Prompt Card */}
        <div className="px-4 py-2 mt-auto">
          <Link
            to="/assistant"
            onClick={onItemClick}
            className="block p-3.5 rounded-2xl bg-gradient-to-br from-brand-900 via-indigo-900 to-navy-900 text-white shadow-md relative overflow-hidden group hover:shadow-lg transition-all"
          >
            <div className="absolute top-0 right-0 -mr-2 -mt-2 w-16 h-16 bg-brand-500/20 rounded-full blur-xl pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-4 h-4 text-brand-300 animate-pulse" />
              <span className="text-xs font-bold text-white tracking-wide">
                SplitSmart AI
              </span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug">
              Ask questions or split bills with plain English instructions.
            </p>
            <div className="mt-2.5 flex items-center text-[10px] font-semibold text-brand-200 group-hover:text-white transition-colors">
              <span>Open AI Chat</span>
              <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </div>

      {/* User profile footer */}
      <div className="p-4 border-t border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              src={currentUser.avatar}
              name={currentUser.name}
              size="sm"
              status="online"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-navy-900 truncate">
                {currentUser.name}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser.email}
              </p>
            </div>
          </div>
          <Link
            to="/login"
            title="Log Out"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}

