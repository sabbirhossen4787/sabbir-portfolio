'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  Copy,
  Download,
  Key,
  ArrowRight,
  Layers,
  Sparkles,
  Cpu,
  Monitor,
  Check,
  Building2,
  Smartphone,
  Info,
  Clock,
  FileCode2,
  Upload,
  AlertCircle,
  HelpCircle,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

interface PlanConfig {
  id: string;
  name: string;
  priceBdt: number;
  maxDevices: number;
  badge?: string;
  features: string[];
}

const PLANS: Record<string, PlanConfig> = {
  personal: {
    id: 'plan_personal',
    name: 'Personal Lifetime',
    priceBdt: 299,
    maxDevices: 1,
    features: [
      '1 Workstation Device Activation (Mac or PC)',
      'All 300+ Kinetic & Text FFX Presets',
      'Precision 9-Point Anchor Point Engine',
      'Physics Bounce & Inertia Expressions',
      '3-Node Smart Camera Rigging',
      'Kinetic Text Separator Engine',
      'Lifetime Extension Updates',
      'Official Google Drive Universal ZIP Access'
    ]
  },
  studio: {
    id: 'plan_studio',
    name: 'Studio Lifetime',
    priceBdt: 999,
    maxDevices: 4,
    badge: 'Best Value for Studios & Teams',
    features: [
      '4 Workstation Device Activations',
      'Commercial Rights for Client & Agency Projects',
      'All 300+ Kinetic & Text FFX Presets',
      'Precision 9-Point Anchor Point Engine',
      'Physics Bounce & Inertia Expressions',
      '3-Node Smart Camera Rigging',
      'Kinetic Text Separator Engine',
      'Self-Service Seat Management Dashboard',
      'Lifetime Extension Updates',
      'Priority Direct Email Support'
    ]
  }
};

