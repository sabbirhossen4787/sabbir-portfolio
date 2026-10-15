'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Key,
  ArrowRight,
  Lock,
  RefreshCw,
  AlertCircle,
  Upload,
  Check,
  Building2,
  Smartphone,
  Info,
  Clock,
  FileText,
  XCircle,
  ExternalLink
} from 'lucide-react';

const PLANS_DATA: Record<string, { id: string; name: string; bdtPrice: number; devices: number }> = {
  plan_creator: { id: 'plan_creator', name: 'Creator License', bdtPrice: 1999, devices: 1 },
  plan_studio: { id: 'plan_studio', name: 'Studio Commercial', bdtPrice: 3499, devices: 2 },
  plan_lifetime: { id: 'plan_lifetime', name: 'Lifetime Enterprise VIP', bdtPrice: 5999, devices: 4 }
};

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
  creatorPriceBdt?: number;
  studioPriceBdt?: number;
  lifetimePriceBdt?: number;
  supportEmail?: string;
  supportPhone?: string;
}

interface OrderStatusData {
  orderId: string;
  status: 'pending' | 'payment_submitted' | 'completed' | 'rejected' | 'needs_screenshot';
  customerEmail: string;
  customerName: string;
  planName: string;
  amountUsd: number;
  amountPaid?: string;
  paymentMethod: string;
  transactionId: string;
  senderNumber: string;
  screenshotUrl?: string;
  adminNote?: string;
  emailStatus?: string;
  createdAt: string;
  updatedAt?: string;
  licenseKey?: string;
  maxDevices?: number;
  expiresAt?: string | null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialPlan = searchParams.get('plan') || 'plan_studio';
  const queryOrderId = searchParams.get('orderId');

  const [selectedPlanId, setSelectedPlanId] = useState(initialPlan);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'bank'>('bkash');

