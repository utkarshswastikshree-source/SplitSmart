import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import {
  Sparkles,
  ScanLine,
  Split,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Users,
  Receipt,
  MessageSquare,
  Lock,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-navy-900 selection:bg-brand-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-32 overflow-hidden bg-gradient-to-b from-white via-slate-50/50 to-slate-50">
        {/* Subtle accent glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200/80 text-brand-700 text-xs font-bold tracking-wide uppercase shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-brand-600 animate-pulse" />
              <span>AI-Powered Group Expense Settlement</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-navy-950 leading-[1.1]">
              Scan. Split. Settle.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
                Zero Friction.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-normal max-w-2xl mx-auto">
              Snap a picture of any crumpled restaurant bill. Split items with natural language prompts like{' '}
              <span className="font-semibold text-navy-800 italic">
                "Rahul and Aman share pizza, everyone shares drinks"
              </span>
              , and settle instantly with PayPal.
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/dashboard" className="w-full sm:w-auto">
                <Button
                  variant="primary"
                  size="lg"
                  icon={ArrowRight}
                  iconPosition="right"
                  className="w-full sm:w-auto shadow-lg shadow-brand-500/25 px-8"
                >
                  Start Splitting Now
                </Button>
              </Link>
              <Link to="/scan" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  icon={ScanLine}
                  className="w-full sm:w-auto"
                >
                  Try AI Receipt Scanner
                </Button>
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                No manual receipt math
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                PayPal 1-click settlement
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Min-cash-flow algorithm
              </span>
            </div>
          </div>

          {/* Interactive Hero Showcase Preview Card */}
          <div className="mt-14 max-w-4xl mx-auto">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-elevated overflow-hidden">
              {/* Fake app bar */}
              <div className="bg-slate-100/80 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-navy-800 ml-2">
                    Goa Trip 2024 • Fisherman's Wharf Dinner (₹6,840)
                  </span>
                </div>
                <Badge variant="brand" size="sm">
                  Gemini Vision OCR Active
                </Badge>
              </div>

              {/* Showcase Split Grid */}
              <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Col 1: Receipt preview */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-navy-900">
                        1. Scanned Receipt
                      </span>
                      <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                        Parsed 7 items
                      </span>
                    </div>
                    <ul className="text-xs space-y-2 text-slate-600">
                      <li className="flex justify-between">
                        <span>Butter Garlic Prawns (2x)</span>
                        <span className="font-semibold text-navy-900">₹1,300</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Goan Fish Curry & Rice</span>
                        <span className="font-semibold text-navy-900">₹960</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Tandoori Pomfret Fry</span>
                        <span className="font-semibold text-navy-900">₹850</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Kingfisher Beer Pitcher (2x)</span>
                        <span className="font-semibold text-navy-900">₹1,100</span>
                      </li>
                    </ul>
                  </div>
                  <div className="pt-3 border-t border-slate-200 mt-4 flex justify-between font-bold text-xs text-navy-950">
                    <span>Grand Total:</span>
                    <span className="text-brand-600">₹6,840</span>
                  </div>
                </div>

                {/* Col 2: AI Prompt parsing */}
                <div className="bg-brand-950 text-white p-4 rounded-2xl flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Sparkles className="w-3.5 h-3.5 text-brand-400" />
                      <span className="text-xs font-bold text-brand-200 uppercase tracking-wide">
                        2. Natural Language Prompt
                      </span>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-xs text-brand-100 font-medium italic border border-white/10 mb-3">
                      "Rahul and Aman share seafood & naan. Kumar gets the pomfret. Everyone shares beers."
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed">
                      AI parsed 4 members and distributed tax/tip proportionally in 0.4s.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-xs">
                    <span className="text-emerald-400 font-semibold">✓ 100% matched</span>
                    <span className="text-slate-400 text-[10px]">No manual math</span>
                  </div>
                </div>

                {/* Col 3: PayPal 1-Click Settlement */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-bold text-navy-900">
                        3. PayPal Settlement
                      </span>
                      <span className="text-[10px] text-[#003087] font-bold bg-[#FFC439]/30 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-navy-900">Kumar owes Rahul</span>
                        <span className="font-bold text-brand-600">₹1,850</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200">
                        <span className="font-semibold text-navy-900">Aman owes Rahul</span>
                        <span className="font-bold text-brand-600">₹1,200</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="w-full py-2 px-3 rounded-xl bg-[#FFC439] text-[#003087] font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm">
                      <span className="italic font-black">Pay<span className="text-[#0079C1]">Pal</span></span>
                      <span>1-Click Settle</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section id="features" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              Engineered for Modern Groups
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-950 tracking-tight">
              Everything you need to split and settle without the awkwardness
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <ScanLine className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">
                AI Receipt Scanner
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                Powered by Gemini Vision OCR. Drop any restaurant receipt, grocery bill, or handwritten order slip. Automatically extracts items, quantities, taxes, and service charges.
              </p>
              <ul className="text-xs space-y-2 text-slate-500 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Full line-item editing & validation
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Handles GST, VAT, and custom service fees
                </li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-sm">
                <Split className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">
                Smart Bill Splitting
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                No tedious item-by-item checkboxes required. Use natural language commands to describe who ate what, or toggle equal/custom splits with one click.
              </p>
              <ul className="text-xs space-y-2 text-slate-500 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Natural language prompt recognition
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Proportionate tax and tip allocation
                </li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:shadow-card-hover transition-all">
              <div className="w-12 h-12 rounded-2xl bg-[#0070BA] text-white flex items-center justify-center mb-6 shadow-sm">
                <CreditCard className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-navy-900 mb-2">
                PayPal 1-Click Settlement
              </h4>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                No need to copy bank account numbers or ask for UPI IDs. Settle debts directly through verified PayPal integration with zero transfer friction.
              </p>
              <ul className="text-xs space-y-2 text-slate-500 font-medium">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Min-cash-flow algorithm simplifies debts
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Real-time transaction receipts & verification
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-slate-50 border-t border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-2">
              Simple 3-Step Flow
            </h2>
            <h3 className="text-3xl font-extrabold text-navy-950 tracking-tight">
              From crumpled receipt to settled accounts in 60 seconds
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-black text-brand-100 absolute top-4 right-4">
                01
              </span>
              <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-600 font-bold flex items-center justify-center mb-4">
                <ScanLine className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-900 mb-2">
                Scan Receipt
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Take a quick photo or drag in an invoice. Gemini Vision parses every single dish, price, and tax automatically.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-black text-brand-100 absolute top-4 right-4">
                02
              </span>
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 font-bold flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-900 mb-2">
                Type or Tap Split
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Say who ordered what in plain English or tap member avatars. Individual shares calculate live on screen.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative">
              <span className="text-4xl font-black text-brand-100 absolute top-4 right-4">
                03
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 font-bold flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-navy-900 mb-2">
                1-Click Settle
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our algorithm minimizes transactions. Tap "Settle via PayPal" to clear balances instantly with zero drama.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-navy-950 via-brand-950 to-indigo-950 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to split your next group trip?
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto">
            Experience the Goa Trip 2024 demo workspace loaded with Rahul, Aman, Kumar, and Priya.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/dashboard">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                className="bg-brand-500 hover:bg-brand-600 shadow-xl"
              >
                Launch Live App
              </Button>
            </Link>
            <Link to="/login">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

