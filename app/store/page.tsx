'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  Monitor,
  DownloadCloud,
  FileCode2,
  Clock
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';

export default function StorePage() {
  return (
    <main className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-16 pb-12 px-4 sm:px-6 max-w-7xl mx-auto border-b border-white/5">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full bg-[#FF6B00] animate-pulse" />
              <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider font-bold">
                Official Digital Store
              </span>
              <span className="text-neutral-600">•</span>
              <span className="text-xs font-mono text-neutral-400">By Sabbir Hossen</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
              Tools &amp; Motion Extensions
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-3 max-w-2xl leading-relaxed">
              Production-grade After Effects plugins, automation scripts, and kinetic animation toolkits
              engineered to accelerate your motion workflow and eliminate repetitive editing tasks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-neutral-300 font-mono">
              <span className="text-[#FF6B00] font-bold">BDT (৳)</span> Direct Manual Payments
            </div>
          </div>
        </div>
      </section>

      {/* Products Catalog */}
      <section className="py-16 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-white tracking-tight">Available Products</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono bg-white/10 text-neutral-300">
              1 Active Release
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Card: SaaS Motion Pro (Featured) */}
          <div className="lg:col-span-2 group bg-[#0E1015] border border-white/10 rounded-2xl overflow-hidden hover:border-[#FF6B00]/40 transition-all duration-300 flex flex-col justify-between shadow-xl shadow-black/40">
            <div>
              {/* Screenshot / Media Placeholder */}
              <div className="relative aspect-video w-full bg-[#141720] border-b border-white/10 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <div className="absolute inset-0 bg-radial-gradient from-purple-500/10 via-transparent to-transparent pointer-events-none" />
                
                {/* Visual Placeholder Bounding Frame */}
                <div className="w-full h-full border border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center p-6 bg-black/30 group-hover:border-purple-500/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-3">
                    <Monitor className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-mono uppercase tracking-wider text-purple-300 font-semibold mb-1">
                    [ Plugin Interface Preview Placeholder ]
                  </p>
                  <p className="text-[11px] text-neutral-400 max-w-md">
                    Replace with your official After Effects panel screenshot or demo video (1920 × 1080)
                  </p>
                </div>

                {/* Compatibility Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold bg-[#FF6B00] text-black uppercase tracking-wider shadow-md">
                    Featured Tool
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-medium bg-black/70 backdrop-blur-md text-white border border-white/10">
                    AE CC 2019 – 2026+
                  </span>
                </div>
              </div>

              {/* Product Information */}
              <div className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div>
                    <span className="text-[11px] font-mono uppercase tracking-wider text-purple-400 font-bold">
                      Adobe CEP Extension
                    </span>
                    <h3 className="text-2xl font-bold text-white tracking-tight mt-0.5">
                      SaaS Motion Pro
                    </h3>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-neutral-400 font-mono">Lifetime from</div>
                    <div className="text-xl font-extrabold text-[#FF6B00] font-mono">৳299 BDT</div>
                  </div>
                </div>

                <p className="text-neutral-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
                  The complete animation productivity suite for Adobe After Effects. Ships with 300+ viral kinetic presets,
                  instant 9-point anchor alignment, organic bounce physics, 3-node camera rigs, and text separation.
                </p>

                {/* Key Highlights */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-white/5 text-xs">
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>300+ FFX Presets</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>macOS &amp; Windows</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>One-Time Lifetime</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Anchor Mover</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Bounce Physics</span>
                  </div>
                  <div className="flex items-center gap-2 text-neutral-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    <span>Automated Installers</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Footer CTA */}
            <div className="p-6 sm:p-8 pt-0">
              <Link
                href="/store/saas-motion-pro"
                className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B00] hover:bg-[#FF7D1A] text-black font-bold text-xs uppercase tracking-wider py-3.5 px-6 rounded-xl transition duration-200 shadow-lg shadow-[#FF6B00]/20"
              >
                <span>View Product Details &amp; Pricing</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Extensibility Placeholder: Upcoming Products */}
          <div className="bg-[#0E1015]/60 border border-white/5 rounded-2xl p-6 sm:p-8 flex flex-col justify-between border-dashed">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-neutral-400 mb-4">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 bg-white/5 px-2.5 py-1 rounded-md">
                In Pipeline
              </span>
              <h3 className="text-lg font-bold text-white tracking-tight mt-3 mb-2">
                More Tools In Development
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed font-light">
                New motion graphics presets, Premiere Pro workflow extensions, and video editing toolkits
                are currently being crafted. Additional products will appear here once released.
              </p>
            </div>

            <div className="pt-6 border-t border-white/5">
              <div className="text-[11px] text-neutral-400 font-mono">
                Have a tool suggestion or request?
              </div>
              <Link
                href="/#contact"
                className="inline-flex items-center gap-1.5 text-xs text-[#FF6B00] hover:text-[#FF7D1A] font-semibold mt-1 transition"
              >
                <span>Send a suggestion</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Store Trust / Guarantees Strip */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 border-t border-white/5">
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B00]/10 border border-[#FF6B00]/20 flex items-center justify-center text-[#FF6B00] shrink-0">
              <DownloadCloud className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Official Google Drive Release
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Direct access to high-speed universal ZIP containing Mac and Windows one-click installers.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Cryptographic License Protection
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Ed25519 offline token validation with self-service device management via customer dashboard.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">
                Direct Developer Support
              </h4>
              <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                Personal assistance directly from Sabbir Hossen for installation, updates, and setup.
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
