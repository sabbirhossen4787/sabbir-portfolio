'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('from') || '/admin';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push(redirectPath);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#090A0D] text-white flex items-center justify-center p-4 selection:bg-[#FF6B00] selection:text-black">
      <div className="w-full max-w-md bg-[#0D0E12] border border-white/10 rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#FF6B00]/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#FF6B00] text-black font-black text-xl flex items-center justify-center mx-auto shadow-lg shadow-[#FF6B00]/30 mb-4">
            ⚡
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Admin Portal</h1>
          <p className="text-xs text-neutral-400 mt-1">Sign in to manage portfolio and CMS</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase font-semibold mb-1.5">
              Email or Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="contact@sabbirhossen.site"
                className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6B00] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono text-neutral-400 uppercase font-semibold mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#121318] border border-white/10 rounded-xl pl-10 pr-11 py-3 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6B00] transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-500 hover:text-neutral-300 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-[#FF6B00]/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/5 pt-4">
          <a href="/" className="text-xs text-neutral-500 hover:text-white transition">
            ← Back to live website
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen w-full bg-[#090A0D] flex items-center justify-center text-neutral-500 text-sm">Loading admin portal...</div>}>
      <AdminLoginForm />
    </React.Suspense>
  );
}