import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, Sparkles, Building2, Calendar, Receipt, Eye } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import Badge from '../common/Badge';
import ReceiptPreviewModal from './ReceiptPreviewModal';
import { formatCurrency } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export default function ExtractedItemsTable({
  extractedData,
  onChange,
  onProceedToSplit,
  currency = 'INR',
}) {
  const [editingItemId, setEditingItemId] = useState(null);
  const [merchantName, setMerchantName] = useState(extractedData.merchant);
  const [editingMerchant, setEditingMerchant] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  const items = extractedData.items || [];

  const handleItemChange = (id, field, value) => {
    const updated = items.map((item) => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'qty' || field === 'price') {
          const qty = field === 'qty'
            ? Math.max(0, parseFloat(value) || 0)
            : item.qty;
          const price = field === 'price' ? Math.max(0, parseFloat(value) || 0) : item.price;
          updatedItem.qty = qty;
          updatedItem.price = price;
          updatedItem.amount = qty * price;
        }
        return updatedItem;
      }
      return item;
    });

    recalculate(updated);
  };
  const handleAddItem = () => {
    const newItem = {
      id: `it-${Date.now()}`,
      name: 'New Item',
      qty: 1,
      price: 100,
      amount: 100,
      allocations: [],
      assignedMemberIds: [],
    };

    const updated = [...items, newItem];

    recalculate(updated);
    setEditingItemId(newItem.id);
  };

  const handleDeleteItem = (id) => {
    if (items.length <= 1) return;
    const updated = items.filter((item) => item.id !== id);
    recalculate(updated);
  };

  const recalculate = (updatedItems) => {
    onChange({
      ...extractedData,
      merchant: merchantName,
      items: updatedItems,
    });
  };
  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-soft overflow-hidden">
      {/* Receipt Header details */}
      <div className="p-6 bg-slate-50/80 border-b border-slate-200/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              {editingMerchant ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={merchantName}
                    onChange={(e) => setMerchantName(e.target.value)}
                    className="py-1 px-2.5 text-sm"
                  />
                  <Button
                    size="xs"
                    variant="primary"
                    onClick={() => {
                      setEditingMerchant(false);
                      onChange({ ...extractedData, merchant: merchantName });
                    }}
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-navy-900">{merchantName}</h3>
                  <button
                    onClick={() => setEditingMerchant(true)}
                    className="text-slate-400 hover:text-navy-900 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {extractedData.date || 'Today'}
                </span>
                <span className="text-slate-300">•</span>
                <Badge variant="brand" size="sm">
                  AI Receipt Extraction
                </Badge>
                {extractedData.image && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalOpen(true)}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md hover:bg-brand-100 transition-colors"
                  >
                    <Eye className="w-3 h-3" />
                    <span>Inspect Image</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Calculated Total
            </span>
            <span className="text-2xl font-black text-navy-900">
              {formatCurrency(extractedData.grandTotal, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Items list / table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-100/60 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 sm:px-6">Item Description</th>
              <th className="py-3 px-3 text-center w-20">Qty</th>
              <th className="py-3 px-3 text-right w-28">Price</th>
              <th className="py-3 px-4 text-right w-28">Total</th>
              <th className="py-3 px-3 text-center w-16">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item) => {
              const isEditing = editingItemId === item.id;

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4 sm:px-6 font-medium text-navy-900">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                        className="w-full px-2 py-1 text-sm rounded-lg border border-brand-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
                      />
                    ) : (
                      <span>{item.name}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-center text-slate-600">
                    {isEditing ? (
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={item.qty}
                        onChange={(e) =>
                          handleItemChange(item.id, 'qty', e.target.value)
                        }
                        className="w-14 px-1.5 py-1 text-center text-sm rounded-lg border border-brand-300 focus:outline-none"
                      />
                    ) : (
                      <span>{item.qty}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-3 text-right font-medium text-slate-700">
                    {isEditing ? (
                      <input
                        type="number"
                        step="any"
                        value={item.price}
                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                        className="w-20 px-1.5 py-1 text-right text-sm rounded-lg border border-brand-300 focus:outline-none"
                      />
                    ) : (
                      <span>{formatCurrency(item.price, currency)}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-right font-bold text-navy-900">
                    {formatCurrency(item.amount, currency)}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {isEditing ? (
                        <button
                          onClick={() => setEditingItemId(null)}
                          className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                          title="Save item"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingItemId(item.id)}
                          className="p-1 text-slate-400 hover:text-navy-900 hover:bg-slate-100 rounded"
                          title="Edit item"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded"
                        title="Delete item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Add Item Row & Financial Summary */}
      <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Button
            variant="outline"
            size="sm"
            icon={Plus}
            onClick={handleAddItem}
            className="w-full sm:w-auto"
          >
            Add Line Item
          </Button>

          {/* Subtotals & Taxes breakdown */}
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal:</span>
              <span className="font-semibold text-navy-900">
                {formatCurrency(extractedData.subtotal, currency)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">

              <span>GST / Taxes:</span>
              <span className="font-semibold text-navy-900">
                {formatCurrency(extractedData.taxAmount, currency)}
              </span>
            </div>
            {extractedData.serviceCharge > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Service Charge / Tip:</span>
                <span className="font-semibold text-navy-900">
                  {formatCurrency(extractedData.serviceCharge, currency)}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-bold text-navy-950">
              <span>Grand Total:</span>
              <span className="text-base text-brand-700">
                {formatCurrency(extractedData.grandTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* CTA to proceed */}
        <div className="mt-6 pt-5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500">
            Check the items above. Click any line to edit before continuing.
          </p>
          <Button
            variant="primary"
            size="md"
            icon={Sparkles}
            iconPosition="right"
            onClick={onProceedToSplit}
            className="w-full sm:w-auto shadow-md shadow-brand-500/20"
          >
            Continue to Smart Splitting
          </Button>
        </div>
      </div>

      {/* High Resolution Receipt Inspection Modal */}
      <ReceiptPreviewModal
        isOpen={previewModalOpen}
        onClose={() => setPreviewModalOpen(false)}
        imageSrc={extractedData.image}
        title={`Original Scanned Receipt • ${extractedData.merchant}`}
      />
    </div>
  );
}

