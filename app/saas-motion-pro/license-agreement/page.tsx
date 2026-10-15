import React from 'react';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function LicenseAgreementPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200 leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-white mb-6">Commercial End User License Agreement (EULA)</h1>
      <p className="text-xs text-purple-400 font-mono mb-8">Last Updated: October 2026 • SaaS Motion Pro Commercial License</p>

      <div className="space-y-6 bg-[#0f0b24] border border-purple-900/40 p-8 rounded-3xl">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">1. Grant of License</h2>
          <p>
            SaaS Motion Pro grants you a perpetual, non-exclusive, non-transferable commercial license to install and use the After Effects CEP extension on up to the designated workstation capacity (1 seat for Creator, 2 seats for Studio, 4 seats for Enterprise) purchased under your order.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">2. Commercial Usage Rights</h2>
          <p>
            You are fully authorized to use all animations, motion graphics, presets, speech-to-text outputs, and AI voiceovers generated with SaaS Motion Pro in commercial client projects, SaaS marketing, YouTube videos, television broadcasts, social media campaigns, and paid advertisements without royalty fees.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">3. Prohibited Uses</h2>
          <p>
            You may not decompile, reverse engineer, bypass cryptographic verification, extract and resell the standalone .FFX preset files or JSX binaries as a competing template pack, or share your license key publicly.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">4. Hardware Binding & Seats</h2>
          <p>
            Workstation activations are bound to non-invasive machine identifiers. You can release and reassign seats at any time via your self-service Customer Dashboard.
          </p>
        </section>
      </div>
    </div>
  );
}
