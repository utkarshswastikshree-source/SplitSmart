import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, UserCheck } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Avatar from '../components/common/Avatar';
import { useApp } from '../context/AppContext';
import { GROUP_MEMBERS } from '../services/mockData';

export default function LoginPage() {
  const [email, setEmail] = useState('rahul.sharma@splitsmart.io');
  const [password, setPassword] = useState('••••••••••••');
  const [loading, setLoading] = useState(false);
  const { setCurrentUser, addToast } = useApp();
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e?.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Welcome Back!',
        message: 'Logged in as Rahul Sharma (Goa Trip Admin).',
      });
      navigate('/dashboard');
    }, 600);
  };

  const handleQuickDemo = (member) => {
    setCurrentUser(member);
    addToast({
      type: 'info',
      title: 'Demo Session Active',
      message: `Switched user to ${member.name}.`,
    });
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans text-navy-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group">
          <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-brand-600 text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-navy-950">
            Split<span className="text-brand-600">Smart</span>
          </span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-navy-950">
          Sign in to your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
            Create an account free
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
          {/* Quick Demo Switcher */}
          <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
              <UserCheck className="w-4 h-4 text-brand-600" />
              <span>Instant 1-Click Demo Login:</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemo(GROUP_MEMBERS[0])}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 text-left text-xs font-semibold text-navy-900 shadow-2xs hover:shadow-xs transition-all"
              >
                <Avatar src={GROUP_MEMBERS[0].avatar} name={GROUP_MEMBERS[0].name} size="xs" />
                <span className="truncate">Rahul (Admin)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo(GROUP_MEMBERS[2])}
                className="flex items-center gap-2 p-2 rounded-xl bg-white border border-brand-200 hover:border-brand-500 text-left text-xs font-semibold text-navy-900 shadow-2xs hover:shadow-xs transition-all"
              >
                <Avatar src={GROUP_MEMBERS[2].avatar} name={GROUP_MEMBERS[2].name} size="xs" />
                <span className="truncate">Kumar (Member)</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@splitsmart.io"
              required
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span>Remember me</span>
              </label>
              <a href="#" className="font-semibold text-brand-600 hover:text-brand-700">
                Forgot password?
              </a>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              icon={ArrowRight}
              iconPosition="right"
              className="w-full shadow-md shadow-brand-500/25"
            >
              Sign In to SplitSmart
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Secured with 256-bit encryption</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

