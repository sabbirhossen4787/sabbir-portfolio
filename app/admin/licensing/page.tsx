'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  DollarSign,
  Key,
  Monitor,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Activity,
  Lock,
  Search,
  Plus,
  ChevronDown,
  ChevronRight,
  Copy,
  ShoppingCart,
  RotateCcw,
  Sliders,
  Calendar,
  X,
  CreditCard,
  Smartphone,
  Building2,
  ExternalLink,
  Mail,
  Check,
  MessageSquare,
  Clock,
  XCircle,
  Eye,
  Save,
  Send
} from 'lucide-react';

interface DeviceRecord {
  id: string;
  hwid: string;
  machineName: string;
  os: string;
  appVersion: string;
  active: boolean;
  activatedAt: string;
  lastSeenAt: string;
}

interface LicenseRecord {
  id: string;
  license_key: string;
  status: string;
  tier: string;
  max_devices: number;
  expires_at: string | null;
  created_at: string;
  customer_email: string;
  customer_name: string;
  plan_name: string;
  active_seats: number;
  devices: DeviceRecord[];
}

interface OrderRecord {
  id: string;
  amountUsd: number;
  currency: string;
  status: string;
  customerEmail: string;
  customerName: string;
  planName: string;
  createdAt: string;
}

interface AuditLog {
  id: string;
  license_key: string;
  action: string;
  result: string;
  hwid: string;
  ip: string;
  details: string;
  created_at: string;
}

interface PlanOption {
  id: string;
  name: string;
  slug: string;
  price_cents: number;
  max_devices: number;
}

interface PaymentSubmission {
  id: string;
  status: string;
  amountUsd: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  planName: string;
  planSlug: string;
  maxDevices: number;
  paymentMethod: string;
  senderNumber: string;
  transactionId: string;
  amountPaid: string;
  screenshotUrl?: string;
  customerNote?: string;
  adminNote?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  licenseKey?: string;
  emailStatus: string;
  emailSentAt?: string;
  emailError?: string;
  emailMessageId?: string;
  createdAt: string;
  updatedAt?: string;
}

interface PaymentSettings {
  bkashNumber: string;
  bkashAccountType: string;
  bkashInstructions: string;
  bkashEnabled: boolean;
  bankName: string;
  bankAccountHolder: string;
  bankAccountNumber: string;
  bankBranch: string;
  bankRoutingNumber: string;
  bankInstructions: string;
  bankEnabled: boolean;
  usdToBdtRate: number;
}

