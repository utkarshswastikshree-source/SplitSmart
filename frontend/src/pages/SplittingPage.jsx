import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { parseSplitInstructionsWithGemini } from '../services/geminiService';
import AiPromptInput from '../components/splitting/AiPromptInput';
import ItemAssigner from '../components/splitting/ItemAssigner';
import SplitSummaryCard from '../components/splitting/SplitSummaryCard';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { formatCurrency } from '../utils/formatters';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  Receipt,
  Building2,
  Calendar,
} from 'lucide-react';
import { SAMPLE_RECEIPTS } from '../services/mockData';

export default function SplittingPage() {
  const {
    activeScan,
    currentGroup,
    currentUser,
    currency,
    addExpense,
    addToast,
  } = useApp();
  const navigate = useNavigate();

  // If activeScan isn't loaded from scanner, fallback to preset Sample 1 (Fisherman's Wharf Goa)
  const defaultReceipt = activeScan || {
    id: 'default-scan',
    merchant: "The Fisherman's Wharf, Salcette, Goa",
    date: '2024-11-08',
    category: 'Food & Dining',
    items: SAMPLE_RECEIPTS[0].items.map((it) => ({
      ...it,
      assignedMemberIds: currentGroup?.members ? currentGroup.members.map((m) => m.id) : [],
    })),
    subtotal: 5630,
    taxRate: 0.05,
    taxAmount: 281,
    serviceCharge: 250,
    grandTotal: 6161,
  };

  const [receiptData, setReceiptData] = useState(defaultReceipt);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [finalShares, setFinalShares] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = currentGroup?.members || [];

  // Parse natural language split instruction via Gemini AI
  const handleParsePrompt = async (prompt) => {
    setIsAiParsing(true);

    try {
      const res = await parseSplitInstructionsWithGemini(
        prompt,
        receiptData.items,
        members
      );

      setReceiptData((prev) => ({
        ...prev,
        items: res.items,
      }));

      addToast({
        type: 'success',
        title: 'AI Split Applied',
        message: res.summary,
      });
    } catch (err) {
      console.error(err);
      addToast({
        type: 'error',
        title: 'Parsing Failed',
        message: 'Could not process natural language instruction.',
      });
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleConfirmSplit = (shares) => {
    setFinalShares(shares);
    setConfirmationOpen(true);
  };

  const handleRecordExpense = async () => {
    if (isSubmitting) return;

    if (finalShares.length === 0) {
      addToast({
        type: 'error',
        title: 'No Split Available',
        message: 'Please calculate the member shares before saving.',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await addExpense({
        title: receiptData.merchant,
        amount: receiptData.grandTotal,
        category: 'Food & Dining',
        paidById: currentUser.id,
        splitType: 'AI Itemized Split',
        shares: finalShares.map((s) => ({
          memberId: s.id,
          amount: s.totalShare,
        })),
        notes: 'AI itemized bill split with taxes & service charges allocated proportionally.',
      });

      setConfirmationOpen(false);
      navigate('/settlement');

    } catch (error) {
      console.error('Failed to record split:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/scan')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Scanner</span>
          </button>
          <h2 className="text-2xl font-black tracking-tight text-navy-950">
            Smart Expense Splitting
          </h2>
          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
            <span className="font-semibold text-navy-800">{receiptData.merchant}</span>
            <span>•</span>
            <span>{currentGroup?.name || 'Goa Trip 2024'}</span>
            <span>•</span>
            <Badge variant="brand" size="sm">
              {receiptData.items.length} Items
            </Badge>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Bill Total
          </span>
          <span className="text-2xl font-black text-navy-950">
            {formatCurrency(receiptData.grandTotal, currency)}
          </span>
        </div>
      </div>

      {/* AI Prompt Instruction Input Banner */}
      <AiPromptInput
        onParsePrompt={handleParsePrompt}
        isParsing={isAiParsing}
      />

      {/* Main Splitting Workspace (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Item Assigner Table */}
        <div className="lg:col-span-2 space-y-4">
          <ItemAssigner
            items={receiptData.items}
            members={members}
            onChangeItems={(updatedItems) =>
              setReceiptData((prev) => ({ ...prev, items: updatedItems }))
            }
            currency={currency}
          />
        </div>

        {/* Right 1 Col: Individual Calculated Shares */}
        <div className="lg:col-span-1">
          <SplitSummaryCard
            items={receiptData.items}
            members={members}
            taxAmount={receiptData.taxAmount}
            serviceCharge={receiptData.serviceCharge}
            grandTotal={receiptData.grandTotal}
            onConfirmSplit={handleConfirmSplit}
            currency={currency}
          />
        </div>
      </div>

      {/* Final Split Confirmation Modal */}
      <Modal
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        title="Confirm & Record Split"
        subtitle={`Recording expense to ${currentGroup?.name}`}
      >
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Merchant / Title:</span>
              <span className="font-bold text-navy-900">{receiptData.merchant}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Paid By:</span>
              <span className="font-bold text-navy-900">{currentUser.name} (You)</span>
            </div>
            <div className="flex justify-between text-xs text-slate-500">
              <span>Grand Total:</span>
              <span className="font-bold text-brand-600 text-sm">
                {formatCurrency(receiptData.grandTotal, currency)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Individual Member Dues
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {finalShares.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs"
                >
                  <span className="font-semibold text-navy-900">
                    {m.name} {m.isCurrentUser && '(You)'}
                  </span>
                  <span className="font-bold text-navy-950">
                    {formatCurrency(m.totalShare, currency)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <Button
              variant="ghost"
              onClick={() => setConfirmationOpen(false)}
            >
              Back to Editing
            </Button>
            <Button
              variant="primary"
              onClick={handleRecordExpense}
              loading={isSubmitting}
              icon={CheckCircle2}
            >
              Confirm & Save to Ledger
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

