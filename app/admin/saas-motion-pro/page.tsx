'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Sparkles, Save, Eye, DollarSign, Layers, 
  ExternalLink, CheckCircle2, Video, ArrowLeft, Key, RefreshCw
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AdminSaaSMotionProPage() {
  const { data, updatePath, saveToServer, isSaving, saveStatus } = useSettings();
  const smp = data.saasMotionPro || {
    hero: {
      badgeText: 'After Effects CEP 6.0+ Plugin & Standalone Engine',
      headline: 'Next-Gen Motion Suite for',
      highlight: 'SaaS Creators & Editors',
      subheadline: 'Supercharge your After Effects workflow with AI Voice Studio, 300+ physics curves, smart layer tools, and studio-grade presets built for high-converting promo videos.',
      primaryBtnText: 'Get SaaS Motion Pro',
      secondaryBtnText: 'Explore Features',
      videoShowreelUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
    },
    pricing: {
      creatorPrice: 49,
      studioPrice: 89,
      enterprisePrice: 149,
      bannerText: 'Limited Launch Offer — Save up to 50% on Perpetual Lifetime Licenses'
    },
    features: {
      presetsCount: '300+',
      ttsVoicesCount: '8 Studio Voices',
      deviceSeatSummary: '1 to 4 Workstation Seats with Instant Seat Release'
    }
  };

  const [activeTab, setActiveTab] = useState<'hero' | 'pricing' | 'features'>('hero');
  const [publishSuccess, setPublishSuccess] = useState(false);

  const handleSave = async () => {
    setPublishSuccess(false);
    const success = await saveToServer();
    if (success) {
      setPublishSuccess(true);
      setTimeout(() => setPublishSuccess(false), 3000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 font-sans selection:bg-[#FF6B00] selection:text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/admin" className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Visual CMS</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span className="text-[#FF6B00]">⚡</span> SaaS Motion Pro — Content &amp; Pricing Studio
          </h1>
          <p className="text-xs text-neutral-400 mt-1">
            Edit headlines, interactive showcase settings, pricing tiers, and promotional banners with 1-click live publishing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/saas-motion-pro"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> View Live Page
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-amber-500 text-black font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6B00]/30 transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {isSaving ? 'Publishing...' : 'Publish Live'}
          </button>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2 font-mono">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Content successfully published and synchronized with Turso &amp; live production pages!</span>
        </div>
      )}

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/admin/licensing"
          className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 hover:border-[#FF6B00]/40 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition">Licensing Telemetry</p>
              <p className="text-[10px] text-neutral-400 font-mono">Keys &amp; Workstations</p>
            </div>
          </div>
          <span className="text-xs text-neutral-500 font-mono">→</span>
        </Link>

        <Link
          href="/saas-motion-pro/pricing"
          target="_blank"
          className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 hover:border-[#FF6B00]/40 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition">Public Pricing Page</p>
              <p className="text-[10px] text-neutral-400 font-mono">Live Checkout Flow</p>
            </div>
          </div>
          <span className="text-xs text-neutral-500 font-mono">↗</span>
        </Link>

        <Link
          href="/admin/visual-editor"
          className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 hover:border-[#FF6B00]/40 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-[#FF6B00] transition">Visual Live Canvas</p>
              <p className="text-[10px] text-neutral-400 font-mono">Multi-device Preview</p>
            </div>
          </div>
          <span className="text-xs text-neutral-500 font-mono">→</span>
        </Link>
      </div>

      {/* Editor Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('hero')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'hero'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" /> Hero &amp; Showcase Section
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pricing'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" /> Pricing &amp; Banners
        </button>

        <button
          onClick={() => setActiveTab('features')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'features'
              ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/20'
              : 'text-neutral-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Presets &amp; Feature Counts
        </button>
      </div>

      {/* Tab 1: Hero Section */}
      {activeTab === 'hero' && (
        <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-6 text-xs">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Hero Section Copy &amp; Media</h2>
            <p className="text-neutral-400 text-xs mt-1">Configure the main headline, gradient highlight, and video showcase embed.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Top Pill Badge Text</label>
              <input
                type="text"
                value={smp.hero.badgeText}
                onChange={(e) => updatePath('saasMotionPro.hero.badgeText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Headline Prefix</label>
                <input
                  type="text"
                  value={smp.hero.headline}
                  onChange={(e) => updatePath('saasMotionPro.hero.headline', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Gradient Highlight Text</label>
                <input
                  type="text"
                  value={smp.hero.highlight}
                  onChange={(e) => updatePath('saasMotionPro.hero.highlight', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Subheadline / Paragraph Description</label>
              <textarea
                rows={3}
                value={smp.hero.subheadline}
                onChange={(e) => updatePath('saasMotionPro.hero.subheadline', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Primary CTA Button Label</label>
                <input
                  type="text"
                  value={smp.hero.primaryBtnText}
                  onChange={(e) => updatePath('saasMotionPro.hero.primaryBtnText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Secondary CTA Button Label</label>
                <input
                  type="text"
                  value={smp.hero.secondaryBtnText}
                  onChange={(e) => updatePath('saasMotionPro.hero.secondaryBtnText', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Video Showreel URL (YouTube embed or MP4)</label>
              <input
                type="text"
                value={smp.hero.videoShowreelUrl || ''}
                onChange={(e) => updatePath('saasMotionPro.hero.videoShowreelUrl', e.target.value)}
                placeholder="https://www.youtube.com/embed/..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white font-mono outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Pricing */}
      {activeTab === 'pricing' && (
        <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-6 text-xs">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Commercial Tier Pricing ($ USD)</h2>
            <p className="text-neutral-400 text-xs mt-1">Set product tier prices and global promotional banner text.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-neutral-300 mb-1 font-medium">Promotional Banner Announcement</label>
              <input
                type="text"
                value={smp.pricing.bannerText}
                onChange={(e) => updatePath('saasMotionPro.pricing.bannerText', e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="font-bold text-neutral-300 uppercase tracking-wider font-mono text-[11px]">Creator Tier</span>
                <p className="text-[10px] text-neutral-500">1 Workstation Seat</p>
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-base font-bold text-white">৳</span>
                  <input
                    type="number"
                    value={smp.pricing.creatorPrice}
                    onChange={(e) => updatePath('saasMotionPro.pricing.creatorPrice', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-500/30 space-y-2">
                <span className="font-bold text-purple-300 uppercase tracking-wider font-mono text-[11px]">Studio Commercial (Popular)</span>
                <p className="text-[10px] text-neutral-400">2 Workstation Seats</p>
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-base font-bold text-white">৳</span>
                  <input
                    type="number"
                    value={smp.pricing.studioPrice}
                    onChange={(e) => updatePath('saasMotionPro.pricing.studioPrice', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-purple-500/40 text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/40 border border-white/5 space-y-2">
                <span className="font-bold text-neutral-300 uppercase tracking-wider font-mono text-[11px]">Enterprise VIP</span>
                <p className="text-[10px] text-neutral-500">4 Workstation Seats</p>
                <div className="flex items-center gap-1.5 pt-2">
                  <span className="text-base font-bold text-white">৳</span>
                  <input
                    type="number"
                    value={smp.pricing.enterprisePrice}
                    onChange={(e) => updatePath('saasMotionPro.pricing.enterprisePrice', Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-black/60 border border-white/15 text-white font-mono font-bold outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Features */}
      {activeTab === 'features' && (
        <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-6 text-xs">
          <div className="border-b border-white/5 pb-4">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Showcase Statistics &amp; Highlights</h2>
            <p className="text-neutral-400 text-xs mt-1">Configure preset badges and statistics displayed on the landing page.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Presets Count Badge</label>
                <input
                  type="text"
                  value={smp.features.presetsCount}
                  onChange={(e) => updatePath('saasMotionPro.features.presetsCount', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">TTS Voices Count</label>
                <input
                  type="text"
                  value={smp.features.ttsVoicesCount}
                  onChange={(e) => updatePath('saasMotionPro.features.ttsVoicesCount', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 mb-1 font-medium">Workstation Seat Summary</label>
                <input
                  type="text"
                  value={smp.features.deviceSeatSummary}
                  onChange={(e) => updatePath('saasMotionPro.features.deviceSeatSummary', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/10 focus:border-[#FF6B00] text-white outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Preview Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c0a1a] to-[#120e24] border border-purple-900/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono uppercase text-purple-300 font-bold flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-purple-400" /> Live Content Preview
          </span>
          <span className="text-[10px] text-neutral-500 font-mono">Synchronized with UI State</span>
        </div>

        <div className="p-6 rounded-2xl bg-black/50 border border-white/5 space-y-3">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-[10px] font-mono text-purple-300">
            {smp.hero.badgeText}
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
            {smp.hero.headline} <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-300">{smp.hero.highlight}</span>
          </h3>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-2xl">
            {smp.hero.subheadline}
          </p>

          <div className="flex items-center gap-4 pt-3 text-xs font-mono">
            <span className="text-emerald-400 font-bold">Creator: ৳{smp.pricing.creatorPrice}</span>
            <span className="text-purple-300 font-bold">Studio: ৳{smp.pricing.studioPrice}</span>
            <span className="text-amber-400 font-bold">Enterprise: ৳{smp.pricing.enterprisePrice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
