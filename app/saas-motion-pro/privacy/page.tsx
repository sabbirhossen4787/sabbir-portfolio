import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200 leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-white mb-6">Privacy Policy</h1>
      <p className="text-xs text-purple-400 font-mono mb-8">Commitment to Creator Privacy</p>

      <div className="space-y-6 bg-[#0f0b24] border border-purple-900/40 p-8 rounded-3xl">
        <section>
          <h2 className="text-lg font-bold text-white mb-2">Zero Telemetry & Offline Integrity</h2>
          <p>
            SaaS Motion Pro does not track, collect, or store your Adobe After Effects project files, animation assets, composition names, or creative content. All animation computation is performed 100% locally on your machine.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">Licensing Verification Data</h2>
          <p>
            During workstation activation, the plugin transmits only the license key, machine hostname, operating system type, and a non-reversible cryptographic hardware hash (HWID) strictly to enforce your workstation seat capacity.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-bold text-white mb-2">API Keys Protection</h2>
          <p>
            Third-party API credentials (Google Gemini, ElevenLabs) are stored solely on your local workstation in your private preferences directory. They are never transmitted to our servers.
          </p>
        </section>
      </div>
    </div>
  );
}
