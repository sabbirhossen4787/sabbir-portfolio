'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Mail, MessageSquare, CheckCircle2, ArrowLeft, Send } from 'lucide-react';

export default function SupportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <HelpCircle className="w-8 h-8 text-purple-400" /> Support & Help Center
        </h1>
        <p className="text-sm text-purple-300/70 mt-2">
          Need technical assistance with your After Effects installation or license activation? We are here to help.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="p-6 rounded-2xl bg-[#0f0b24] border border-purple-900/40 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-4">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Direct Email Support</h3>
            <p className="text-xs text-purple-300/70 mb-4">
              Reach our engineering team directly for licensing or technical assistance.
            </p>
          </div>
          <a
            href="mailto:support@saasmotionpro.com"
            className="text-xs font-mono text-purple-300 hover:text-white underline"
          >
            support@saasmotionpro.com
          </a>
        </div>

        <div className="p-6 rounded-2xl bg-[#0f0b24] border border-purple-900/40 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-purple-300 mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-1">Self-Service Seat Manager</h3>
            <p className="text-xs text-purple-300/70 mb-4">
              Instantly deactivate workstations or look up your license key without waiting.
            </p>
          </div>
          <Link
            href="/saas-motion-pro/dashboard"
            className="text-xs font-semibold text-purple-400 hover:text-purple-300 flex items-center gap-1"
          >
            <span>Open Customer Dashboard</span> →
          </Link>
        </div>
      </div>

      {/* Ticket Form */}
      <div className="bg-[#0f0b24] border border-purple-900/40 p-8 rounded-3xl">
        <h2 className="text-xl font-bold text-white mb-2">Submit a Support Request</h2>
        <p className="text-xs text-purple-300/70 mb-6">Our typical response time is under 4 business hours.</p>

        {submitted ? (
          <div className="p-6 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h3 className="font-bold text-white text-base">Request Received</h3>
            <p className="text-xs text-emerald-200 mt-1">Our support team has received your ticket and will reply to {email} shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-1">Your Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="creator@studio.com"
                className="w-full bg-[#080614] border border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-1">After Effects Version & OS</label>
              <input
                type="text"
                placeholder="e.g. AE 2025 (v25.0) on macOS Sonoma M3"
                className="w-full bg-[#080614] border border-purple-900/60 rounded-xl px-4 py-2.5 text-xs text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-purple-300 block mb-1">Message / Issue Details</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                className="w-full bg-[#080614] border border-purple-900/60 rounded-xl p-3 text-xs text-purple-100 placeholder-purple-400/30 focus:outline-none focus:border-purple-500"
              />
            </div>

            <button
              type="submit"
              className="py-3 px-6 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 transition-all"
            >
              <Send className="w-3.5 h-3.5" /> Submit Support Request
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
