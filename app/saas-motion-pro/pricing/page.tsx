'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Zap, Sparkles, Shield, HelpCircle } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const PLANS = [
  {
    id: 'plan_creator',
    name: 'Creator License',
    tagline: 'Ideal for solo freelance animators & indie creators.',
    price: 1999,
    originalPrice: 3499,
    devices: 1,
    popular: false,
    features: [
      '1 Active Workstation Seat (Mac or PC)',
      'All 300+ Kinetic & Shape FFX Presets',
      'Smart Toolkit (Comps, Nulls, Layers & Physics)',
      'AI Voice Studio (Gemini 2.0 / 3.8 Flash TTS)',
      'Non-destructive 3x3 Anchor Point Mover',
      'Lifetime Free Updates for v1.x',
      'Community & Email Support'
    ]
  },
  {
    id: 'plan_studio',
    name: 'Studio Commercial',
    tagline: 'The standard for motion studios and professional editors.',
    price: 3499,
    originalPrice: 5999,
    devices: 2,
    popular: true,
    features: [
      '2 Active Workstations (Simultaneous Mac & PC)',
      'Full Commercial Client Project Rights',
      'Full Voice Studio (Gemini + ElevenLabs Engine)',
      'AI Transcribe Speech-to-Text Subtitle Generator',
      'Visual Cubic Bézier Curve Graph Editor',
      '3-Node Orbit Camera & Squircle Toolkits',
      '1-Click Seat Deactivation in Customer Dashboard',
      'Priority VIP Discord & Email Support'
    ]
  },
  {
    id: 'plan_lifetime',
    name: 'Lifetime Enterprise VIP',
    tagline: 'Maximum power and seat capacity for creative agencies.',
    price: 5999,
    originalPrice: 9999,
    devices: 4,
    popular: false,
    features: [
      '4 Active Workstation Activations',
      'Full Commercial & Agency Reseller Rights',
      'All Future Preset Expansion Packs Included',
      'Liquid Glass & 3D Morphing Suite',
      'Offline Air-Gapped Licensing Support',
      'Direct 1-on-1 Engineering Support Channel',
      'Guaranteed Lifetime Access (No Subscriptions Ever)'
    ]
  }
];

export default function PricingPage() {
  const router = useRouter();
  const { data } = useSettings();
  const smp = data?.saasMotionPro;

  const dynamicPlans = PLANS.map(p => {
    if (p.id === 'plan_creator' && smp?.pricing?.creatorPrice) {
      return { ...p, price: smp.pricing.creatorPrice };
    }
    if (p.id === 'plan_studio' && smp?.pricing?.studioPrice) {
      return { ...p, price: smp.pricing.studioPrice };
    }
    if (p.id === 'plan_lifetime' && smp?.pricing?.enterprisePrice) {
      return { ...p, price: smp.pricing.enterprisePrice };
    }
    return p;
  });

  const handleSelectPlan = (planId: string) => {
    router.push(`/saas-motion-pro/checkout?plan=${planId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{smp?.pricing?.bannerText || 'Pay Once. Own Forever. Zero Recurring Monthly Fees.'}</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Simple, Transparent Commercial Licensing
        </h1>
        <p className="text-base text-purple-300/70 leading-relaxed">
          Choose the workstation capacity that fits your workflow. Every license includes perpetual commercial rights and instant digital delivery.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-20">
        {dynamicPlans.map((plan) => (
          <div
            key={plan.id}
            className={`rounded-3xl p-8 flex flex-col justify-between transition-all relative ${
              plan.popular
                ? 'bg-gradient-to-b from-[#181138] to-[#0f0b24] border-2 border-purple-500 shadow-2xl shadow-purple-900/40 transform md:-translate-y-2'
                : 'bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-700/60'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
                Most Popular
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  {plan.devices} {plan.devices === 1 ? 'Seat' : 'Seats'}
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mb-6 min-h-[32px]">{plan.tagline}</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl sm:text-5xl font-black text-white">৳{plan.price.toLocaleString()}</span>
                <span className="text-sm text-purple-400 line-through">৳{plan.originalPrice.toLocaleString()}</span>
                <span className="text-xs text-purple-300 font-mono ml-auto">BDT / Perpetual</span>
              </div>

              <div className="border-t border-purple-900/40 pt-6 mb-8">
                <div className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-4">What's Included:</div>
                <ul className="space-y-3 text-xs text-purple-200">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => handleSelectPlan(plan.id)}
              className={`w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                plan.popular
                  ? 'bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/35 hover:shadow-purple-500/50'
                  : 'bg-[#181238] hover:bg-purple-900/50 text-purple-200 hover:text-white border border-purple-700/50'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Get {plan.name}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Security & FAQ */}
      <div className="rounded-2xl bg-[#0c0821] border border-purple-900/40 p-8 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <div className="font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
              <Shield className="w-4 h-4 text-emerald-400" /> 14-Day Guarantee
            </div>
            <p className="text-xs text-purple-300/60 leading-relaxed">
              Full satisfaction guarantee. If the extension doesn't accelerate your AE workflow, receive a prompt refund.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
              <Sparkles className="w-4 h-4 text-purple-400" /> Instant Digital Delivery
            </div>
            <p className="text-xs text-purple-300/60 leading-relaxed">
              Your cryptographic license key and customer distribution ZIP are delivered immediately upon checkout.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <div className="font-bold text-white text-sm flex items-center gap-2 justify-center md:justify-start">
              <HelpCircle className="w-4 h-4 text-violet-400" /> Switch Machines Freely
            </div>
            <p className="text-xs text-purple-300/60 leading-relaxed">
              Upgrading your Mac or PC? Release older seats anytime in 1 click via your self-service Customer Dashboard.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
