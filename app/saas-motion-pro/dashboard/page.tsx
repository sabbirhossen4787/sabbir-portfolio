'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Key,
  ShieldCheck,
  Monitor,
  Trash2,
  Download,
  Search,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface Activation {
  id: string;
  hwid: string;
  machineName: string;
  os: string;
  appVersion: string;
  status: string;
  activatedAt: string;
  lastSeenAt: string;
}

interface LicenseData {
  id: string;
  licenseKey: string;
  planName: string;
  tier: string;
  status: string;
  maxDevices: number;
  customerEmail: string;
  activations: Activation[];
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const initialKey = searchParams.get('key') || '';

  const [searchQuery, setSearchQuery] = useState(initialKey || '');
  const [loading, setLoading] = useState(false);
  const [licenses, setLicenses] = useState<LicenseData[]>([]);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchLicenses = async (query: string) => {
    if (!query) return;
    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/user/licenses?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch license records');
      setLicenses(data.licenses || []);
      if (!data.licenses || data.licenses.length === 0) {
        setMessage({ type: 'error', text: 'No licenses found for this key or email address.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery) {
      fetchLicenses(searchQuery);
    }
  }, []);

  const handleDeactivate = async (licenseKey: string, hwid: string, machineName: string) => {
    if (!confirm(`Are you sure you want to deactivate seat for "${machineName}"? You can reactivate anytime.`)) {
      return;
    }

    try {
      const res = await fetch('/api/v1/license/deactivate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: licenseKey, hwid })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || data.message || 'Deactivation failed');
      }

      setMessage({ type: 'success', text: `Machine "${machineName}" was successfully deactivated. Seat freed!` });
      fetchLicenses(searchQuery);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setMessage({ type: 'error', text: msg });
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-3">
          Customer License & Seat Management
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/70 leading-relaxed">
          Lookup your license key, inspect active workstations, and release seats when switching machines.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-xl mx-auto mb-12">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchLicenses(searchQuery);
          }}
          className="flex items-center gap-2 bg-[#0f0b24] p-2 rounded-2xl border border-purple-800/40 shadow-xl"
        >
          <Search className="w-5 h-5 text-purple-400 ml-3" />
          <input
            type="text"
            placeholder="Enter license key (SMP-XXXX-XXXX-XXXX-XXXX)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-xs sm:text-sm placeholder-purple-400/40 outline-none px-2 font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <span>Lookup</span>}
          </button>
        </form>

        {message && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-800/60 text-emerald-300'
                : 'bg-red-950/60 border border-red-800/60 text-red-300'
            }`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Licenses View */}
      {licenses.length > 0 && (
        <div className="space-y-8">
          {licenses.map((lic) => {
            const activeActivations = lic.activations.filter(a => a.status === 'active');
            const seatCount = activeActivations.length;

            return (
              <div key={lic.id} className="rounded-3xl bg-[#0f0b24] border border-purple-800/40 p-6 sm:p-8 shadow-2xl space-y-6">
                {/* Header Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-purple-900/40 pb-6">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h2 className="text-xl font-bold text-white">{lic.planName}</h2>
                      <span
                        className={`text-[11px] font-mono px-2.5 py-0.5 rounded-full border ${
                          lic.status === 'active'
                            ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                            : 'bg-red-950 text-red-400 border-red-800/40'
                        }`}
                      >
                        {lic.status.toUpperCase()}
                      </span>
                    </div>
                    <div className="text-xs text-purple-400 font-mono">Customer: {lic.customerEmail || 'Registered Creator'}</div>
                  </div>

                  <div className="flex items-center gap-2 bg-[#080614] px-4 py-2 rounded-xl border border-purple-900/40">
                    <Key className="w-4 h-4 text-purple-400" />
                    <code className="text-xs font-mono text-purple-200 select-all font-bold">{lic.licenseKey}</code>
                  </div>
                </div>

                {/* Seat Capacity Bar */}
                <div>
                  <div className="flex justify-between items-center text-xs text-purple-300 mb-2">
                    <span className="font-semibold uppercase tracking-wider">Seat Capacity:</span>
                    <span className="font-mono text-white font-bold">{seatCount} of {lic.maxDevices} Workstations In Use</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#080614] rounded-full overflow-hidden border border-purple-900/40">
                    <div
                      className={`h-full transition-all duration-500 ${
                        seatCount >= lic.maxDevices ? 'bg-amber-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, (seatCount / lic.maxDevices) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Activations List */}
                <div>
                  <h3 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-3">Active Workstations</h3>

                  {activeActivations.length === 0 ? (
                    <div className="text-xs text-purple-400/60 p-4 rounded-xl bg-[#080614] border border-purple-900/30 text-center">
                      No active workstations. Enter your license key in Adobe After Effects to activate your first workstation.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeActivations.map((act) => (
                        <div key={act.id} className="p-4 rounded-2xl bg-[#080614] border border-purple-900/40 flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-300 shrink-0">
                              <Monitor className="w-5 h-5" />
                            </div>
                            <div className="space-y-1">
                              <div className="text-sm font-bold text-white">{act.machineName || 'Workstation'}</div>
                              <div className="text-[11px] text-purple-400/80 font-mono">OS: {act.os || 'Desktop OS'}</div>
                              <div className="text-[10px] text-purple-500 font-mono">HWID: {act.hwid.substring(0, 16)}...</div>
                              <div className="text-[10px] text-emerald-400 font-mono">Last seen: {new Date(act.lastSeenAt).toLocaleDateString()}</div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeactivate(lic.licenseKey, act.hwid, act.machineName)}
                            className="p-2 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/40 transition text-xs font-semibold flex items-center gap-1 shrink-0"
                            title="Release seat for this device"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Deactivate
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Downloads & Guides */}
                <div className="border-t border-purple-900/40 pt-4 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-300 gap-4">
                  <span>Need to install on a new computer?</span>
                  <div className="flex items-center gap-3">
                    <Link
                      href="/saas-motion-pro/download"
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition flex items-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" /> Download ZIP
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-purple-300 text-sm">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
