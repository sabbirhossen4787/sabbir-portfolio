import React from 'react';
import Link from 'next/link';
import { Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-sm text-purple-200 leading-relaxed">
      <Link href="/" className="inline-flex items-center gap-1.5 text-xs text-purple-400 hover:text-white mb-8">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <h1 className="text-3xl font-extrabold text-white mb-2">Changelog & Release Notes</h1>
      <p className="text-xs text-purple-400 font-mono mb-10">Tracking continuous releases and security upgrades.</p>

      <div className="space-y-8">
        {/* Version 1.0.0 */}
        <div className="bg-[#0f0b24] border border-purple-800/50 p-8 rounded-3xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-purple-900/40 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-white">v1.0.0 Commercial Release</span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                LATEST PRODUCTION
              </span>
            </div>
            <span className="text-xs text-purple-400 font-mono">October 2026</span>
          </div>

          <div className="space-y-4 text-xs text-purple-200">
            <h3 className="font-bold text-white text-sm">Key Features & Architecture:</h3>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Voice Studio TTS:</strong> Complete text-to-speech studio with 30 Google Gemini voices + ElevenLabs integration with live waveform preview and direct timeline insertion.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>300+ Verified Presets:</strong> Kinetic typography, liquid glassmorphism, camera moves, and elastic bounces.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>AI Transcribe Speech-to-Text:</strong> Speech recognition with automatic word timestamps, subtitle generation, and .SRT export.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Visual Curve Editor & Anchor Mover:</strong> Interactive Bézier easing curves and non-destructive 3x3 anchor point positioning.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Ed25519 Cryptographic Licensing:</strong> Asymmetric token verification, 2 workstation seat limits, self-service deactivation portal, and full offline grace periods.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
