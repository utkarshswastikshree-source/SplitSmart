import React from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { ZoomIn, Download, ExternalLink } from 'lucide-react';

export default function ReceiptPreviewModal({ isOpen, onClose, imageSrc, title }) {
  if (!imageSrc) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Receipt Image Preview'}
      subtitle="Inspected by Gemini 1.5 Vision OCR"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center max-h-[500px]">
          <img
            src={imageSrc}
            alt={title || 'Receipt Preview'}
            className="w-full h-full object-contain max-h-[480px]"
          />
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>High-resolution OCR bounding boxes extracted</span>
          <div className="flex items-center gap-2">
            <a
              href={imageSrc}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-semibold text-brand-600 hover:text-brand-700"
            >
              <span>Open Original</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </Modal>
  );
}