  // Customer form inputs
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);

  // Settings state
  const [settings, setSettings] = useState<PaymentSettings>({
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

  // Flow and status tracking state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(queryOrderId);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const currentPlan = PLANS_DATA[selectedPlanId] || PLANS_DATA.plan_studio;
  const bdtTotal = selectedPlanId === 'plan_creator'
    ? (settings.creatorPriceBdt || 1999)
    : selectedPlanId === 'plan_studio'
    ? (settings.studioPriceBdt || 3499)
    : (settings.lifetimePriceBdt || 5999);

  // 1. Fetch public payment settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/payment/settings');
        if (res.ok) {
          const data = await res.json();
          const s = data.settings || data;
          if (s) {
            setSettings(prev => ({
              ...prev,
              ...s,
              bankAccountHolder: s.bankAccountHolder || s.bankAccountName || prev.bankAccountHolder
            }));
            if (!s.bkashEnabled && s.bankEnabled) {
              setPaymentMethod('bank');
            }
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic payment settings, using defaults.', err);
      }
    }
    loadSettings();
  }, []);

  // Update amountPaid recommendation when plan changes
  useEffect(() => {
    if (!amountPaid || amountPaid.startsWith('৳') || amountPaid.startsWith('$')) {
      setAmountPaid(`৳${bdtTotal.toLocaleString()} BDT`);
    }
  }, [selectedPlanId, bdtTotal]);

  // 2. Poll order status if activeOrderId is present
  useEffect(() => {
    if (!activeOrderId) return;

    let isMounted = true;
    async function checkStatus() {
      if (!activeOrderId) return;
      try {
        const res = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(activeOrderId)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setOrderStatus(data);
          }
        }
      } catch (e) {
        console.warn('Status poll error', e);
      }
    }

    checkStatus();

    // Auto-poll every 12 seconds until completed or rejected
    const interval = setInterval(() => {
      if (orderStatus?.status === 'completed' || orderStatus?.status === 'rejected') {
        clearInterval(interval);
        return;
      }
      checkStatus();
    }, 12000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [activeOrderId, orderStatus?.status]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('Screenshot file exceeds 5 MB. Please select a smaller image.');
      return;
    }

    setScreenshotFile(file);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!customerEmail || !customerEmail.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (!senderNumber) {
      setErrorMessage(
        paymentMethod === 'bkash'
          ? 'Please provide your bKash mobile number.'
          : 'Please provide the depositor bank account name/number.'
      );
      return;
    }
    if (!transactionId) {
      setErrorMessage('Please provide the Transaction ID (TrxID) or Bank Reference Number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('planId', selectedPlanId);
      formData.append('customerName', customerName || 'Valued Creator');
      formData.append('customerEmail', customerEmail.trim().toLowerCase());
      formData.append('paymentMethod', paymentMethod);
      formData.append('senderNumber', senderNumber.trim());
      formData.append('transactionId', transactionId.trim().toUpperCase());
      formData.append('amountPaid', amountPaid.trim());
      formData.append('customerNote', customerNote.trim());

      if (activeOrderId) {
        formData.append('orderId', activeOrderId);
      }

      if (screenshotFile) {
        formData.append('screenshot', screenshotFile);
      }

      const res = await fetch('/api/payment/submit', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Payment proof submission failed.');
      }

      setActiveOrderId(data.orderId);
      // Update browser URL query param cleanly without reloading
      const newUrl = `/saas-motion-pro/checkout?orderId=${data.orderId}`;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);

      setSuccessMessage('Payment submitted successfully! Verifying status...');

      // Immediately fetch order status
      const statusRes = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(data.orderId)}`);
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setOrderStatus(statusData);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const refreshStatus = async () => {
    if (!activeOrderId) return;
    setIsPolling(true);
    try {
      const res = await fetch(`/api/checkout/order-status?orderId=${encodeURIComponent(activeOrderId)}`);
      if (res.ok) {
        const data = await res.json();
        setOrderStatus(data);
      }
    } catch (err) {
      console.warn('Manual refresh error', err);
    } finally {
      setIsPolling(false);
    }
  };

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: COMPLETED / VERIFIED ORDER
  // ═══════════════════════════════════════════════════════════════════════
  if (orderStatus && orderStatus.status === 'completed' && orderStatus.licenseKey) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5" /> Payment Verified & Approved
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Your License is Active!
        </h1>
        <p className="text-sm text-purple-200/80 max-w-lg mx-auto mb-8">
          Thank you, <strong className="text-white">{orderStatus.customerName || 'Creator'}</strong>. Your payment has been verified and your commercial license key has been cryptographically generated.
        </p>

        {/* License Key Display Card */}
        <div className="rounded-3xl bg-[#0f0b24] border border-purple-800/40 p-6 sm:p-8 mb-8 text-left shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <span className="text-xs font-mono text-purple-400 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Key className="w-4 h-4 text-purple-400" /> Commercial License Key
            </span>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800/40 font-bold">
                {orderStatus.maxDevices || currentPlan.devices} Workstation { (orderStatus.maxDevices || currentPlan.devices) === 1 ? 'Seat' : 'Seats' }
              </span>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-purple-950 text-purple-300 border border-purple-800/40">
                Perpetual
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#080614] p-3.5 rounded-2xl border border-purple-900/60 mb-4">
            <code className="text-sm sm:text-base font-mono text-purple-200 select-all font-bold tracking-wider flex-1 break-all">
              {orderStatus.licenseKey}
            </code>
            <button
              onClick={() => handleCopy(orderStatus.licenseKey!, 'key')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 shadow-lg shadow-purple-600/30"
            >
              {copiedKey === 'key' ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" /> Copy Key
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-purple-300/70 border-t border-purple-900/40 pt-4">
            <span>Dispatched to: <strong className="text-purple-200">{orderStatus.customerEmail}</strong></span>
            <span className="font-mono text-[11px]">Order #{orderStatus.orderId}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
          <Link
            href="/saas-motion-pro/download"
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/35 transition flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" /> Download Extension ZIP
          </Link>
          <Link
            href={`/saas-motion-pro/dashboard?key=${orderStatus.licenseKey}`}
            className="px-6 py-4 rounded-2xl bg-[#181238] hover:bg-purple-900/50 text-purple-200 hover:text-white border border-purple-700/50 font-bold text-sm transition flex items-center justify-center gap-2"
          >
            <Key className="w-4 h-4" /> Manage Workstations
          </Link>
        </div>

        {/* Step by step install guide */}
        <div className="text-left rounded-3xl bg-[#080614] border border-purple-900/40 p-6 sm:p-8 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Info className="w-4 h-4 text-purple-400" /> Quick Setup in After Effects
          </h3>
          <ol className="text-xs text-purple-300/80 space-y-2.5 list-decimal list-inside leading-relaxed">
            <li>Download the extension ZIP and follow the 2-minute install script for macOS or Windows.</li>
            <li>In Adobe After Effects, go to <code className="text-purple-200 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">Window &gt; Extensions &gt; SaaS Motion Pro</code>.</li>
            <li>Paste your license key <code className="text-purple-200 bg-purple-950/60 px-1.5 py-0.5 rounded font-mono">{orderStatus.licenseKey}</code> into the activation gate.</li>
            <li>Click <strong>Activate License</strong>. Your workstation is now bound and ready for commercial use!</li>
          </ol>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: PENDING / SUBMITTED ORDER STATUS TRACKER
  // ═══════════════════════════════════════════════════════════════════════
  if (orderStatus && (orderStatus.status === 'payment_submitted' || orderStatus.status === 'pending' || orderStatus.status === 'needs_screenshot' || orderStatus.status === 'rejected')) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-[#0f0b24] border border-purple-800/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">
          {/* Header Status */}
          <div className="text-center space-y-3">
            {orderStatus.status === 'payment_submitted' && (
              <>
                <div className="w-16 h-16 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-xl shadow-amber-500/10">
                  <Clock className="w-8 h-8 animate-pulse" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-700/50 text-amber-300 text-xs font-mono uppercase tracking-wider">
                  Payment Submitted &bull; Under Review
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Verifying Your Payment
                </h1>
                <p className="text-xs sm:text-sm text-purple-300/70 max-w-md mx-auto">
                  We received your transaction proof for <strong className="text-white">{orderStatus.planName}</strong>. Our admin is verifying the deposit. Once confirmed, your license key will display here and be emailed to <strong className="text-purple-200">{orderStatus.customerEmail}</strong>.
                </p>
              </>
            )}

            {orderStatus.status === 'needs_screenshot' && (
              <>
                <div className="w-16 h-16 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center mx-auto shadow-xl">
                  <AlertCircle className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-950/80 border border-orange-700/50 text-orange-300 text-xs font-mono uppercase tracking-wider">
                  Action Required &bull; Proof Needed
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Additional Proof Requested
                </h1>
                <p className="text-xs sm:text-sm text-orange-200/90 max-w-md mx-auto">
                  {orderStatus.adminNote || 'Please provide a clear screenshot of your transaction receipt or SMS confirmation.'}
                </p>
              </>
            )}

            {orderStatus.status === 'rejected' && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto shadow-xl">
                  <XCircle className="w-8 h-8" />
                </div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-700/50 text-red-300 text-xs font-mono uppercase tracking-wider">
                  Verification Unsuccessful
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Payment Could Not Be Verified
                </h1>
                <p className="text-xs sm:text-sm text-red-200/90 max-w-md mx-auto">
                  {orderStatus.adminNote || 'The transaction details did not match our bank/bKash records. Please contact support or resubmit.'}
                </p>
              </>
            )}
          </div>

          {/* Transaction Metadata Card */}
          <div className="rounded-2xl bg-[#080614] border border-purple-900/50 p-5 space-y-3 text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-purple-900/40">
              <span className="text-purple-400">Order Reference</span>
              <span className="font-mono text-purple-200 font-bold">#{orderStatus.orderId}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400">Plan Selected</span>
              <span className="text-white font-medium">{orderStatus.planName} {orderStatus.amountPaid ? `(${orderStatus.amountPaid})` : ''}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400">Payment Channel</span>
              <span className="text-white uppercase font-bold">{orderStatus.paymentMethod}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400">Sender / Phone</span>
              <span className="font-mono text-purple-200">{orderStatus.senderNumber}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-purple-400">Transaction ID (TrxID)</span>
              <span className="font-mono text-purple-200 font-bold">{orderStatus.transactionId}</span>
            </div>
            {orderStatus.screenshotUrl && (
              <div className="flex justify-between items-center pt-2 border-t border-purple-900/40">
                <span className="text-purple-400">Receipt Proof</span>
                <a
                  href={orderStatus.screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline flex items-center gap-1 font-mono text-[11px]"
                >
                  View Uploaded Image <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Action buttons on status screen */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={refreshStatus}
              disabled={isPolling}
              className="flex-1 py-3 px-4 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 text-xs font-bold border border-purple-500/40 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isPolling ? 'animate-spin' : ''}`} />
              Check Status Now
            </button>

            <button
              onClick={() => {
                setActiveOrderId(null);
                setOrderStatus(null);
                window.history.replaceState({}, '', '/saas-motion-pro/checkout');
              }}
              className="py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 text-xs font-semibold border border-white/10 transition"
            >
              Submit Another Payment
            </button>
          </div>

          <div className="text-center text-[11px] text-purple-400/60 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Questions? Contact Sabbir directly at <span className="text-purple-300">sabbirhossen.info@gmail.com</span>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // VIEW: CHECKOUT FORM & MANUAL PAYMENT INSTRUCTIONS
  // ═══════════════════════════════════════════════════════════════════════
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-700/50 text-purple-300 text-xs font-mono uppercase tracking-wider mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Direct Manual Payment Verification
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2">
          Complete Your Order
        </h1>
        <p className="text-xs sm:text-sm text-purple-300/70">
          Pay conveniently via <strong>bKash</strong> or <strong>Bank Transfer</strong>. Your perpetual commercial license is issued upon verification.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Payment Details & Submission Form */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Payment Method Choice */}
          <div className="bg-[#0f0b24] border border-purple-800/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">1</span>
              Choose Manual Payment Channel
            </h3>

            <div className="grid grid-cols-2 gap-3">
              {settings.bkashEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bkash')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition ${
                    paymentMethod === 'bkash'
                      ? 'bg-purple-600/25 border-purple-500 shadow-lg shadow-purple-600/20 text-white'
                      : 'bg-[#080614] border-purple-900/40 text-purple-300 hover:border-purple-700/60'
                  }`}
                >
                  <Smartphone className="w-6 h-6 text-[#E2136E]" />
                  <div>
                    <div className="text-xs font-bold text-white">bKash Manual</div>
                    <div className="text-[11px] text-purple-300/70 font-mono">Send Money ({settings.bkashAccountType})</div>
                  </div>
                </button>
              )}

              {settings.bankEnabled && (
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center gap-2 transition ${
                    paymentMethod === 'bank'
                      ? 'bg-purple-600/25 border-purple-500 shadow-lg shadow-purple-600/20 text-white'
                      : 'bg-[#080614] border-purple-900/40 text-purple-300 hover:border-purple-700/60'
                  }`}
                >
                  <Building2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Bank Transfer</div>
                    <div className="text-[11px] text-purple-300/70 font-mono">NPSB / BEFTN / RTGS</div>
                  </div>
                </button>
              )}
            </div>

            {/* Instruction Box for Chosen Channel */}
            {paymentMethod === 'bkash' ? (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#080614] border border-purple-900/50 space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-[#E2136E]" /> bKash {settings.bkashAccountType} Number
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pink-950 text-pink-300 border border-pink-800/40">
                    Send Money
                  </span>
                </div>

                <div className="flex items-center justify-between bg-[#100c22] p-3 rounded-xl border border-purple-800/40">
                  <span className="font-mono text-base font-bold text-white tracking-wider">
                    {settings.bkashNumber}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(settings.bkashNumber, 'bkash')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition flex items-center gap-1 shrink-0"
                  >
                    {copiedKey === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedKey === 'bkash' ? 'Copied' : 'Copy Number'}
                  </button>
                </div>

                <div className="space-y-1.5 text-purple-300/80 leading-relaxed text-[11px]">
                  <p>1. Open your <strong>bKash App</strong> and tap <strong>Send Money</strong>.</p>
                  <p>2. Send exact amount: <strong className="text-white font-mono">৳{bdtTotal.toLocaleString()} BDT</strong>.</p>
                  <p>3. Use your name or email in the reference.</p>
                  <p>4. After sending, copy the <strong>Transaction ID (TrxID)</strong> and upload a screenshot below.</p>
                </div>
              </div>
            ) : (
              <div className="p-4 sm:p-5 rounded-2xl bg-[#080614] border border-purple-900/50 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300 font-semibold flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-400" /> Bank Transfer Details
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800/40">
                    All Bangladesh Banks
                  </span>
                </div>

                <div className="space-y-2 bg-[#100c22] p-3.5 rounded-xl border border-purple-800/40 font-mono text-[11px]">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Bank:</span>
                    <span className="text-white font-bold">{settings.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Account Name:</span>
                    <span className="text-white font-bold">{settings.bankAccountHolder}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Account Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{settings.bankAccountNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankAccountNumber, 'bank-acc')}
                        className="text-purple-400 hover:text-white"
                        title="Copy account number"
                      >
                        {copiedKey === 'bank-acc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Branch:</span>
                    <span className="text-white">{settings.bankBranch}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Routing Number:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold">{settings.bankRoutingNumber}</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(settings.bankRoutingNumber, 'bank-route')}
                        className="text-purple-400 hover:text-white"
                        title="Copy routing number"
                      >
                        {copiedKey === 'bank-route' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-purple-300/80 leading-relaxed">
                  Send <strong>৳{bdtTotal.toLocaleString()} BDT</strong> and provide the Bank Transaction Reference / Depositor Name below.
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Payment Verification Submission Form */}
          <form onSubmit={handleSubmitPayment} className="bg-[#0f0b24] border border-purple-800/40 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center">2</span>
              Submit Transaction Verification Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">Your Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sabbir Hossen"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white placeholder-purple-400/40 outline-none"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">License Delivery Email *</label>
                <input
                  type="email"
                  required
                  placeholder="name@studio.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white placeholder-purple-400/40 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">
                  {paymentMethod === 'bkash' ? 'Your bKash Number (Sender) *' : 'Depositor Account / Name *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={paymentMethod === 'bkash' ? '01XXXXXXXXX' : 'Account holder or bank slip name'}
                  value={senderNumber}
                  onChange={(e) => setSenderNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white placeholder-purple-400/40 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">
                  {paymentMethod === 'bkash' ? 'bKash Transaction ID (TrxID) *' : 'Bank Reference / Slip No. *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. BL99KXZ42M"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white placeholder-purple-400/40 outline-none font-mono uppercase"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">Amount Paid</label>
                <input
                  type="text"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-purple-300 mb-1.5 font-medium">Optional Note</label>
                <input
                  type="text"
                  placeholder="Company name, workstation remarks, etc."
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#080614] border border-purple-900/60 focus:border-purple-500 text-white placeholder-purple-400/40 outline-none"
                />
              </div>
            </div>

            {/* Screenshot Upload */}
            <div className="text-xs">
              <label className="block text-purple-300 mb-1.5 font-medium flex items-center justify-between">
                <span>Upload Payment Proof / Screenshot (Recommended)</span>
                <span className="text-[11px] text-purple-400/60">JPEG, PNG, WebP &le; 5MB</span>
              </label>

              <div className="relative border-2 border-dashed border-purple-800/60 hover:border-purple-500/80 rounded-2xl p-4 text-center transition bg-[#080614]">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleScreenshotChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                {screenshotPreview ? (
                  <div className="flex items-center gap-4 text-left">
                    <img
                      src={screenshotPreview}
                      alt="Receipt preview"
                      className="w-16 h-16 object-cover rounded-xl border border-purple-700/50"
                    />
                    <div className="flex-1 truncate">
                      <div className="text-white font-semibold truncate">{screenshotFile?.name}</div>
                      <div className="text-[11px] text-purple-400 font-mono">
                        {(screenshotFile?.size ? (screenshotFile.size / 1024).toFixed(1) : '0')} KB
                      </div>
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Ready to upload
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-3 flex flex-col items-center justify-center gap-1.5 text-purple-300/70">
                    <Upload className="w-5 h-5 text-purple-400" />
                    <span>Click or drag transaction screenshot here</span>
                  </div>
                )}
              </div>
            </div>

            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/35 transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Submitting Payment Proof...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Submit Payment Details for Verification</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary & Guarantee */}
        <div className="lg:col-span-5 bg-[#0d0920] border border-purple-900/40 rounded-3xl p-6 sm:p-8 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Order Summary</h3>

          {/* Plan Picker */}
          <div className="space-y-2.5">
            {Object.entries(PLANS_DATA).map(([id, p]) => {
              const displayBdt = id === 'plan_creator'
                ? (settings.creatorPriceBdt || p.bdtPrice)
                : id === 'plan_studio'
                ? (settings.studioPriceBdt || p.bdtPrice)
                : (settings.lifetimePriceBdt || p.bdtPrice);

              return (
                <label
                  key={id}
                  onClick={() => setSelectedPlanId(id)}
                  className={`p-3.5 rounded-2xl border flex items-center justify-between cursor-pointer text-xs transition ${
                    selectedPlanId === id
                      ? 'bg-purple-900/30 border-purple-500 text-white shadow-lg shadow-purple-900/20'
                      : 'bg-[#080614] border-purple-900/40 text-purple-300 hover:border-purple-700/60'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">{p.name}</div>
                    <div className="text-[11px] text-purple-400 font-mono mt-0.5">
                      {p.devices} Workstation {p.devices === 1 ? 'Seat' : 'Seats'} &bull; Perpetual
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-extrabold text-base text-white">৳{displayBdt.toLocaleString()}</div>
                    <div className="text-[11px] font-mono text-purple-400">
                      BDT Perpetual
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="border-t border-purple-900/40 pt-4 space-y-2.5 text-xs text-purple-300">
            <div className="flex justify-between">
              <span>License Model:</span>
              <span className="text-white font-medium">Perpetual (No Subscription)</span>
            </div>
            <div className="flex justify-between">
              <span>Workstation Limit:</span>
              <span className="text-white font-medium">{currentPlan.devices} Active Seats</span>
            </div>
            <div className="flex justify-between">
              <span>Host Compatibility:</span>
              <span className="text-white font-medium">After Effects 2019 - 2026+</span>
            </div>
            <div className="flex justify-between">
              <span>Platform:</span>
              <span className="text-white font-medium">macOS & Windows</span>
            </div>
            <div className="flex justify-between">
              <span>Currency:</span>
              <span className="font-mono text-emerald-400 font-medium">BDT (Bangladeshi Taka ৳)</span>
            </div>

            <div className="flex justify-between items-baseline pt-3 border-t border-purple-900/40 text-sm font-bold text-white">
              <span>Total Payable:</span>
              <div className="text-right">
                <div className="text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-violet-200 text-xl font-black">
                  ৳{bdtTotal.toLocaleString()} BDT
                </div>
                <div className="text-xs text-purple-400 font-mono font-normal">
                  One-Time Payment
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-[#080614] p-4 border border-purple-900/40 space-y-2 text-[11px] text-purple-400">
            <div className="flex items-center gap-1.5 text-purple-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> 14-Day Money Back Guarantee
            </div>
            <p className="leading-relaxed">
              If SaaS Motion Pro doesn&apos;t save you hours of keyframing every week, simply contact support for a prompt refund.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-purple-300 text-sm">Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
