import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { useApp } from '../context/AppContext';

export default function RegisterPage() {
  const [name, setName] = useState('Rahul Sharma');
  const [email, setEmail] = useState('rahul.sharma@splitsmart.io');
  const [password, setPassword] = useState('Secret123!');
  const [loading, setLoading] = useState(false);
  const { addToast } = useApp();
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        title: 'Account Created!',
        message: 'Welcome to SplitSmart! Your Goa trip group is ready.',
      });
      navigate('/dashboard');
    }, 600);
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
          Create your account
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-slate-200/90 shadow-card space-y-6">
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              icon={User}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              required
            />

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
              placeholder="At least 8 characters"
              required
            />

            <div className="text-xs text-slate-500">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
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
              Get Started Free
            </Button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Free forever for peer group expense splitting</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

