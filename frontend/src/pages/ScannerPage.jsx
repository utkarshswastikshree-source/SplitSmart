import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { scanReceiptWithGemini } from '../services/geminiService';
import ReceiptDropzone from '../components/receipt/ReceiptDropzone';
import ExtractedItemsTable from '../components/receipt/ExtractedItemsTable';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Badge from '../components/common/Badge';
import { Sparkles, ScanLine, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export default function ScannerPage() {
  const { setActiveScan, currentGroup, currency, addToast } = useApp();
  const navigate = useNavigate();

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(null);
  const [extractedReceipt, setExtractedReceipt] = useState(null);
  const [error, setError] = useState(null);

  const handleSelectReceipt = async (fileOrSampleId) => {
    setIsScanning(true);
    setError(null);
    setScanProgress({ step: 1, message: 'Initiating Gemini Vision OCR...', percent: 15 });

    try {
      const result = await scanReceiptWithGemini(fileOrSampleId, (progress) => {
        setScanProgress(progress);
      });

      setExtractedReceipt(result);
      addToast({
        type: 'success',
        title: 'Receipt Extracted',
        message: `Extracted ${result.items.length} line items from ${result.merchant}.`,
      });
    } catch (err) {
      console.error(err);
      setError('Failed to extract receipt. Please try another image.');
      addToast({
        type: 'error',
        title: 'Scan Failed',
        message: 'Could not parse the receipt image.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleProceedToSplit = () => {
    if (!extractedReceipt) return;
    setActiveScan(extractedReceipt);
    navigate('/split');
  };

  const handleReset = () => {
    setExtractedReceipt(null);
    setScanProgress(null);
    setError(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Gemini 1.5 Vision OCR
            </Badge>
            <span className="text-xs text-slate-400">
              Active Group: {currentGroup?.name || 'Goa Trip 2024'}
            </span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-navy-950 mt-1">
            AI Receipt Scanner
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Scan physical bills, itemized invoices, or digital receipts with instant AI vision extraction.
          </p>
        </div>

        {extractedReceipt && (
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-navy-900 self-start"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Scan Another Receipt</span>
          </button>
        )}
      </div>

      {/* Progress State during scanning */}
      {isScanning && scanProgress && (
        <div className="bg-white rounded-3xl p-8 border border-brand-200 shadow-soft text-center space-y-4 animate-in fade-in">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto ring-8 ring-brand-50/60">
            <LoadingSpinner size="lg" className="text-brand-600" />
          </div>

          <div>
            <h3 className="text-base font-bold text-navy-900">
              {scanProgress.message}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Gemini Vision is parsing dishes, prices, quantities, and GST rates...
            </p>
          </div>

          {/* Progress Bar */}
          <div className="max-w-md mx-auto w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${scanProgress.percent || 40}%` }}
            />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Zone (shown when no extracted receipt or during scanning) */}
      {!extractedReceipt && (
        <ReceiptDropzone
          onSelectReceipt={handleSelectReceipt}
          isScanning={isScanning}
        />
      )}

      {/* Extracted Items Table (shown after scan completes) */}
      {extractedReceipt && !isScanning && (
        <div className="space-y-6">
          <ExtractedItemsTable
            extractedData={extractedReceipt}
            onChange={setExtractedReceipt}
            onProceedToSplit={handleProceedToSplit}
            currency={currency}
          />
        </div>
      )}
    </div>
  );
}

