import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card, { CardContent } from '../common/Card';
import Avatar, { AvatarGroup } from '../common/Avatar';
import Badge from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { ArrowRight, Receipt, Users } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function GroupCard({ group, isCurrent = false, currency = 'INR' }) {
  const navigate = useNavigate();
  const { calculateGroupBalances, currentUser, expenses } = useApp();

  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const totalGroupExpenses = groupExpenses.length > 0
    ? groupExpenses.reduce((sum, e) => sum + Number(e.amount), 0)
    : (group.totalExpenses || 0);

  const balances = calculateGroupBalances(group.id);
  const userNetBalance = balances[currentUser.id] !== undefined
    ? balances[currentUser.id]
    : (group.userNetBalance || 0);

  const isOwed = userNetBalance > 0.01;
  const owes = userNetBalance < -0.01;

  return (
    <Card
      hoverable
      onClick={() => navigate(`/groups/${group.id}`)}
      className={cn(
        'overflow-hidden flex flex-col justify-between group transition-all',
        isCurrent && 'ring-2 ring-brand-500/30'
      )}
    >
      {/* Cover image banner */}
      <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
        {group.coverImage ? (
          <img
            src={group.coverImage}
            alt={group.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-brand-600 to-indigo-700" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent" />

        <div className="absolute top-3 left-3">
          <Badge variant="brand" size="sm" className="bg-white/90 backdrop-blur-xs text-navy-900 border-none font-bold">
            {group.category || 'Group'}
          </Badge>
        </div>

        {isCurrent && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-extrabold bg-brand-500 text-white px-2 py-0.5 rounded-full shadow-sm">
              Active
            </span>
          </div>
        )}

        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
          <h3 className="text-base font-bold truncate drop-shadow-sm">
            {group.name}
          </h3>
        </div>
      </div>

      {/* Body details */}
      <CardContent className="p-4 space-y-4">
        {group.description && (
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {group.description}
          </p>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Total Spend
            </span>
            <span className="text-sm font-extrabold text-navy-950">
              {formatCurrency(totalGroupExpenses, currency)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
              Your Balance
            </span>
            <span
              className={cn(
                'text-sm font-extrabold',
                isOwed && 'text-emerald-600',
                owes && 'text-rose-600',
                !isOwed && !owes && 'text-slate-400'
              )}
            >
              {isOwed && '+'}
              {owes && '-'}
              {formatCurrency(Math.abs(userNetBalance), currency)}
            </span>
          </div>
        </div>

        {/* Member avatars */}
        <div className="flex items-center justify-between pt-1">
          <AvatarGroup max={4}>
            {group.members?.map((m) => (
              <Avatar key={m.id} src={m.avatar} name={m.name} size="xs" />
            ))}
          </AvatarGroup>

          <span className="inline-flex items-center text-xs font-semibold text-brand-600 group-hover:translate-x-0.5 transition-transform">
            View Group <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

