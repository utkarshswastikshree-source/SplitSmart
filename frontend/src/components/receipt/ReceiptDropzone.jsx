import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, CheckCircle2, FileText, ArrowRight, X } from 'lucide-react'; import Button from '../common/Button';
import { SAMPLE_RECEIPTS } from '../../services/mockData';
import { cn } from '../../utils/cn';

export default function ReceiptDropzone({ onSelectReceipt, isScanning }) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragOver(true);
    } else if (e.type === 'dragleave') {
      setDragOver(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (file) => {
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedPreview(reader.result);
      onSelectReceipt(file);
    };
    reader.readAsDataURL(file);
  };

  const handleSampleClick = (sample) => {
    setSelectedPreview(sample.image);
    onSelectReceipt(sample.id);
  };

  return (
    <div className="space-y-6">
      {/* Drag & Drop Upload Container */}
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isScanning && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-3xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden',
          dragOver
            ? 'border-brand-500 bg-brand-50/60 scale-[1.01]'
            : 'border-slate-300 hover:border-brand-400 bg-white hover:bg-slate-50/60 shadow-soft',
          isScanning && 'pointer-events-none opacity-90'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />

        {/* Animated Scanner Beam during scanning */}
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="w-full h-1.5 bg-gradient-to-r from-transparent via-brand-500 to-transparent shadow-[0_0_15px_#6366F1] animate-[bounce_2s_infinite]" />
            <div className="absolute inset-0 bg-brand-500/5 backdrop-blur-[1px]" />
          </div>
        )}

        {selectedPreview ? (
          <div className="flex flex-col items-center gap-3 relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }}
              className="absolute -top-3 right-0 p-2 rounded-full bg-rose-100 text-rose-600 hover:bg-rose-200"
              title="Remove receipt"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="relative w-36 h-48 rounded-xl overflow-hidden shadow-lg border border-slate-200">
              <img
                src={selectedPreview}
                alt="Receipt Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-navy-950/20 flex items-center justify-center">
                <span className="bg-white/90 text-navy-900 text-[11px] font-bold px-2 py-1 rounded-md shadow-sm">
                  Loaded
                </span>
              </div>
            </div>
            <p className="text-xs font-semibold text-slate-500">
              Click to replace receipt image
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mb-4 ring-8 ring-brand-50/50">
              <UploadCloud className="w-8 h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-navy-900">
              Upload or drag receipt image
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-sm">
              Supports PNG, JPG, WEBP, or PDF. Gemini Vision AI will automatically detect items, taxes, and totals.
            </p>
            <div className="mt-4">
              <Button variant="outline" size="sm" icon={ImageIcon}>
                Browse File
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Preset 1-Click Sample Receipts */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-brand-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-navy-800">
            Or test instantly with realistic Goa samples:
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_RECEIPTS.map((sample) => (
            <button
              key={sample.id}
              type="button"
              disabled={isScanning}
              onClick={() => handleSampleClick(sample)}
              className="flex items-start gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-brand-500 hover:shadow-card-hover transition-all text-left group disabled:opacity-50"
            >
              <div className="w-12 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 border border-slate-200">
                <img
                  src={sample.image}
                  alt={sample.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-navy-900 truncate group-hover:text-brand-600">
                  {sample.name}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {sample.items.length} items • {sample.category}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brand-600 mt-1">
                  Try Sample <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

