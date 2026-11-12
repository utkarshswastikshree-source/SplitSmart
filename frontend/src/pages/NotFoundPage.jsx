import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { ArrowLeft, Home, Sparkles } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mb-6 ring-8 ring-brand-50/60 shadow-card">
        <Sparkles className="w-8 h-8" />
      </div>
      <h1 className="text-6xl font-black text-navy-950">404</h1>
      <h2 className="text-xl font-bold text-navy-900 mt-2">Page Not Found</h2>
      <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link to="/dashboard">
        <Button variant="primary" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
}

