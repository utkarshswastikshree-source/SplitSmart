import React, { useEffect, useState } from 'react';

import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

import { parseSplitInstructionsWithGemini } from '../services/geminiService';

import AiPromptInput from '../components/splitting/AiPromptInput';
import ItemAssigner from '../components/splitting/ItemAssigner';
import SplitSummaryCard from '../components/splitting/SplitSummaryCard';

import Modal from '../components/common/Modal';
import Button from '../components/common/Button';

import { formatCurrency } from '../utils/formatters';

import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function SplittingPage() {
  useEffect(() => {
    if (activeScan) {
      setReceiptData(activeScan);
      setContributionAmounts({});
    }
  }, [activeScan]);
  const {
    activeScan,
    currentGroup,
    currency,
    addExpense,
    addToast,
  } = useApp();

  const navigate = useNavigate();

  const [receiptData, setReceiptData] = useState(activeScan);
  const [contributionAmounts, setContributionAmounts] = useState({});
  const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [isAiParsing, setIsAiParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const members = currentGroup?.members || [];
  const items = receiptData?.items || [];

  const billTotal = Number(receiptData?.grandTotal);

  // Do not silently use a fake receipt if the scanner data is missing.
  if (!receiptData) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 bg-white rounded-2xl border border-slate-200 text-center">
        <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-500" />

        <h2 className="text-lg font-bold text-navy-900">
          No receipt selected
        </h2>

        <p className="text-sm text-slate-500 mt-2">
          Please scan or select a receipt before creating a split.
        </p>

        <Button
          variant="primary"
          onClick={() => navigate('/scan')}
          className="mt-5"
        >
          Go to Scanner
        </Button>
      </div>
    );
  }

  const contributions = members.map((member) => ({
    memberId: member.id,
    name: member.name || member.id || 'Member',
    amountPaid:
      Math.round(
        (Number(contributionAmounts[member.id]) || 0) * 100
      ) / 100,
  }));

  const totalContributed = contributions.reduce(
    (sum, member) => sum + member.amountPaid,
    0
  );

  const remainingContribution =
    Math.round((billTotal - totalContributed) * 100) / 100;

  const contributionsValid =
    Number.isFinite(billTotal) &&
    billTotal > 0 &&
    Math.abs(remainingContribution) < 0.01;

  // Validate item allocations independently of financial contributions.
  const allocationStatus = items.map((item) => {
    const purchasedQuantity = Number(item.qty ?? item.quantity ?? 0);

    const allocations = Array.isArray(item.allocations)
      ? item.allocations
      : [];

    const allocatedQuantity = allocations.reduce(
      (sum, allocation) =>
        sum + Number(allocation.quantity || 0),
      0
    );

    return {
      itemId: item.id,
      itemName: item.name,
      purchasedQuantity,
      allocatedQuantity,
      valid:
        purchasedQuantity > 0 &&
        Math.abs(purchasedQuantity - allocatedQuantity) < 0.000001,
    };
  });
  const allItemsAllocated =
    items.length > 0 &&
    allocationStatus.every((item) => item.valid);

  const canReview =
    members.length > 0 &&
    contributionsValid &&
    allItemsAllocated;

  // Natural-language item assignment through Gemini.
  const handleParsePrompt = async (prompt) => {
    setIsAiParsing(true);

    try {
      const result = await parseSplitInstructionsWithGemini(
        prompt,
        items,
        members
      );

      setReceiptData((previous) => ({
        ...previous,
        items: result.items.map((item, index) => {
          const existingItem = items.find(
            (current) => current.id === item.id
          ) || items[index];

          return {
            ...existingItem,
            ...item,
            id: existingItem?.id || item.id,
          };
        }),
      }));

      addToast({
        type: 'success',
        title: 'AI Split Applied',
        message: result.summary || 'Item assignments updated.',
      });
    } catch (error) {
      console.error('AI split parsing failed:', error);

      addToast({
        type: 'error',
        title: 'Parsing Failed',
        message: 'Could not process the instruction.',
      });
    } finally {
      setIsAiParsing(false);
    }
  };

  const handleReview = () => {
    if (!members.length) {
      addToast({
        type: 'error',
        title: 'No Group Members',
        message: 'Add members to this group before splitting.',
      });
      return;
    }

    if (!allItemsAllocated) {
      addToast({
        type: 'error',
        title: 'Incomplete Item Allocation',
        message: 'Allocate the full quantity of every item.',
      });
      return;
    }

    if (!contributionsValid) {
      addToast({
        type: 'error',
        title: 'Contributions Mismatch',
        message: 'Total contributions must equal the bill total.',
      });
      return;
    }

    setConfirmationOpen(true);
  };

  const handleRecordExpense = async () => {
    if (isSubmitting) return;

    if (!canReview) {
      addToast({
        type: 'error',
        title: 'Validation Failed',
        message: 'Please check contributions and item allocations.',
      });
      return;
    }

    // The backend contract requires the original receipt response.
    if (
      !receiptData.receiptData ||
      typeof receiptData.receiptData !== 'object'
    ) {
      addToast({
        type: 'error',
        title: 'Receipt Data Missing',
        message:
          'The original receipt scan data is missing. Please scan the receipt again.',
      });
      return;
    }
    const invalidItems = items.some((item) => {
      const quantity = Number(item.qty ?? item.quantity);
      const unitPrice = Number(item.price ?? item.unitPrice);
      const totalPrice = Number(item.amount ?? item.totalPrice);

      return (
        !item.id ||
        !item.name?.trim() ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitPrice) ||
        unitPrice < 0 ||
        !Number.isFinite(totalPrice) ||
        totalPrice < 0
      );
    });

    if (invalidItems) {
      addToast({
        type: 'error',
        title: 'Invalid Item Details',
        message: 'Check item names, quantities and prices before saving.',
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const itemAssignments = items.map((item) => ({
        itemId: item.id,
        itemName: item.name,
        quantity: Number(item.qty ?? item.quantity),
        unitPrice: Number(item.price ?? item.unitPrice),
        totalPrice: Number(item.amount ?? item.totalPrice),

        allocations: (item.allocations || []).map((allocation) => ({
          memberId: allocation.memberId,
          quantity: Number(allocation.quantity),
        })),
      }));

      await addExpense({
        receiptData: receiptData.receiptData,

        contributions: contributions.map((member) => ({
          memberId: member.memberId,
          amountPaid: member.amountPaid,
        })),

        itemAssignments,
      });

      setConfirmationOpen(false);
      navigate('/settlement');
    } catch (error) {
      console.error('Failed to record expense:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <button
            onClick={() => navigate('/scan')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Scanner
          </button>

          <h2 className="text-2xl font-black tracking-tight text-navy-950">
            Smart Expense Splitting
          </h2>

          <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
            <span className="font-semibold text-navy-800">
              {receiptData.merchant || 'Receipt'}
            </span>

            <span>•</span>

            <span>{currentGroup?.name || 'No group selected'}</span>

            <span>•</span>

            <span>{items.length} Items</span>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Bill Total
          </span>

          <span className="text-2xl font-black text-navy-950">
            {formatCurrency(billTotal, currency)}
          </span>
        </div>
      </div>

      {/* AI Instructions */}
      <AiPromptInput
        onParsePrompt={handleParsePrompt}
        isParsing={isAiParsing}
      />

      {/* Contributions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft p-5 sm:p-6">

        <div className="mb-5">
          <h3 className="text-base font-bold text-navy-900">
            Who Actually Paid?
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Enter how much each member contributed. Leave zero if they
            did not pay anything.
          </p>
        </div>

        <div className="space-y-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/60"
            >
              <div>
                <p className="text-sm font-semibold text-navy-900">
                  {member.name || member.id || 'Member'}
                  {member.isCurrentUser && ' (You)'}
                </p>

                <p className="text-xs text-slate-500">
                  Contribution amount
                </p>
              </div>

              <div className="w-36">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={contributionAmounts[member.id] ?? ''}
                  onChange={(event) => {
                    const value = event.target.value;

                    if (value !== '' && Number(value) < 0) return;

                    setContributionAmounts((previous) => ({
                      ...previous,
                      [member.id]: value,
                    }));
                  }}
                  placeholder="₹ 0.00"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-right outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-2xl bg-brand-50 border border-brand-100 space-y-2">

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Bill total</span>
            <strong>{formatCurrency(billTotal, currency)}</strong>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-slate-600">Total contributed</span>
            <strong>{formatCurrency(totalContributed, currency)}</strong>
          </div>

          <div className="border-t border-brand-200 pt-2 flex justify-between text-sm">
            <span className="font-semibold text-navy-900">
              {remainingContribution > 0
                ? 'Amount remaining'
                : remainingContribution < 0
                  ? 'Excess contribution'
                  : 'Contribution status'}
            </span>

            <strong
              className={
                contributionsValid
                  ? 'text-emerald-600'
                  : 'text-amber-600'
              }
            >
              {contributionsValid
                ? 'Fully matched'
                : formatCurrency(
                  Math.abs(remainingContribution),
                  currency
                )}
            </strong>
          </div>
        </div>
      </div>

      {/* Item Allocation + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div className="lg:col-span-2 space-y-4">
          <ItemAssigner
            items={items}
            members={members}
            onChangeItems={(updatedItems) =>
              setReceiptData((previous) => ({
                ...previous,
                items: updatedItems,
              }))
            }
            currency={currency}
          />
        </div>

        <div className="lg:col-span-1">
          <SplitSummaryCard
            items={items}
            members={members}
            currency={currency}
            onConfirmSplit={handleReview}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        title="Confirm & Record Expense"
        subtitle={`Recording expense to ${currentGroup?.name || 'your group'}`}
      >
        <div className="space-y-5">

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Merchant</span>

              <strong className="text-navy-900">
                {receiptData.merchant || 'Receipt'}
              </strong>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Bill total</span>

              <strong className="text-brand-600">
                {formatCurrency(billTotal, currency)}
              </strong>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h4 className="text-xs font-bold text-slate-500 mb-2">
                CONTRIBUTIONS
              </h4>

              {contributions.map((member) => (
                <div
                  key={member.memberId}
                  className="flex justify-between text-xs py-1"
                >
                  <span className="text-slate-600">
                    {member.name}
                  </span>

                  <strong className="text-navy-900">
                    {formatCurrency(member.amountPaid, currency)}
                  </strong>
                </div>
              ))}

              <div className="flex justify-between text-xs pt-2 mt-2 border-t border-slate-200">
                <strong>Total contributed</strong>

                <strong className="text-emerald-600">
                  {formatCurrency(totalContributed, currency)}
                </strong>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3">
              <h4 className="text-xs font-bold text-slate-500 mb-2">
                ITEM ALLOCATION STATUS
              </h4>

              {allocationStatus.map((item) => (
                <div
                  key={item.itemId}
                  className="flex justify-between text-xs py-1"
                >
                  <span className="text-slate-600">
                    {item.itemName}
                  </span>

                  <strong
                    className={
                      item.valid
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }
                  >
                    {item.allocatedQuantity} / {item.purchasedQuantity}
                  </strong>
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
              Confirm & Save
            </Button>

          </div>
        </div>
      </Modal>
    </div>
  );
}