import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200 leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-white mb-6">Terms of Service</h1>
      <p className="text-xs text-purple-400 font-mono mb-8">Effective Date: October 2026</p>

      <div className="space-y-6 bg-[#0f0b24] border border-purple-900/40 p-8 rounded-3xl">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">Acceptance of Terms</h2>
          <p>
            By purchasing, downloading, or using SaaS Motion Pro, you agree to be bound by these Terms of Service and all applicable laws and regulations.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Software Updates & Compatibility</h2>
          <p>
            SaaS Motion Pro is certified for Adobe After Effects versions 2019 through 2026+. Minor version updates and security patches within version 1.x are provided free of charge.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Third-Party API Services</h2>
          <p>
            Voice Studio and AI Transcribe allow integration with third-party providers (Google Gemini and ElevenLabs). You are responsible for maintaining your own API keys and complying with their respective terms of service.
          </p>
        </section>
      </div>
    </div>
  );
}
