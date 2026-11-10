import React, { useState } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import Avatar from '../common/Avatar';
import { useApp } from '../../context/AppContext';
import { GROUP_MEMBERS } from '../../services/mockData';
import { Users, Plus, Check } from 'lucide-react';

const CATEGORIES = [
  { name: 'Trip', label: 'Trip & Travel 🏖️' },
  { name: 'Home', label: 'Apartment & Flat 🏠' },
  { name: 'Event', label: 'Party & Outing 🎉' },
  { name: 'Project', label: 'Work & Hackathon ⚡' },
];

export default function CreateGroupModal({ isOpen, onClose }) {
  const { createGroup, currency } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Trip');
  const [description, setDescription] = useState('');
  const [selectedMemberIds, setSelectedMemberIds] = useState(
    GROUP_MEMBERS.map((m) => m.id)
  );
  const [customEmail, setCustomEmail] = useState('');

  const toggleMember = (id) => {
    if (selectedMemberIds.includes(id)) {
      if (selectedMemberIds.length > 1) {
        setSelectedMemberIds(selectedMemberIds.filter((mId) => mId !== id));
      }
    } else {
      setSelectedMemberIds([...selectedMemberIds, id]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const chosenMembers = GROUP_MEMBERS.filter((m) =>
      selectedMemberIds.includes(m.id)
    );

    createGroup({
      name,
      category,
      description,
      members: chosenMembers,
      currency,
    });

    setName('');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Group"
      subtitle="Organize trips, roommates, or shared outings"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Group Name"
          placeholder="e.g. Manali Snow Expedition 🏔️"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-1.5">
            Category
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => setCategory(c.name)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  category === c.name
                    ? 'border-brand-500 bg-brand-50/70 text-brand-700 ring-1 ring-brand-500'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Description (Optional)"
          placeholder="Brief description of the group"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {/* Member selection */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-navy-700 block mb-1.5">
            Include Members
          </label>
          <div className="space-y-2">
            {GROUP_MEMBERS.map((m) => {
              const isSelected = selectedMemberIds.includes(m.id);
              return (
                <div
                  key={m.id}
                  onClick={() => toggleMember(m.id)}
                  className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-brand-500 bg-brand-50/50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Avatar src={m.avatar} name={m.name} size="xs" />
                    <div>
                      <p className="text-xs font-bold text-navy-900">
                        {m.name} {m.isCurrentUser && '(You)'}
                      </p>
                      <p className="text-[10px] text-slate-500">{m.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-brand-600 text-white'
                        : 'border border-slate-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" icon={Plus}>
            Create Group
          </Button>
        </div>
      </form>
    </Modal>
  );
}