export default function SaaSProductDetailsPage() {
  const [selectedPlanKey, setSelectedPlanKey] = useState<'personal' | 'studio'>('personal');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'bank'>('bkash');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [senderNumber, setSenderNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);

  // Submission status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedOrder, setSubmittedOrder] = useState<{
    orderId: string;
    customerEmail: string;
    amountPaid: string;
  } | null>(null);

  // Payment instruction values (with default fallbacks)
  const [paymentInfo, setPaymentInfo] = useState({
    bkashNumber: '01794232652',
    bkashAccountType: 'Personal',
    bankName: 'Islami Bank Bangladesh Ltd',
    bankAccountName: 'Sabbir Hossen',
    bankAccountNumber: '20501234567890',
    bankBranch: 'Dhanmondi Branch, Dhaka',
    bankRoutingNumber: '125272345',
    supportEmail: 'myselfsabbirhossen@gmail.com'
  });

  useEffect(() => {
    fetch('/api/payment/settings')
      .then(res => res.json())
      .then(data => {
        if (data && data.success) {
          setPaymentInfo(prev => ({
            ...prev,
            bkashNumber: data.bkashNumber || prev.bkashNumber,
            bkashAccountType: data.bkashAccountType || prev.bkashAccountType,
            bankName: data.bankName || prev.bankName,
            bankAccountName: data.bankAccountName || prev.bankAccountName,
            bankAccountNumber: data.bankAccountNumber || prev.bankAccountNumber,
            bankBranch: data.bankBranch || prev.bankBranch,
            bankRoutingNumber: data.bankRoutingNumber || prev.bankRoutingNumber,
            supportEmail: data.supportEmail || prev.supportEmail
          }));
        }
      })
      .catch(() => {
        // Safe fallback already defined
      });
  }, []);

  const selectedPlan = PLANS[selectedPlanKey];

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setErrorMessage('Please enter a valid email address so we can deliver your license key.');
      return;
    }
    if (!senderNumber.trim()) {
      setErrorMessage(
        paymentMethod === 'bkash'
          ? 'Please enter the bKash sender number.'
          : 'Please enter the sender bank account number.'
      );
      return;
    }
    if (!transactionId.trim()) {
      setErrorMessage(
        paymentMethod === 'bkash'
          ? 'Please enter the bKash Transaction ID (TrxID).'
          : 'Please enter the bank transaction reference number.'
      );
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('planId', selectedPlan.id);
      formData.append('customerName', customerName.trim() || 'Valued Creator');
      formData.append('customerEmail', customerEmail.trim());
      formData.append('paymentMethod', paymentMethod);
      formData.append('senderNumber', senderNumber.trim());
      formData.append('transactionId', transactionId.trim().toUpperCase());
      formData.append('amountPaid', `৳${selectedPlan.priceBdt} BDT`);
      if (customerNote.trim()) {
        formData.append('customerNote', customerNote.trim());
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
        throw new Error(data.error || 'Failed to submit order. Please check your inputs.');
      }

      setSubmittedOrder({
        orderId: data.orderId,
        customerEmail: customerEmail.trim(),
        amountPaid: `৳${selectedPlan.priceBdt} BDT`
      });
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred while submitting your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
      <Navbar />

      {/* Breadcrumb & Top Bar */}
      <div className="border-b border-white/5 bg-[#0C0E12]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <Link href="/" className="hover:text-white transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <Link href="/store" className="hover:text-white transition">Store</Link>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
          <span className="text-white font-semibold">SaaS Motion Pro</span>
        </div>
      </div>

      {/* Product Hero */}
      <section className="pt-12 pb-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Media & Overview */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FF6B00] text-black uppercase tracking-wider">
                  Official Release v1.0.0
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/20">
                  Adobe After Effects Extension
                </span>
                <span className="px-2.5 py-1 rounded-md text-[10px] font-mono bg-white/5 text-neutral-300 border border-white/10">
                  Lifetime License (BDT)
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                SaaS Motion Pro
              </h1>
              <p className="text-sm sm:text-base text-neutral-300 mt-3 leading-relaxed font-light">
                The comprehensive animation productivity extension for Adobe After Effects.
                Accelerate motion delivery with 300+ kinetic FFX presets, zero-drift anchor point positioning,
                custom bounce physics, and automated camera rigs.
              </p>
            </div>

            {/* Dedicated Screenshot / Demo Placeholder */}
            <div className="relative aspect-video w-full rounded-2xl bg-[#0E1015] border border-white/15 overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 text-center group">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-transparent to-orange-950/10 pointer-events-none" />
              
              <div className="w-full h-full border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-6 bg-black/40">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-purple-400 mb-4">
                  <Monitor className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-mono uppercase tracking-wider text-purple-200 font-bold mb-1">
                  [ SaaS Motion Pro Interface &amp; Demo Video Placeholder ]
                </h3>
                <p className="text-xs text-neutral-400 max-w-lg leading-relaxed">
                  Dedicated placeholder ready for your official plugin screenshot or high-resolution product demo.
                  Replace this frame with your image or video component.
                </p>
                <div className="mt-4 flex items-center gap-3 text-[11px] font-mono text-neutral-400">
                  <span>Aspect: 16:9</span>
                  <span>•</span>
                  <span>Recommended: 1920 × 1080</span>
                </div>
              </div>
            </div>

            {/* Verified Compatibility Specifications */}
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-7">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider mb-4 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#FF6B00]" />
                <span>Verified System &amp; Host Compatibility</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Host Application</span>
                  <p className="font-semibold text-white">Adobe After Effects</p>
                  <p className="text-neutral-400 text-[11px]">CC 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026+</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Operating Systems</span>
                  <p className="font-semibold text-white">macOS &amp; Windows</p>
                  <p className="text-neutral-400 text-[11px]">macOS (Apple Silicon M1-M4 &amp; Intel) + Windows 10/11 (64-bit)</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Installation Format</span>
                  <p className="font-semibold text-white">Adobe CEP 12 Extension</p>
                  <p className="text-neutral-400 text-[11px]">Automated .command (Mac) &amp; .bat (Win) installers included</p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5">
                  <span className="text-[10px] font-mono uppercase text-neutral-400">Licensing Model</span>
                  <p className="font-semibold text-white">Ed25519 Cryptographic Tokens</p>
                  <p className="text-neutral-400 text-[11px]">Genuine offline activation with self-service device deactivation</p>
                </div>
              </div>
            </div>

            {/* Core Features & Workflow Tools */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Features &amp; Workflow Toolsets
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">300+ Kinetic FFX Presets</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Instant 1-click animations for social captions, title reveals, 3D text rotation, blur fades, and kinetic typography.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00]">
                    <Layers className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">9-Point Anchor Engine</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Reposition anchor points across 9 bounding locations (TL, TC, TR, ML, Center, MR, BL, BC, BR) without shifting layer placement.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Organic Bounce Physics</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Inject mathematical inertia, squash &amp; stretch, and spring oscillations into any transform property with customizable dampening.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-[#0E1015] border border-white/10 space-y-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <FileCode2 className="w-4 h-4" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Kinetic Text Separator</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed font-light">
                    Automatically decompose multi-word typography into individual layer segments while preserving exact kerning and layout.
                  </p>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="bg-[#0E1015] border border-white/10 rounded-2xl p-6 sm:p-7 space-y-4">
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
                <Download className="w-4 h-4 text-[#FF6B00]" />
                <span>Installation Instructions</span>
              </h3>

              <div className="space-y-3 text-xs text-neutral-300">
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="font-bold text-white">1. Automated One-Click Installation (Recommended)</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Download the official Universal ZIP from your order email. Unzip the package and run:
                  </p>
                  <ul className="list-disc list-inside text-neutral-400 text-[11px] space-y-0.5 mt-1 font-mono">
                    <li><strong className="text-neutral-200">macOS:</strong> Double-click <code className="text-[#FF6B00]">Install_Mac.command</code></li>
                    <li><strong className="text-neutral-200">Windows:</strong> Double-click <code className="text-[#FF6B00]">Install_Windows.bat</code></li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="font-bold text-white">2. Manual Installation Path</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Alternatively, copy the <code className="text-purple-300 font-mono">com.saasmotion.panel</code> directory directly to:
                  </p>
                  <p className="font-mono text-[10px] text-neutral-400 break-all bg-black/40 p-2 rounded-lg border border-white/5">
                    <strong>macOS:</strong> ~/Library/Application Support/Adobe/CEP/extensions/com.saasmotion.panel<br />
                    <strong>Windows:</strong> %APPDATA%\Adobe\CEP\extensions\com.saasmotion.panel
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                  <p className="font-bold text-white">3. Activation in After Effects</p>
                  <p className="text-neutral-400 text-[11px] leading-relaxed">
                    Launch After Effects &gt; Navigate to <strong>Window &gt; Extensions &gt; SaaS Motion Pro</strong> &gt; Enter your license key &gt; Click <strong>Activate License</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* Customer Support Information */}
            <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <p className="font-bold text-white">Need Installation Assistance?</p>
                <p className="text-neutral-400 text-[11px] mt-0.5">
                  Reach out directly for setup guidance: <span className="text-neutral-200 font-mono">myselfsabbirhossen@gmail.com</span>
                </p>
              </div>
              <Link
                href="/saas-motion-pro/dashboard"
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 border border-white/10 text-xs font-semibold whitespace-nowrap text-center transition"
              >
                Workstation Seat Dashboard
              </Link>
            </div>
          </div>

          {/* Right Column: Pricing & Manual BDT Payment Checkout */}
          <div className="lg:col-span-5 sticky top-28 space-y-6">
            
            {/* Plan Selector Card */}
            <div className="bg-[#0E1015] border border-white/15 rounded-2xl p-6 sm:p-7 shadow-2xl shadow-black/60">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono uppercase tracking-wider text-[#FF6B00] font-bold">
                  ● Choose Your Lifetime Plan
                </span>
                <span className="text-[11px] font-mono text-neutral-400">One-Time BDT</span>
              </div>

              {/* Plan Options */}
              <div className="grid grid-cols-1 gap-3.5 mb-6">
                
                {/* Personal Lifetime Option */}
                <div
                  onClick={() => setSelectedPlanKey('personal')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedPlanKey === 'personal'
                      ? 'bg-[#FF6B00]/10 border-[#FF6B00] shadow-md shadow-[#FF6B00]/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlanKey === 'personal' ? 'border-[#FF6B00] bg-[#FF6B00]' : 'border-neutral-500'
                      }`}>
                        {selectedPlanKey === 'personal' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <span className="font-bold text-sm text-white">{PLANS.personal.name}</span>
                    </div>
                    <span className="text-lg font-black font-mono text-[#FF6B00]">৳299 BDT</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pl-6">
                    1 Workstation device • Standard updates • Full 300+ FFX preset library
                  </p>
                </div>

                {/* Studio Lifetime Option */}
                <div
                  onClick={() => setSelectedPlanKey('studio')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative overflow-hidden ${
                    selectedPlanKey === 'studio'
                      ? 'bg-purple-950/20 border-purple-500 shadow-md shadow-purple-500/10'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      4 Devices
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        selectedPlanKey === 'studio' ? 'border-purple-500 bg-purple-500' : 'border-neutral-500'
                      }`}>
                        {selectedPlanKey === 'studio' && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                      </div>
                      <span className="font-bold text-sm text-white">{PLANS.studio.name}</span>
                    </div>
                    <span className="text-lg font-black font-mono text-purple-400">৳999 BDT</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 pl-6">
                    4 Workstations • Commercial client rights • Self-service seat manager • Priority support
                  </p>
                </div>
              </div>

              {/* Order Form or Submitted Confirmation */}
              {submittedOrder ? (
                <div className="p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-center space-y-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="text-base font-bold text-white">Payment Submission Received!</h4>
                  <div className="p-3 bg-black/40 rounded-lg text-xs font-mono space-y-1 text-left border border-white/5">
                    <p className="text-neutral-400">Order ID: <span className="text-white font-bold">{submittedOrder.orderId}</span></p>
                    <p className="text-neutral-400">Email: <span className="text-white">{submittedOrder.customerEmail}</span></p>
                    <p className="text-neutral-400">Amount: <span className="text-emerald-400 font-bold">{submittedOrder.amountPaid}</span></p>
                  </div>
                  <p className="text-[11px] text-neutral-300 leading-relaxed text-left font-light">
                    Sabbir Hossen will verify your transaction. Once approved, your unique Ed25519 license key
                    and the official Google Drive plugin download link will be emailed to your inbox.
                  </p>
                  <div className="pt-2 flex flex-col gap-2">
                    <Link
                      href={`/saas-motion-pro/order-status?orderId=${submittedOrder.orderId}`}
                      className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider transition text-center"
                    >
                      Track Order Status
                    </Link>
                    <button
                      type="button"
                      onClick={() => setSubmittedOrder(null)}
                      className="text-[11px] text-neutral-400 hover:text-white transition"
                    >
                      Submit another transaction
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitOrder} className="space-y-4">
                  
                  {/* Payment Method Tabs */}
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2 font-bold">
                      Select Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                          paymentMethod === 'bkash'
                            ? 'bg-[#E2136E]/15 border-[#E2136E] text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Smartphone className="w-3.5 h-3.5 text-[#E2136E]" />
                        <span>bKash Send Money</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bank')}
                        className={`py-2.5 px-3 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition ${
                          paymentMethod === 'bank'
                            ? 'bg-blue-600/15 border-blue-500 text-white shadow-sm'
                            : 'bg-white/[0.02] border-white/10 text-neutral-400 hover:text-white'
                        }`}
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>Bank Transfer</span>
                      </button>
                    </div>
                  </div>

                  {/* Payment Instructions Box */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 text-xs space-y-2">
                    {paymentMethod === 'bkash' ? (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
                          <span>bKash Personal ({paymentInfo.bkashAccountType}):</span>
                          <span className="text-emerald-400 font-bold">Send Money</span>
                        </div>
                        <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5 font-mono text-sm">
                          <span className="text-white font-bold">{paymentInfo.bkashNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentInfo.bkashNumber, 'bkash')}
                            className="text-xs text-[#FF6B00] hover:text-[#FF7D1A] flex items-center gap-1 font-sans"
                          >
                            {copiedField === 'bkash' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'bkash' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-400 mt-2 leading-relaxed font-light">
                          Send <strong className="text-white">৳{selectedPlan.priceBdt} BDT</strong> to this bKash Personal number. Copy the TrxID and paste it below.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-1.5 text-[11px]">
                        <p className="font-bold text-white">{paymentInfo.bankName}</p>
                        <div className="grid grid-cols-2 gap-1 text-[10px] font-mono text-neutral-400">
                          <div>A/C Name: <span className="text-white">{paymentInfo.bankAccountName}</span></div>
                          <div>Branch: <span className="text-white">{paymentInfo.bankBranch}</span></div>
                        </div>
                        <div className="flex items-center justify-between p-1.5 rounded bg-white/5 border border-white/5 font-mono text-xs">
                          <span>A/C: {paymentInfo.bankAccountNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(paymentInfo.bankAccountNumber, 'bank')}
                            className="text-[10px] text-[#FF6B00] hover:text-[#FF7D1A] font-sans"
                          >
                            {copiedField === 'bank' ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p className="text-[10px] text-neutral-400 leading-relaxed font-light">
                          Transfer <strong className="text-white">৳{selectedPlan.priceBdt} BDT</strong> via BEFTN/NPSB/Internet Banking. Enter reference below.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Customer Information Form Inputs */}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder="e.g. Sabbir Hossen"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#FF6B00] transition"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                        Email Address <span className="text-[#FF6B00]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={customerEmail}
                        onChange={e => setCustomerEmail(e.target.value)}
                        placeholder="yourname@gmail.com (License delivery)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#FF6B00] transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                          {paymentMethod === 'bkash' ? 'bKash Sender Number' : 'Sender Account/Phone'} <span className="text-[#FF6B00]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={senderNumber}
                          onChange={e => setSenderNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#FF6B00] transition font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                          {paymentMethod === 'bkash' ? 'Transaction ID (TrxID)' : 'Bank Reference ID'} <span className="text-[#FF6B00]">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={transactionId}
                          onChange={e => setTransactionId(e.target.value)}
                          placeholder="e.g. BL92XK38PQ"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#FF6B00] transition font-mono uppercase"
                        />
                      </div>
                    </div>

                    {/* Screenshot Upload (Optional) */}
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                        Payment Screenshot <span className="text-neutral-500">(Optional for faster approval)</span>
                      </label>
                      <label className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 cursor-pointer text-xs text-neutral-400 transition">
                        <Upload className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="truncate">
                          {screenshotFile ? screenshotFile.name : 'Choose screenshot image (PNG, JPG)'}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => setScreenshotFile(e.target.files?.[0] || null)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Customer Note (Optional) */}
                    <div>
                      <label className="block text-[11px] font-mono text-neutral-300 mb-1">
                        Order Note <span className="text-neutral-500">(Optional)</span>
                      </label>
                      <input
                        type="text"
                        value={customerNote}
                        onChange={e => setCustomerNote(e.target.value)}
                        placeholder="Any special instructions or reference"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-neutral-500 text-xs focus:outline-none focus:border-[#FF6B00] transition"
                      />
                    </div>
                  </div>

                  {errorMessage && (
                    <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#FF6B00] hover:bg-[#FF7D1A] disabled:opacity-50 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition duration-200 shadow-lg shadow-[#FF6B00]/25"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Submitting Order...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit ৳{selectedPlan.priceBdt} BDT Payment Verification</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <p className="text-[10px] text-neutral-400 text-center leading-relaxed">
                    Upon verification by Sabbir Hossen, your license key and Google Drive link will be sent to{' '}
                    <span className="text-neutral-200">{customerEmail || 'your email'}</span>.
                  </p>
                </form>
              )}
            </div>

            {/* Self-Service Guarantee Box */}
            <div className="p-4 rounded-xl bg-[#0E1015] border border-white/10 text-xs text-neutral-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold font-mono text-[11px] uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Subscription • Lifetime Ownership</span>
              </div>
              <p className="text-[11px] leading-relaxed font-light">
                No monthly recurring charges. You own your license forever. Includes self-service workstation seat transfer
                via the customer dashboard whenever you upgrade your computer.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <MobileNav />
    </main>
  );
}