export default function SuperAdminLicensingDashboard() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    totalRevenueUsd: number;
    totalLicenses: number;
    activeLicenses: number;
    activeWorkstations: number;
  } | null>(null);

  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [plans, setPlans] = useState<PlanOption[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [adminKey, setAdminKey] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'licenses' | 'orders' | 'audit' | 'payments'>('payments');
  const [expandedLicId, setExpandedLicId] = useState<string | null>(null);

  // Manual Payment verification state
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([]);
  const [submissionCounts, setSubmissionCounts] = useState<{
    submitted_count: number;
    completed_count: number;
    rejected_count: number;
    total_count: number;
  }>({ submitted_count: 0, completed_count: 0, rejected_count: 0, total_count: 0 });
  const [paymentFilter, setPaymentFilter] = useState<'submitted' | 'all' | 'completed' | 'rejected'>('submitted');
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    orderId: string;
    action: 'reject' | 'request_screenshot';
    note: string;
  }>({ open: false, orderId: '', action: 'reject', note: '' });

  // Payment settings state
  const [paymentSettings, setPaymentSettings] = useState<PaymentSettings>({
    bkashNumber: '01794232652',
    bkashAccountType: 'Personal',
    bkashInstructions: 'Send Money to our bKash Personal number. Enter your name or order reference in the counter/reference.',
    bkashEnabled: true,
    bankName: 'Islami Bank Bangladesh Ltd',
    bankAccountHolder: 'Sabbir Hossen',
    bankAccountNumber: '2050123456789',
    bankBranch: 'Dhanmondi Branch, Dhaka',
    bankRoutingNumber: '125272642',
    bankInstructions: 'Transfer via online banking (BEFTN/NPSB/RTGS) or cash deposit. Upload deposit slip or app screenshot.',
    bankEnabled: true,
    usdToBdtRate: 125.0
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);

  // Email diagnostics state
  const [emailDiag, setEmailDiag] = useState<{
    resendConfigured: boolean;
    resendKeyMasked: string | null;
    fromEmail: string;
    adminEmail: string;
    activeProvider: string;
    verifiedDomain: string;
  } | null>(null);
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [testEmailResult, setTestEmailResult] = useState<{ success: boolean; message: string } | null>(null);

  // Generator modal state
  const [showGenModal, setShowGenModal] = useState(false);
  const [genEmail, setGenEmail] = useState('');
  const [genName, setGenName] = useState('');
  const [genPlan, setGenPlan] = useState('plan_studio');
  const [genMaxDevices, setGenMaxDevices] = useState(2);
  const [genTier, setGenTier] = useState('studio_lifetime');
  const [genExpiryOption, setGenExpiryOption] = useState<'perpetual' | '1year' | '30days'>('perpetual');
  const [genSubmitting, setGenSubmitting] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAdminData = async (keyToUse = adminKey) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) {
        headers['x-admin-key'] = keyToUse;
      }

      const res = await fetch('/api/admin/licensing/overview', { headers });
      const data = await res.json();

      if (res.ok) {
        setStats(data.stats);
        setLicenses(data.licenses || []);
        setOrders(data.orders || []);
        setPlans(data.plans || []);
        setAuditLogs(data.auditLogs || []);
      } else if (res.status === 401) {
        const entered = prompt('Please enter the Admin Secret Key (x-admin-key):');
        if (entered) {
          setAdminKey(entered.trim());
          fetchAdminData(entered.trim());
          fetchPaymentSubmissions(paymentFilter, entered.trim());
        } else {
          setErrorMessage('Admin authentication required.');
        }
      } else {
        setErrorMessage(data.error || 'Failed to load telemetry');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentSubmissions = async (filter = paymentFilter, keyToUse = adminKey) => {
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) headers['x-admin-key'] = keyToUse;

      const res = await fetch(`/api/admin/payment/submissions?filter=${filter}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions || []);
        if (data.counts) {
          setSubmissionCounts(data.counts);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch payment submissions', err);
    }
  };

  const fetchPaymentSettings = async () => {
    try {
      const res = await fetch('/api/payment/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setPaymentSettings(data.settings);
        }
      }
    } catch (err) {
      console.warn('Failed to load payment settings', err);
    }
  };

  const fetchEmailDiagnostics = async (keyToUse = adminKey) => {
    try {
      const headers: Record<string, string> = {};
      if (keyToUse) headers['x-admin-key'] = keyToUse;

      const res = await fetch('/api/admin/email/diagnostics', { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.diagnostics) {
          setEmailDiag(data.diagnostics);
        }
      }
    } catch (err) {
      console.warn('Failed to load email diagnostics', err);
    }
  };

  const handleSendTestEmail = async () => {
    setSendingTestEmail(true);
    setTestEmailResult(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/email/diagnostics', {
        method: 'POST',
        headers,
        body: JSON.stringify({})
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch test email');

      setTestEmailResult({
        success: data.success,
        message: data.message || `Test email dispatched (ID: ${data.messageId || 'accepted'})`
      });
      fetchEmailDiagnostics();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setTestEmailResult({ success: false, message: msg });
    } finally {
      setSendingTestEmail(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
    fetchPaymentSubmissions();
    fetchPaymentSettings();
    fetchEmailDiagnostics();
  }, []);

  const handleReviewAction = async (orderId: string, action: 'approve' | 'reject' | 'request_screenshot', note?: string) => {
    setActionInProgress(orderId);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/payment/review', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          action,
          adminNote: note || ''
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to process payment review');

      alert(data.message || `Action [${action}] completed successfully.`);
      fetchPaymentSubmissions(paymentFilter);
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setActionInProgress(null);
      setReviewModal({ open: false, orderId: '', action: 'reject', note: '' });
    }
  };

  const handleRetryEmail = async (orderId: string) => {
    setActionInProgress(orderId);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/payment/retry-email', {
        method: 'POST',
        headers,
        body: JSON.stringify({ orderId })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      alert(`Email Status: ${data.emailStatus}. ${data.message}`);
      fetchPaymentSubmissions(paymentFilter);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setActionInProgress(null);
    }
  };

  const handleSavePaymentSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(null);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/payment/settings', {
        method: 'POST',
        headers,
        body: JSON.stringify(paymentSettings)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings');

      setSettingsSuccess('Payment settings updated and published successfully!');
      setTimeout(() => setSettingsSuccess(null), 4000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleGenerateLicense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!genEmail || !genEmail.includes('@')) {
      alert('Please enter a valid customer email.');
      return;
    }

    setGenSubmitting(true);
    let expiresAt: string | null = null;
    if (genExpiryOption === '1year') {
      const d = new Date();
      d.setFullYear(d.getFullYear() + 1);
      expiresAt = d.toISOString();
    } else if (genExpiryOption === '30days') {
      const d = new Date();
      d.setDate(d.getDate() + 30);
      expiresAt = d.toISOString();
    }

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/licensing/generate-license', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerEmail: genEmail,
          customerName: genName || 'Valued Creator',
          planId: genPlan,
          tier: genTier,
          maxDevices: genMaxDevices,
          expiresAt
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate license');

      setGeneratedResult(data.licenseKey);
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    } finally {
      setGenSubmitting(false);
    }
  };

  const handleRevoke = async (key: string) => {
    const reason = prompt(`Enter revocation reason for license ${key}:`, 'Administrative revocation / refund');
    if (!reason) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/licensing/revoke-license', {
        method: 'POST',
        headers,
        body: JSON.stringify({ licenseKey: key, reason })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke license');

      alert(`License ${key} has been permanently revoked.`);
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const handleResetSeats = async (key: string, hwid?: string) => {
    const promptMsg = hwid
      ? `Release workstation seat ${hwid.substring(0, 12)}...?`
      : `Reset ALL active workstation seats for license ${key}? Customer can reactivate new machines immediately.`;

    if (!confirm(promptMsg)) return;

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (adminKey) headers['x-admin-key'] = adminKey;

      const res = await fetch('/api/admin/licensing/reset-activations', {
        method: 'POST',
        headers,
        body: JSON.stringify({ licenseKey: key, hwid, resetAll: !hwid })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset seats');

      alert(data.message || 'Workstation seats released successfully.');
      fetchAdminData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg);
    }
  };

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredLicenses = licenses.filter(l =>
    l.license_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (l.customer_email && l.customer_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (l.customer_name && l.customer_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 sm:p-10 space-y-8 max-w-7xl mx-auto font-sans selection:bg-[#FF6B00] selection:text-black">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-xl bg-[#FF6B00] flex items-center justify-center text-black font-extrabold text-sm shadow-lg shadow-[#FF6B00]/30">
              ⚡
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SaaS Motion Pro — Super Admin Control
            </h1>
          </div>
          <p className="text-xs text-neutral-400">
            Manual payment verification, bKash & Bank instructions, Ed25519 licensing registry, and seat management.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setGeneratedResult(null);
              setShowGenModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FF6B00] to-amber-500 hover:from-amber-500 hover:to-[#FF6B00] text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6B00]/30 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Issue License Key
          </button>

          <button
            onClick={() => {
              fetchAdminData();
              fetchPaymentSubmissions();
            }}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Pending Review
            </div>
            <div className="text-2xl font-black text-amber-400">{submissionCounts.submitted_count}</div>
            <div className="text-[11px] text-neutral-500 font-mono">Needs Manual Approval</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Revenue
            </div>
            <div className="text-2xl font-black text-white">${stats.totalRevenueUsd.toFixed(2)}</div>
            <div className="text-[11px] text-neutral-500 font-mono">{stats.totalOrders} Completed Orders</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-purple-400" /> Issued Keys
            </div>
            <div className="text-2xl font-black text-white">{stats.totalLicenses}</div>
            <div className="text-[11px] text-neutral-500 font-mono">Registry Records</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-400" /> Workstations
            </div>
            <div className="text-2xl font-black text-white">{stats.activeWorkstations}</div>
            <div className="text-[11px] text-neutral-500 font-mono">Active Bound HWIDs</div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0e1017] border border-white/5 space-y-2">
            <div className="text-xs text-neutral-400 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#FF6B00]" /> Algorithm
            </div>
            <div className="text-2xl font-black text-[#FF6B00] font-mono">Ed25519</div>
            <div className="text-[11px] text-neutral-500 font-mono">Asymmetric Tokens</div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => {
            setActiveTab('payments');
            fetchPaymentSubmissions();
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'payments'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <CreditCard className="w-3.5 h-3.5" /> Manual Payments &amp; Settings
          {submissionCounts.submitted_count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-black">
              {submissionCounts.submitted_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('licenses')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'licenses'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Key className="w-3.5 h-3.5" /> License &amp; Device Registry ({licenses.length})
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" /> Customer Orders ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'audit'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Activity className="w-3.5 h-3.5" /> Security Audit Log ({auditLogs.length})
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: MANUAL PAYMENTS & INSTRUCTION SETTINGS
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'payments' && (
        <div className="space-y-8">
          {/* Section 1: Submissions Queue */}
          <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#FF6B00]" /> Manual Payment Submissions
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verify customer bKash/Bank proofs. 1-click approval registers an Ed25519 license and emails the customer.
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => {
                    setPaymentFilter('submitted');
                    fetchPaymentSubmissions('submitted');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    paymentFilter === 'submitted'
                      ? 'bg-amber-500 text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3 h-3" /> Needs Review ({submissionCounts.submitted_count})
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter('all');
                    fetchPaymentSubmissions('all');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    paymentFilter === 'all'
                      ? 'bg-white text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  All ({submissionCounts.total_count})
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter('completed');
                    fetchPaymentSubmissions('completed');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    paymentFilter === 'completed'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" /> Approved ({submissionCounts.completed_count})
                </button>
                <button
                  onClick={() => {
                    setPaymentFilter('rejected');
                    fetchPaymentSubmissions('rejected');
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                    paymentFilter === 'rejected'
                      ? 'bg-red-500 text-black'
                      : 'bg-white/5 text-neutral-400 hover:text-white'
                  }`}
                >
                  <XCircle className="w-3 h-3" /> Rejected ({submissionCounts.rejected_count})
                </button>
              </div>
            </div>

            {/* Submissions Cards / Rows */}
            <div className="space-y-3">
              {submissions.length === 0 ? (
                <div className="py-12 text-center text-neutral-500 text-xs">
                  No submissions found under current filter.
                </div>
              ) : (
                submissions.map((sub) => {
                  const isPendingReview = sub.status === 'payment_submitted' || sub.status === 'pending' || sub.status === 'needs_screenshot';
                  const isActioning = actionInProgress === sub.id;

                  return (
                    <div
                      key={sub.id}
                      className="rounded-2xl bg-black/40 border border-white/5 p-5 space-y-4 hover:border-white/10 transition"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order & Customer info */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-300 font-bold text-sm">#{sub.id}</span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                sub.status === 'completed'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                                  : sub.status === 'payment_submitted'
                                  ? 'bg-amber-950 text-amber-400 border-amber-800/40 font-bold'
                                  : sub.status === 'needs_screenshot'
                                  ? 'bg-orange-950 text-orange-400 border-orange-800/40'
                                  : 'bg-red-950 text-red-400 border-red-800/40'
                              }`}
                            >
                              {sub.status.toUpperCase()}
                            </span>

                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                sub.paymentMethod === 'bkash'
                                  ? 'bg-pink-950 text-pink-300 border-pink-800/40'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-800/40'
                              }`}
                            >
                              {sub.paymentMethod === 'bkash' ? 'bKash Manual' : 'Bank Transfer'}
                            </span>
                          </div>

                          <div className="text-xs text-white font-medium flex items-center gap-2">
                            <span>{sub.customerName}</span>
                            <span className="text-neutral-400">({sub.customerEmail})</span>
                            <span className="text-neutral-500">&bull;</span>
                            <span className="text-purple-300 font-mono">{sub.planName} (${sub.amountUsd} USD)</span>
                          </div>
                        </div>

                        {/* Payment Verification Data */}
                        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                          <div className="bg-white/5 px-3 py-1.5 rounded-xl">
                            <div className="text-[10px] text-neutral-400 uppercase">Sender / Acc</div>
                            <div className="text-white font-bold">{sub.senderNumber}</div>
                          </div>

                          <div className="bg-white/5 px-3 py-1.5 rounded-xl">
                            <div className="text-[10px] text-neutral-400 uppercase">TrxID / Slip Ref</div>
                            <div className="text-purple-200 font-bold flex items-center gap-1.5">
                              <span>{sub.transactionId}</span>
                              <button
                                onClick={() => copyText(sub.transactionId, `trx-${sub.id}`)}
                                className="text-neutral-400 hover:text-white"
                                title="Copy TrxID"
                              >
                                {copiedKey === `trx-${sub.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              </button>
                            </div>
                          </div>

                          <div className="bg-white/5 px-3 py-1.5 rounded-xl">
                            <div className="text-[10px] text-neutral-400 uppercase">Amount Paid</div>
                            <div className="text-emerald-400 font-bold">{sub.amountPaid}</div>
                          </div>

                          {/* Screenshot thumbnail */}
                          {sub.screenshotUrl ? (
                            <button
                              onClick={() => setSelectedScreenshot(sub.screenshotUrl!)}
                              className="group relative w-12 h-12 rounded-xl overflow-hidden border border-white/20 hover:border-[#FF6B00] transition shrink-0"
                              title="Click to view full receipt"
                            >
                              <img
                                src={sub.screenshotUrl}
                                alt="Payment receipt"
                                className="w-full h-full object-cover group-hover:scale-110 transition"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                <Eye className="w-3.5 h-3.5 text-white" />
                              </div>
                            </button>
                          ) : (
                            <div className="text-[10px] text-neutral-500 italic">No image</div>
                          )}
                        </div>
                      </div>

                      {/* Customer Note / Admin Note */}
                      {(sub.customerNote || sub.adminNote) && (
                        <div className="text-xs bg-white/[0.02] p-3 rounded-xl border border-white/5 space-y-1">
                          {sub.customerNote && (
                            <div className="text-neutral-300">
                              <span className="text-neutral-500">Customer Note:</span> {sub.customerNote}
                            </div>
                          )}
                          {sub.adminNote && (
                            <div className="text-amber-300">
                              <span className="text-amber-500">Review Note:</span> {sub.adminNote}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Issued License Key if completed */}
                      {sub.status === 'completed' && sub.licenseKey && (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-800/30 p-3 rounded-xl text-xs">
                          <div className="flex items-center gap-2 font-mono">
                            <Key className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300 font-bold select-all">{sub.licenseKey}</span>
                            <button
                              onClick={() => copyText(sub.licenseKey!, `lic-${sub.id}`)}
                              className="text-neutral-400 hover:text-white ml-1"
                              title="Copy License Key"
                            >
                              {copiedKey === `lic-${sub.id}` ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            </button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`text-[11px] px-2 py-0.5 rounded-md font-mono flex items-center gap-1 border ${
                                sub.emailStatus === 'delivered'
                                  ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50'
                                  : sub.emailStatus === 'sent'
                                  ? 'bg-blue-950/80 text-blue-300 border-blue-700/50'
                                  : sub.emailStatus === 'failed'
                                  ? 'bg-rose-950/80 text-rose-300 border-rose-700/50'
                                  : 'bg-amber-950/80 text-amber-300 border-amber-700/50'
                              }`}
                              title={sub.emailError || (sub.emailMessageId ? `Resend Message ID: ${sub.emailMessageId}` : undefined)}
                            >
                              <Mail className="w-3 h-3" />
                              Email: <strong>{sub.emailStatus === 'sent' ? 'Accepted / Sent' : sub.emailStatus}</strong>
                              {sub.emailMessageId && (
                                <span className="text-[10px] opacity-75">({sub.emailMessageId.substring(0, 8)}...)</span>
                              )}
                            </span>
                            <button
                              onClick={() => handleRetryEmail(sub.id)}
                              disabled={isActioning}
                              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold transition disabled:opacity-50 flex items-center gap-1"
                              title="Re-send commercial license email via Resend"
                            >
                              <Send className="w-3 h-3" /> Retry Email
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons for Pending Submissions */}
                      {isPendingReview && (
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                          <button
                            onClick={() => handleReviewAction(sub.id, 'approve')}
                            disabled={isActioning}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {isActioning ? 'Approving...' : 'Approve & Issue License'}
                          </button>

                          <button
                            onClick={() => setReviewModal({ open: true, orderId: sub.id, action: 'request_screenshot', note: '' })}
                            disabled={isActioning}
                            className="px-3.5 py-2 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 text-xs font-semibold transition disabled:opacity-50"
                          >
                            Request Proof
                          </button>

                          <button
                            onClick={() => setReviewModal({ open: true, orderId: sub.id, action: 'reject', note: '' })}
                            disabled={isActioning}
                            className="px-3.5 py-2 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold transition disabled:opacity-50"
                          >
                            Reject
                          </button>

                          <span className="text-[11px] text-neutral-500 font-mono ml-auto">
                            Submitted: {new Date(sub.createdAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Section: Email Delivery & Resend Pipeline */}
          <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-purple-400" /> Production Resend Email Integration &amp; License Delivery
                </h2>
                <p className="text-xs text-neutral-400 mt-0.5">
                  Verified DKIM &amp; SPF domain routing on <code className="text-purple-300">sabbirhossen.site</code>. Automated license keys are dispatched upon payment approval.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSendTestEmail}
                disabled={sendingTestEmail}
                className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 text-xs font-semibold flex items-center gap-2 transition disabled:opacity-50 shrink-0"
              >
                <Send className={`w-3.5 h-3.5 ${sendingTestEmail ? 'animate-spin' : ''}`} />
                {sendingTestEmail ? 'Sending Test...' : 'Send Test Email to Admin'}
              </button>
            </div>

            {testEmailResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-center gap-2 border ${
                  testEmailResult.success
                    ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-300'
                    : 'bg-rose-950/60 border-rose-800/60 text-rose-300'
                }`}
              >
                {testEmailResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
                <span>{testEmailResult.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[11px] text-neutral-500 uppercase">Provider Status</div>
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      emailDiag?.resendConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <strong className={emailDiag?.resendConfigured ? 'text-emerald-300' : 'text-amber-300'}>
                    {emailDiag?.resendConfigured ? 'Resend API Connected' : 'Unconfigured'}
                  </strong>
                </div>
                {emailDiag?.resendKeyMasked && (
                  <div className="text-[10px] text-neutral-400">Key: {emailDiag.resendKeyMasked}</div>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[11px] text-neutral-500 uppercase">Verified Domain</div>
                <div className="text-white font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>sabbirhossen.site</span>
                </div>
                <div className="text-[10px] text-emerald-400/80">DKIM &amp; DNS Verified</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[11px] text-neutral-500 uppercase">Sender Address</div>
                <div className="text-purple-200 font-bold truncate select-all" title={emailDiag?.fromEmail || 'licenses@sabbirhossen.site'}>
                  {emailDiag?.fromEmail || 'licenses@sabbirhossen.site'}
                </div>
                <div className="text-[10px] text-neutral-500">From Name: SaaS Motion Pro</div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                <div className="text-[11px] text-neutral-500 uppercase">Admin Alerts Recipient</div>
                <div className="text-purple-200 font-bold truncate select-all" title={emailDiag?.adminEmail || 'myselfsabbirhossen@gmail.com'}>
                  {emailDiag?.adminEmail || 'myselfsabbirhossen@gmail.com'}
                </div>
                <div className="text-[10px] text-neutral-500">New Payment Reviews</div>
              </div>
            </div>
          </div>

          {/* Section 2: Payment Settings & Instructions Editor */}
          <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 sm:p-8 space-y-6">
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#FF6B00]" /> Payment Gateway &amp; Instruction Settings
              </h2>
              <p className="text-xs text-neutral-400 mt-0.5">
                Update public checkout payment numbers, bank details, and the USD to BDT conversion rate.
              </p>
            </div>

            {settingsSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSavePaymentSettings} className="space-y-6 text-xs">
              {/* bKash Settings */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Smartphone className="w-4 h-4 text-pink-400" /> bKash Configuration
                  </div>
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bkashEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashEnabled: e.target.checked })}
                      className="rounded accent-pink-500"
                    />
                    <span>Enable bKash Option</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">bKash Account Number</label>
                    <input
                      type="text"
                      value={paymentSettings.bkashNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">bKash Account Type</label>
                    <select
                      value={paymentSettings.bkashAccountType}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashAccountType: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#141721] border border-white/10 text-white outline-none"
                    >
                      <option value="Personal">Personal (Send Money)</option>
                      <option value="Merchant">Merchant (Payment)</option>
                      <option value="Agent">Agent (Cash Out)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">Customer Instructions for bKash</label>
                  <textarea
                    rows={2}
                    value={paymentSettings.bkashInstructions}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bkashInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>
              </div>

              {/* Bank Settings */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-white text-sm">
                    <Building2 className="w-4 h-4 text-emerald-400" /> Bank Transfer Configuration
                  </div>
                  <label className="flex items-center gap-2 text-neutral-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={paymentSettings.bankEnabled}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankEnabled: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>Enable Bank Transfer</span>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Bank Name</label>
                    <input
                      type="text"
                      value={paymentSettings.bankName}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Account Holder Name</label>
                    <input
                      type="text"
                      value={paymentSettings.bankAccountHolder}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountHolder: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Account Number</label>
                    <input
                      type="text"
                      value={paymentSettings.bankAccountNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankAccountNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Branch Name</label>
                    <input
                      type="text"
                      value={paymentSettings.bankBranch}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankBranch: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Routing Number</label>
                    <input
                      type="text"
                      value={paymentSettings.bankRoutingNumber}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, bankRoutingNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">Customer Instructions for Bank</label>
                  <textarea
                    rows={2}
                    value={paymentSettings.bankInstructions}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, bankInstructions: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white outline-none"
                  />
                </div>
              </div>

              {/* Conversion Rate */}
              <div className="p-5 rounded-2xl bg-black/40 border border-white/5 space-y-3">
                <div className="text-white font-bold text-sm">Currency Conversion Rate</div>
                <div className="max-w-xs">
                  <label className="block text-neutral-300 mb-1 font-medium">1 USD in BDT (Taka)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={paymentSettings.usdToBdtRate}
                    onChange={(e) => setPaymentSettings({ ...paymentSettings, usdToBdtRate: parseFloat(e.target.value) || 125 })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-mono outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-[#FF6B00]/30 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {savingSettings ? 'Saving Settings...' : 'Save & Publish Payment Settings'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 1: LICENSES & DEVICE REGISTRY
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'licenses' && (
        <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by license key, customer email, or name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-neutral-500 outline-none"
              />
            </div>
            <div className="text-xs text-neutral-400 font-mono">
              Showing {filteredLicenses.length} of {licenses.length} keys
            </div>
          </div>

          <div className="space-y-3">
            {filteredLicenses.length === 0 ? (
              <div className="py-8 text-center text-neutral-500 text-xs">
                No licenses found matching query.
              </div>
            ) : (
              filteredLicenses.map((lic) => {
                const isExpanded = expandedLicId === lic.id;
                const activeDevices = lic.devices?.filter(d => d.active) || [];

                return (
                  <div key={lic.id} className="rounded-2xl bg-black/40 border border-white/5 overflow-hidden transition">
                    <div
                      onClick={() => setExpandedLicId(isExpanded ? null : lic.id)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <button className="text-neutral-400 hover:text-white mt-0.5 sm:mt-0">
                          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </button>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-purple-300 font-bold select-all text-xs sm:text-sm">
                              {lic.license_key}
                            </span>
                            <span
                              className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                                lic.status === 'active'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                                  : 'bg-red-950 text-red-400 border-red-800/40'
                              }`}
                            >
                              {lic.status.toUpperCase()}
                            </span>
                          </div>
                          <div className="text-xs text-neutral-400 flex items-center gap-3">
                            <span>{lic.customer_name || 'Creator'} ({lic.customer_email || '—'})</span>
                            <span>&bull;</span>
                            <span className="font-mono text-neutral-500">{lic.plan_name || lic.tier}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-xs font-mono">
                        <div className="flex flex-col sm:items-end">
                          <span className={activeDevices.length >= lic.max_devices ? 'text-amber-400 font-bold' : 'text-neutral-300'}>
                            {activeDevices.length} of {lic.max_devices} Workstations
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {lic.expires_at ? `Exp: ${new Date(lic.expires_at).toLocaleDateString()}` : 'Perpetual Lifetime'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => copyText(lic.license_key, `key-${lic.id}`)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300 text-xs"
                            title="Copy License Key"
                          >
                            {copiedKey === `key-${lic.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          {lic.status === 'active' && (
                            <>
                              <button
                                onClick={() => handleResetSeats(lic.license_key)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1"
                                title="Reset all device seats"
                              >
                                <RotateCcw className="w-3 h-3" /> Reset Seats
                              </button>
                              <button
                                onClick={() => handleRevoke(lic.license_key)}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-[11px] font-semibold flex items-center gap-1"
                                title="Revoke License"
                              >
                                <Trash2 className="w-3 h-3" /> Revoke
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="p-4 bg-black/60 border-t border-white/5 space-y-3">
                        <div className="text-xs font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                          <Monitor className="w-3.5 h-3.5 text-blue-400" /> Bound Workstations ({activeDevices.length})
                        </div>

                        {lic.devices && lic.devices.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {lic.devices.map((dev) => (
                              <div
                                key={dev.id}
                                className={`p-3 rounded-xl border text-xs font-mono space-y-1.5 ${
                                  dev.active
                                    ? 'bg-white/[0.03] border-white/10'
                                    : 'bg-white/[0.01] border-white/5 opacity-50'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">{dev.machineName || 'Workstation'}</span>
                                  <span
                                    className={`text-[9px] px-1.5 py-0.5 rounded ${
                                      dev.active ? 'bg-emerald-950 text-emerald-400' : 'bg-neutral-800 text-neutral-400'
                                    }`}
                                  >
                                    {dev.active ? 'ACTIVE' : 'DEACTIVATED'}
                                  </span>
                                </div>
                                <div className="text-[11px] text-neutral-400 truncate">HWID: {dev.hwid}</div>
                                <div className="text-[11px] text-neutral-500 flex justify-between">
                                  <span>OS: {dev.os || 'AE Host'}</span>
                                  <span>v{dev.appVersion || '1.0.0'}</span>
                                </div>
                                {dev.active && (
                                  <button
                                    onClick={() => handleResetSeats(lic.license_key, dev.hwid)}
                                    className="w-full mt-1 py-1 rounded bg-red-950/40 hover:bg-red-900/60 text-red-300 text-[10px] font-bold border border-red-800/40 transition"
                                  >
                                    Deactivate Machine
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-xs text-neutral-500 italic py-2">
                            No workstations currently bound to this license key.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 2: CUSTOMER ORDERS
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'orders' && (
        <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" /> Customer Purchase Orders
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Customer</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500">
                      No order records found.
                    </td>
                  </tr>
                ) : (
                  orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-white/[0.02]">
                      <td className="py-3 px-3 text-purple-300 font-bold select-all">{ord.id}</td>
                      <td className="py-3 px-3 text-white">{ord.customerName} ({ord.customerEmail})</td>
                      <td className="py-3 px-3 text-neutral-400">{ord.planName}</td>
                      <td className="py-3 px-3 font-bold text-emerald-400">${ord.amountUsd.toFixed(2)} {ord.currency}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full border ${
                            ord.status === 'completed'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
                              : 'bg-amber-950 text-amber-400 border-amber-800/40'
                          }`}
                        >
                          {ord.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-neutral-400">{new Date(ord.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB 3: AUDIT SECURITY LOG STREAM
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'audit' && (
        <div className="rounded-3xl bg-[#0e1017] border border-white/5 p-6 space-y-4">
          <h2 className="text-base font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" /> Security Audit Log Stream
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-white/10 text-neutral-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Action</th>
                  <th className="py-2.5 px-3">Result</th>
                  <th className="py-2.5 px-3">License Key</th>
                  <th className="py-2.5 px-3">HWID / IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="py-2.5 px-3 text-neutral-400">{new Date(log.created_at).toLocaleTimeString()}</td>
                    <td className="py-2.5 px-3 font-bold text-purple-300">{log.action}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded ${
                          log.result === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'
                        }`}
                      >
                        {log.result}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300 select-all">{log.license_key || '—'}</td>
                    <td className="py-2.5 px-3 text-neutral-500">
                      {log.hwid ? log.hwid.substring(0, 16) + '...' : log.ip || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: SCREENSHOT LIGHTBOX PREVIEW
          ═══════════════════════════════════════════════════════════════════════ */}
      {selectedScreenshot && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-[#0e1017] border border-white/10 rounded-3xl p-4 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">Payment Proof Preview</span>
              <div className="flex items-center gap-2">
                <a
                  href={selectedScreenshot}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Full Image
                </a>
                <button
                  onClick={() => setSelectedScreenshot(null)}
                  className="text-neutral-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="max-h-[75vh] overflow-auto rounded-2xl bg-black flex items-center justify-center p-2">
              <img
                src={selectedScreenshot}
                alt="Receipt Full Preview"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: REVIEW NOTE PROMPT (REJECT / REQUEST PROOF)
          ═══════════════════════════════════════════════════════════════════════ */}
      {reviewModal.open && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#0e1017] border border-white/10 rounded-3xl p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {reviewModal.action === 'reject' ? (
                <>
                  <XCircle className="w-4 h-4 text-red-400" /> Reject Order #{reviewModal.orderId}
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Request Additional Proof
                </>
              )}
            </h3>

            <p className="text-xs text-neutral-400">
              Provide a note for the customer explaining why the transaction was not approved or what proof is needed:
            </p>

            <textarea
              rows={3}
              value={reviewModal.note}
              onChange={(e) => setReviewModal({ ...reviewModal, note: e.target.value })}
              placeholder={
                reviewModal.action === 'reject'
                  ? 'e.g. Transaction ID was not found in our bKash statement.'
                  : 'e.g. Please provide a clear screenshot of the bKash SMS or app confirmation.'
              }
              className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white text-xs outline-none"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReviewModal({ open: false, orderId: '', action: 'reject', note: '' })}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction(reviewModal.orderId, reviewModal.action, reviewModal.note)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white shadow-lg ${
                  reviewModal.action === 'reject' ? 'bg-red-600 hover:bg-red-500' : 'bg-orange-600 hover:bg-orange-500'
                }`}
              >
                Confirm Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL: MANUAL LICENSE GENERATOR
          ═══════════════════════════════════════════════════════════════════════ */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="rounded-3xl bg-[#0e1017] border border-white/10 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowGenModal(false)}
              className="absolute top-5 right-5 text-neutral-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF6B00] text-black font-extrabold flex items-center justify-center">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Manual License Generator</h3>
                <p className="text-xs text-neutral-400">Generate a custom commercial license key for a customer.</p>
              </div>
            </div>

            {generatedResult ? (
              <div className="space-y-4 bg-black/60 p-5 rounded-2xl border border-emerald-500/30">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                  <CheckCircle2 className="w-4 h-4" /> License Generated Successfully
                </div>

                <div className="flex items-center gap-2 bg-[#080614] p-3 rounded-xl border border-purple-900/50">
                  <code className="text-sm font-mono text-purple-200 select-all font-bold flex-1">
                    {generatedResult}
                  </code>
                  <button
                    onClick={() => copyText(generatedResult, 'gen-result')}
                    className="px-3 py-1.5 rounded-lg bg-[#FF6B00] text-black font-bold text-xs transition"
                  >
                    {copiedKey === 'gen-result' ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="text-xs text-neutral-400 font-mono space-y-1">
                  <div>Customer: {genEmail}</div>
                  <div>Seat Limit: {genMaxDevices} Workstations</div>
                  <div>Tier: {genTier}</div>
                </div>

                <button
                  onClick={() => setGeneratedResult(null)}
                  className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                >
                  Generate Another Key
                </button>
              </div>
            ) : (
              <form onSubmit={handleGenerateLicense} className="space-y-4 text-xs">
                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">Customer Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="customer@studio.com"
                    value={genEmail}
                    onChange={(e) => setGenEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">Customer / Studio Name</label>
                  <input
                    type="text"
                    placeholder="John Doe or Agency LLC"
                    value={genName}
                    onChange={(e) => setGenName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Plan Presets</label>
                    <select
                      value={genPlan}
                      onChange={(e) => {
                        const val = e.target.value;
                        setGenPlan(val);
                        if (val === 'plan_creator') {
                          setGenMaxDevices(1);
                          setGenTier('creator');
                        } else if (val === 'plan_studio') {
                          setGenMaxDevices(2);
                          setGenTier('studio_lifetime');
                        } else if (val === 'plan_lifetime') {
                          setGenMaxDevices(4);
                          setGenTier('enterprise_lifetime');
                        }
                      }}
                      className="w-full px-3 py-2.5 rounded-xl bg-black/40 border border-white/10 text-white outline-none"
                    >
                      <option value="plan_creator">Creator (1 seat)</option>
                      <option value="plan_studio">Studio Commercial (2 seats)</option>
                      <option value="plan_lifetime">Enterprise VIP (4 seats)</option>
                      <option value="plan_custom">Custom Configuration</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-neutral-300 mb-1 font-medium">Workstation Seat Limit</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={genMaxDevices}
                      onChange={(e) => setGenMaxDevices(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-300 mb-1 font-medium">Expiration Model</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setGenExpiryOption('perpetual')}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        genExpiryOption === 'perpetual'
                          ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                          : 'bg-black/40 border-white/10 text-neutral-400'
                      }`}
                    >
                      Perpetual
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenExpiryOption('1year')}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        genExpiryOption === '1year'
                          ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                          : 'bg-black/40 border-white/10 text-neutral-400'
                      }`}
                    >
                      1 Year
                    </button>
                    <button
                      type="button"
                      onClick={() => setGenExpiryOption('30days')}
                      className={`py-2 rounded-xl border text-xs font-semibold ${
                        genExpiryOption === '30days'
                          ? 'bg-[#FF6B00] text-black border-[#FF6B00]'
                          : 'bg-black/40 border-white/10 text-neutral-400'
                      }`}
                    >
                      30 Days
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={genSubmitting}
                  className="w-full py-3 rounded-xl bg-[#FF6B00] hover:bg-amber-500 text-black font-extrabold text-xs shadow-lg shadow-[#FF6B00]/30 transition disabled:opacity-50"
                >
                  {genSubmitting ? 'Generating...' : 'Confirm & Generate SMP License Key'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
