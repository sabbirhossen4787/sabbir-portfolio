import type { Metadata } from "next";
import Link from "next/link";
import { Sparkles, Zap, Download, Key, ChevronRight, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "SaaS Motion Pro — Enterprise After Effects Motion Suite",
  description: "All-in-one Adobe After Effects extension featuring AI Voice Studio (Gemini 3.8 Flash & ElevenLabs), AI Transcribe STT, 300+ Kinetic Presets, Curve Editor, and Smart Workflow Tools.",
};

export default function SaaSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#07050e] text-[#f5f3ff] antialiased selection:bg-purple-600 selection:text-white">
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-purple-900/60 via-violet-800/40 to-purple-900/60 border-b border-purple-500/20 py-2 px-4 text-center text-xs sm:text-sm font-medium text-purple-200 flex items-center justify-center gap-2">
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>SaaS Motion Pro v1.0.0 Commercial Release is Live</span>
        <span className="text-purple-400">•</span>
        <span className="hidden md:inline">Voice Studio (30 Gemini Voices) + 300+ FFX Presets</span>
        <Link href="/saas-motion-pro/pricing" className="underline hover:text-white ml-2 inline-flex items-center gap-1 font-semibold">
          Get Instant Access <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Global Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0718]/85 border-b border-purple-900/30 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Logo & Back to Portfolio */}
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-purple-400/80 hover:text-white flex items-center gap-1 border border-purple-800/30 hover:border-purple-600/60 px-2.5 py-1.5 rounded-lg transition-colors" title="Back to Sabbir Hossen Portfolio">
              <ArrowLeft className="w-3 h-3" />
              <span className="hidden sm:inline">Portfolio</span>
            </Link>

            <Link href="/saas-motion-pro" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-violet-500 p-[1px] shadow-lg shadow-purple-600/30 group-hover:shadow-purple-500/50 transition-all">
                <div className="w-full h-full bg-[#0d0a1d] rounded-[11px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform duration-300" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  SaaS Motion <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-violet-300 font-black">PRO</span>
                </span>
                <span className="text-[10px] tracking-widest text-purple-400/80 uppercase font-mono">After Effects Suite</span>
              </div>
            </Link>
          </div>

          {/* Nav Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-purple-200/80">
            <Link href="/saas-motion-pro#simulator" className="hover:text-white transition-colors">Panel Preview</Link>
            <Link href="/saas-motion-pro#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/saas-motion-pro#presets" className="hover:text-white transition-colors">300+ Presets</Link>
            <Link href="/saas-motion-pro#voice-studio" className="hover:text-white transition-colors flex items-center gap-1">
              <span className="text-amber-400 text-xs">★</span> Voice Studio
            </Link>
            <Link href="/saas-motion-pro/pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="/saas-motion-pro/docs" className="hover:text-white transition-colors">Docs</Link>
            <Link href="/saas-motion-pro/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-purple-400" /> Manage Seats
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/saas-motion-pro/download"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 text-purple-300 border border-purple-800/40 transition-colors"
            >
              <Download className="w-3.5 h-3.5" /> Downloads
            </Link>
            <Link
              href="/saas-motion-pro/pricing"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white shadow-lg shadow-purple-600/30 hover:shadow-purple-500/50 transition-all"
            >
              <Zap className="w-4 h-4 fill-current" /> Buy License
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Global Footer */}
      <footer className="bg-[#05030b] border-t border-purple-900/30 pt-16 pb-12 text-sm text-purple-300/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Col 1: Brand Info */}
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-purple-600 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="font-bold text-white text-base">SaaS Motion Pro</span>
              </div>
              <p className="text-xs text-purple-300/60 leading-relaxed max-w-sm mb-4">
                The commercial motion design suite for Adobe After Effects. Supercharge your workflow with 300+ kinetic animation presets, AI Voice Studio with 30 Gemini voices, speech-to-text subtitles, and visual curve editing.
              </p>
              <div className="text-xs text-purple-400 font-mono">
                Crafted by <Link href="/" className="underline hover:text-white">Sabbir Hossen</Link> • Motion Designer & Developer
              </div>
            </div>

            {/* Col 2: Product */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/saas-motion-pro#features" className="hover:text-white transition">Features Overview</Link></li>
                <li><Link href="/saas-motion-pro#presets" className="hover:text-white transition">300+ Presets Library</Link></li>
                <li><Link href="/saas-motion-pro#voice-studio" className="hover:text-white transition">Voice Studio AI</Link></li>
                <li><Link href="/saas-motion-pro#simulator" className="hover:text-white transition">Panel Simulator</Link></li>
                <li><Link href="/saas-motion-pro/pricing" className="hover:text-white transition">Pricing Plans</Link></li>
                <li><Link href="/saas-motion-pro/changelog" className="hover:text-white transition">Changelog v1.0.0</Link></li>
              </ul>
            </div>

            {/* Col 3: Customer & Downloads */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Customer</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/saas-motion-pro/download" className="hover:text-white transition">Download macOS (.ZIP)</Link></li>
                <li><Link href="/saas-motion-pro/download" className="hover:text-white transition">Download Windows (.ZIP)</Link></li>
                <li><Link href="/saas-motion-pro/dashboard" className="hover:text-white transition">Manage Active Seats</Link></li>
                <li><Link href="/saas-motion-pro/docs" className="hover:text-white transition">Installation Docs</Link></li>
                <li><Link href="/saas-motion-pro/support" className="hover:text-white transition">Priority VIP Support</Link></li>
              </ul>
            </div>

            {/* Col 4: Legal & Policies */}
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Legal</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/saas-motion-pro/terms" className="hover:text-white transition">Terms of Service</Link></li>
                <li><Link href="/saas-motion-pro/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/saas-motion-pro/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
                <li><Link href="/saas-motion-pro/license-agreement" className="hover:text-white transition">License Agreement (EULA)</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-purple-900/30 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-400/60 gap-4">
            <div>
              &copy; {new Date().getFullYear()} SaaS Motion Pro. Developed by <Link href="/" className="hover:text-white">Sabbir Hossen</Link>. All rights reserved.
            </div>
            <div className="flex items-center gap-6">
              <Link href="/saas-motion-pro/download" className="hover:text-white">SHA-256 Checksums</Link>
              <Link href="/saas-motion-pro/dashboard" className="hover:text-white">Seat Portal</Link>
              <Link href="/" className="hover:text-white">Portfolio</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
