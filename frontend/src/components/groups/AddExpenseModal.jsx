import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { Utensils, Hotel, Car, GlassWater, Coffee, ShoppingBag, Plus } from 'lucide-react';

const CATEGORIES = [
  { name: 'Food & Dining', icon: Utensils },
  { name: 'Accommodation', icon: Hotel },
  { name: 'Transport', icon: Car },
  { name: 'Entertainment', icon: GlassWater },
  { name: 'Coffee & Snacks', icon: Coffee },
  { name: 'Groceries', icon: ShoppingBag },
];

export default function AddExpenseModal({ isOpen, onClose }) {
  const { currentGroup, currentUser, addExpense, currency } = useApp();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0].name);
  const [paidById, setPaidById] = useState(currentUser.id);
  const [splitWith, setSplitWith] = useState(
    currentGroup?.members ? currentGroup.members.map((m) => m.id) : []
  );
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const members = currentGroup?.members || [];

  const toggleMember = (id) => {
    if (splitWith.includes(id)) {
      if (splitWith.length > 1) {
        setSplitWith(splitWith.filter((mId) => mId !== id));
      }
    } else {
      setSplitWith([...splitWith, id]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (loading) return;

    if (!title.trim() || !amount || Number(amount) <= 0 || splitWith.length === 0) {
      return;
    }

    setLoading(true);

    try {
      const numericAmount = parseFloat(amount);
      const perPerson = numericAmount / splitWith.length;

      const shares = splitWith.map((mId) => ({
        memberId: mId,
        amount: perPerson,
      }));

      await addExpense({
        title,
        amount: numericAmount,
        category,
        paidById,
        splitType: splitWith.length === members.length ? 'Equal Split' : 'Custom Split',
        shares,
        notes,
      });

      setTitle('');
      setAmount('');
      setNotes('');
      onClose();

    } catch (error) {
      console.error('Failed to save expense:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add New Expense"
      subtitle={`Adding to ${currentGroup?.name || 'Group'}`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Expense Description"
          placeholder="e.g. Seafood Dinner at Wharf"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Total Amount"
            type="number"
            step="any"
            placeholder="0.00"
            prefix={currency === 'INR' ? '₹' : '$'}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-1.5">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-navy-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            >
              {CATEGORIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Paid by selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-1.5">
            Paid By
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {members.map((m) => {
              const isSelected = paidById === m.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaidById(m.id)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                >
                  <Avatar
                    src={m.avatar}
                    name={m.name || m.id || 'Member'}
                    size="xs"
                  />
                  <span className="text-xs font-semibold text-navy-900 truncate">
                    {String(m.name || m.id || 'Member').split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Split with members */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-navy-700">
              Split Among ({splitWith.length} members)
            </label>
            <button
              type="button"
              onClick={() => setSplitWith(members.map((m) => m.id))}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Select All
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {members.map((m) => {
              const isChecked = splitWith.includes(m.id);
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => toggleMember(m.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${isChecked
                    ? 'bg-brand-600 text-white border-brand-600 shadow-xs'
                    : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                >
                  <span>{m.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="Add any extra details, receipt code, etc."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" loading={loading} icon={Plus}>
            Save Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}

