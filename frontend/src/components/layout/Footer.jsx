import React from 'react';
import { Sparkles, Shield, Heart, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-16 pb-12 border-t border-navy-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-navy-800/80">
          {/* Brand Col */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 text-white shadow-sm">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight text-white">
                Split<span className="text-brand-400">Smart</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              AI-powered group expense settlement platform. Scan paper receipts, split complex bills with plain English, and settle instantly via PayPal.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <Shield className="w-4 h-4" />
              <span>PayPal Verified • Bank-grade Security</span>
            </div>
          </div>

          {/* Product links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/scan" className="hover:text-white transition-colors">
                  AI Receipt Scanner
                </Link>
              </li>
              <li>
                <Link to="/split" className="hover:text-white transition-colors">
                  Smart Bill Splitting
                </Link>
              </li>
              <li>
                <Link to="/settlement" className="hover:text-white transition-colors">
                  PayPal 1-Click Settlement
                </Link>
              </li>
              <li>
                <Link to="/assistant" className="hover:text-white transition-colors">
                  Fintech AI Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Demo */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Demo Workspaces
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/groups/group-goa" className="hover:text-white transition-colors flex items-center gap-1.5">
                  Goa Trip 2024 (Rahul & Friends)
                  <span className="text-[10px] bg-brand-500/20 text-brand-300 px-1.5 py-0.5 rounded">Active</span>
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-white transition-colors">
                  Rahul's Overview Dashboard
                </Link>
              </li>
              <li>
                <Link to="/groups" className="hover:text-white transition-colors">
                  Active Groups Ledger
                </Link>
              </li>
            </ul>
          </div>

          {/* Architecture & Stack */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Modern Tech Stack
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-slate-300">
                React 18 + Vite
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-slate-300">
                Tailwind CSS
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-slate-300">
                Gemini Vision AI
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-slate-300">
                PayPal REST API
              </span>
              <span className="px-2.5 py-1 rounded-md bg-navy-900 border border-navy-700 text-slate-300">
                Supabase Realtime
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-4 leading-normal">
              Designed as a production-ready frontend ready to hook directly into Node.js, Supabase, Gemini and PayPal APIs.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} SplitSmart Inc. Tagline: Scan. Split. Settle. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Security Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

