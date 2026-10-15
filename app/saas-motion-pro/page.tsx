'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import {
  Sparkles,
  Zap,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  Sliders,
  Maximize2,
  Minimize2,
  Copy,
  Cpu,
  Monitor,
  Search,
  Check,
  RefreshCw,
  Eye,
  Grid,
  Move,
  Type,
  FolderPlus,
  Volume2,
  FileText,
  SlidersHorizontal,
  Settings,
  HelpCircle,
  Camera,
  Play,
  Share2,
  ExternalLink,
  Shield,
  ArrowRight,
  Info
} from 'lucide-react';

// Real verified presets sample from window.__SMP_PRESETS__ in the plugin index.html
const VERIFIED_PRESETS = [
  { name: '3D Down to Up', category: 'Text Animation', file: '3D Down to up.ffx', tag: 'Kinetic 3D' },
  { name: '3D Rotation Reveal', category: 'Text Animation', file: '3D Rotation.ffx', tag: 'Rotation' },
  { name: 'Blur Fade In', category: 'Text Animation', file: 'Blur Fade.ffx', tag: 'Clean Alpha' },
  { name: 'Bounce Typing', category: 'Text Animation', file: 'Bounce Typing.ffx', tag: 'Typewriter' },
  { name: 'Character Reveal', category: 'Text Animation', file: 'Character Reveal.ffx', tag: 'Kinetic' },
  { name: 'Liquid Glass Morph', category: 'Shapes & Cards', file: 'Liquid Glass.ffx', tag: 'Glassmorphism' },
  { name: 'Elastic Scale Pop', category: 'Transitions', file: 'Elastic Pop.ffx', tag: 'Physics Pop' },
  { name: 'Smooth Momentum Slide', category: 'Motion Engine', file: 'Slide Right.ffx', tag: 'Easing' },
  { name: '3-Node Orbit Zoom', category: 'Camera Tools', file: 'Camera Rig.ffx', tag: '3D Camera' },
  { name: 'Kinetic Word Separator', category: 'Text Tools', file: 'Text Separator.ffx', tag: 'Word Sync' },
  { name: 'Parametric Callout Arrow', category: 'Arrows', file: 'Arrow Trim.ffx', tag: 'Vector Draw' },
  { name: 'AI Subtitle Timecode Sync', category: 'Subtitles', file: 'SRT Engine.ffx', tag: 'Captions' }
];

const CURVE_PRESETS: Record<string, { x1: number; y1: number; x2: number; y2: number; desc: string }> = {
  'Ease Out (Fast)': { x1: 0.16, y1: 1, x2: 0.3, y2: 1, desc: 'Snappy UI motion with strong decel' },
  'Ease In Out': { x1: 0.42, y1: 0, x2: 0.58, y2: 1, desc: 'Smooth balanced motion' },
  'Elastic Pop': { x1: 0.68, y1: -0.55, x2: 0.26, y2: 1.55, desc: 'Slight overshoot with spring back' },
  'Bounce Decay': { x1: 0.25, y1: 0.1, x2: 0.25, y2: 1, desc: 'Physics simulation with gravity' },
  'Expo Out': { x1: 0.19, y1: 1, x2: 0.22, y2: 1, desc: 'Ultra-fast entrance with soft stop' },
  'Linear': { x1: 0, y1: 0, x2: 1, y2: 1, desc: 'Constant velocity travel' }
};

export default function HomePage() {
  const { data } = useSettings();
  const smp = data?.saasMotionPro;

  // Active preview tab for the real CEP interface
  const [activeTab, setActiveTab] = useState<'toolkit' | 'presets' | 'curves' | 'anchor'>('toolkit');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAnchor, setActiveAnchor] = useState<'TL' | 'TC' | 'TR' | 'ML' | 'C' | 'MR' | 'BL' | 'BC' | 'BR'>('C');
  const [selectedCurve, setSelectedCurve] = useState('Ease Out (Fast)');
  const [appliedToolMessage, setAppliedToolMessage] = useState<string | null>(null);

  // Dynamic BDT rates
  const [bdtRates, setBdtRates] = useState({
    creator: 1999,
    studio: 3499,
    lifetime: 5999
  });

  useEffect(() => {
    async function loadPricing() {
      try {
        const res = await fetch('/api/payment/settings');
        if (res.ok) {
          const json = await res.json();
          const s = json.settings || json;
          if (s) {
            setBdtRates({
              creator: s.creatorPriceBdt || 1999,
              studio: s.studioPriceBdt || 3499,
              lifetime: s.lifetimePriceBdt || 5999
            });
          }
        }
      } catch {
        // Fallback to default BDT rates
      }
    }
    loadPricing();
  }, []);

  const heroBadge = smp?.hero?.badgeText || 'Adobe After Effects 2019 – 2026+ Certified CEP 6.0+';
  const heroHeadline = smp?.hero?.headline || 'The Professional Motion Suite for';
  const heroHighlight = smp?.hero?.highlight || 'After Effects Animators';
  const heroSub = smp?.hero?.subheadline || 'Supercharge your After Effects animation workflow with 300+ production FFX presets, cubic Bézier ease graph editing, non-destructive anchor moving, smart nulls, and AI subtitle generators.';
  const primaryBtn = smp?.hero?.primaryBtnText || 'Get SaaS Motion Pro';

  const triggerHostNotice = (toolName: string) => {
    setAppliedToolMessage(`Host command: "${toolName}" targets active AE Timeline.`);
    setTimeout(() => setAppliedToolMessage(null), 3000);
  };

  const filteredPresets = VERIFIED_PRESETS.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.tag.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden font-sans selection:bg-[#7C3AED] selection:text-white">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] h-[360px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{heroBadge}</span>
          <span className="text-purple-500">•</span>
          <span className="text-emerald-400">v1.5.0 Production Ready</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          {heroHeadline}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400">
            {heroHighlight}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-purple-200/75 max-w-3xl mx-auto leading-relaxed mb-10">
          {heroSub}
        </p>

        {/* Primary CTA in BDT */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/saas-motion-pro/checkout?plan=plan_studio"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-purple-600/35 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" />
            <span>{primaryBtn} — ৳{bdtRates.studio.toLocaleString()} BDT</span>
          </Link>
          <a
            href="#live-plugin-preview"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#140f2b] hover:bg-[#1b153b] text-purple-200 font-semibold text-base border border-purple-800/40 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-purple-400" />
            <span>Explore Real Plugin Interface</span>
          </a>
        </div>

        {/* Top 4 Highlights */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
          <div className="p-4 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 flex items-center justify-center text-purple-300 shrink-0 border border-purple-700/30">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Smart Toolkit</div>
              <div className="text-[11px] text-purple-300/60">Comps, Nulls &amp; Rigs</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 flex items-center justify-center text-purple-300 shrink-0 border border-purple-700/30">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Visual Curve Editor</div>
              <div className="text-[11px] text-purple-300/60">30+ Bézier Easing Presets</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 flex items-center justify-center text-purple-300 shrink-0 border border-purple-700/30">
              <Move className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Anchor Point Mover</div>
              <div className="text-[11px] text-purple-300/60">3x3 Non-Destructive</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-900/40 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-700/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-xs">Ed25519 Licensed</div>
              <div className="text-[11px] text-purple-300/60">Multi-Seat Management</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          REAL PLUGIN UI LIVE PREVIEW
          Accurately extracted from After Effects CEP workspace:
          /Users/sabbirhossen/Documents/SaaS Motion Pro
      ═══════════════════════════════════════════════════════════════ */}
      <section id="live-plugin-preview" className="max-w-6xl mx-auto px-4 sm:px-6 w-full scroll-mt-24">
        <div className="text-center mb-10">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 font-mono text-[11px] uppercase tracking-wider mb-2">
            Authentic Adobe CEP Panel Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            The Exact Interface Inside Adobe After Effects
          </h2>
          <p className="text-sm text-purple-300/70 max-w-2xl mx-auto mt-2 leading-relaxed">
            Experience the real layout, dark violet glassmorphism tokens, and control decks identical to the actual After Effects plugin.
          </p>
        </div>

        {/* CEP Panel Frame Mockup */}
        <div className="rounded-3xl border border-purple-700/40 bg-[#0A0812] shadow-2xl shadow-purple-950/80 overflow-hidden flex flex-col md:flex-row min-h-[580px]">
          {/* Left Mini-Sidebar (CEP 34px Rail) */}
          <div className="w-full md:w-14 bg-[#0D0B18] border-b md:border-b-0 md:border-r border-[#231D3A] flex md:flex-col items-center justify-between p-2">
            <div className="flex md:flex-col items-center gap-2 w-full">
              {/* Plugin Brand Icon */}
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F1FB5] via-[#7C3AED] to-[#A855F7] flex items-center justify-center text-white shadow-md shadow-purple-900/50 mb-1">
                <Sparkles className="w-4 h-4" />
              </div>

              {/* Panel Nav Buttons */}
              <button
                onClick={() => setActiveTab('toolkit')}
                title="Smart Toolkit (Home)"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'toolkit'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-[#1A1630]'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                title="300+ Verified Presets"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'presets'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-[#1A1630]'
                }`}
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('curves')}
                title="Visual Curve & Easing Editor"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'curves'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-[#1A1630]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              <button
                onClick={() => setActiveTab('anchor')}
                title="3x3 Anchor Point Mover"
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'anchor'
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-[#1A1630]'
                }`}
              >
                <Move className="w-4 h-4" />
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex md:flex-col items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-950" title="CEP Engine Bridge Online" />
            </div>
          </div>

          {/* Main CEP Body Area */}
          <div className="flex-1 flex flex-col bg-[#0D0B18]">
            {/* Top Bar Header */}
            <div className="h-12 border-b border-[#231D3A] px-4 flex items-center justify-between bg-[#100E1C]/90 text-xs">
              <div className="flex items-center gap-2 font-semibold text-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-white font-mono text-[11px] font-bold">
                  SaaS Motion Pro Studio <span className="text-purple-400 font-normal">v1.5.0</span>
                </span>
              </div>

              <div className="flex items-center gap-3 text-purple-400 font-mono text-[11px]">
                <span className="bg-[#131020] px-2 py-0.5 rounded border border-[#231D3A] text-neutral-300">
                  Comp: 1920 × 1080 @ 30fps
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  ● CEP 6.0 Bridge
                </span>
              </div>
            </div>

            {/* Host Dependency Feedback Banner */}
            {appliedToolMessage && (
              <div className="bg-purple-950/80 border-b border-purple-500/40 px-4 py-2 text-xs text-purple-200 flex items-center justify-between animate-fadeIn">
                <div className="flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span>{appliedToolMessage}</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400">Host Operation Dispatched</span>
              </div>
            )}

            {/* VIEW 1: SMART TOOLKIT (01 Comp, 02 Layers, 03 Motion Engine) */}
            {activeTab === 'toolkit' && (
              <div className="p-5 flex flex-col gap-5 flex-1 overflow-y-auto max-h-[520px]">
                {/* Hero control deck banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#171030] to-[#0d0920] border border-[#231D3A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] font-mono uppercase tracking-wider text-purple-400 font-bold">WORKSPACE STUDIO CONTROL DECK</div>
                    <div className="text-base font-extrabold text-white">Smart Layer &amp; Keyframe Utilities</div>
                    <p className="text-xs text-purple-300/70">One-click layer helpers, composition creators, and physics motion triggers.</p>
                  </div>
                  <div className="px-3 py-1.5 rounded-lg bg-black/40 border border-purple-700/30 text-purple-300 font-mono text-[11px]">
                    14 Tools Active
                  </div>
                </div>

                {/* 01 Composition */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-purple-900/60 text-purple-300 text-[10px] flex items-center justify-center font-mono">01</span>
                      Composition Setup
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">3 Actions</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    <button
                      onClick={() => triggerHostNotice('Create 16:9 Comp (1920x1080)')}
                      className="p-3 rounded-xl bg-[#131020] border border-[#231D3A] hover:border-purple-500 hover:bg-[#1A1630] text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">New Comp (16:9)</div>
                        <div className="text-[10px] text-neutral-400 font-mono">1920 × 1080 Full HD</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-400" />
                    </button>

                    <button
                      onClick={() => triggerHostNotice('Create 9:16 Vertical Comp (1080x1920)')}
                      className="p-3 rounded-xl bg-[#131020] border border-[#231D3A] hover:border-purple-500 hover:bg-[#1A1630] text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">New Comp (9:16)</div>
                        <div className="text-[10px] text-neutral-400 font-mono">1080 × 1920 Vertical</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-400" />
                    </button>

                    <button
                      onClick={() => triggerHostNotice('Smart Clipboard Paste')}
                      className="p-3 rounded-xl bg-[#131020] border border-[#231D3A] hover:border-purple-500 hover:bg-[#1A1630] text-left transition flex items-center justify-between group"
                    >
                      <div>
                        <div className="text-xs font-bold text-white group-hover:text-purple-300">Smart Paste</div>
                        <div className="text-[10px] text-neutral-400 font-mono">Paste footage / layers</div>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-500 group-hover:text-purple-400" />
                    </button>
                  </div>
                </div>

                {/* 02 Layer Tools */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-purple-900/60 text-purple-300 text-[10px] flex items-center justify-center font-mono">02</span>
                      Layer Operations
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">8 Tools</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { name: 'Pre-compose', desc: 'Group layers safely' },
                      { name: 'Smart Duplicate', desc: 'Index duplicate' },
                      { name: 'Smart Null', desc: '50x50 Comp center' },
                      { name: 'Adjustment Layer', desc: 'Full comp bounds' },
                      { name: 'Solid Layer', desc: 'Color solid card' },
                      { name: 'Camera 3-Node', desc: 'Master orbit null' },
                      { name: 'Smart Shape', desc: 'Rounded squircle' },
                      { name: 'Follow Path', desc: 'Mask loopOut binding' }
                    ].map((tool) => (
                      <button
                        key={tool.name}
                        onClick={() => triggerHostNotice(tool.name)}
                        className="p-3 rounded-xl bg-[#131020] border border-[#231D3A] hover:border-purple-500 hover:bg-[#1A1630] text-left transition group"
                      >
                        <div className="text-xs font-bold text-white group-hover:text-purple-300 truncate">{tool.name}</div>
                        <div className="text-[10px] text-neutral-400 truncate">{tool.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 03 Motion Engine */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded bg-purple-900/60 text-purple-300 text-[10px] flex items-center justify-center font-mono">03</span>
                      Motion Engine Quick Actions
                    </span>
                    <span className="text-[10px] text-purple-400 font-mono">1-Click Keyframing</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      'Fade In', 'Fade Out', 'Slide Left', 'Slide Right',
                      'Slide Up', 'Slide Down', 'Scale Pop', 'Blur Fade',
                      'Reverse Keys', 'Split Words', 'Lock Gradient', 'Bounce Physics'
                    ].map((act) => (
                      <button
                        key={act}
                        onClick={() => triggerHostNotice(act)}
                        className="p-2.5 rounded-lg bg-[#100E1C] border border-[#1A1530] hover:border-purple-500 hover:bg-[#181330] text-xs font-semibold text-purple-200 text-center transition"
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 2: 300+ PRESETS EXPLORER */}
            {activeTab === 'presets' && (
              <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto max-h-[520px]">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 300+ FFX Presets (e.g. 3D, Blur, Bounce, Liquid Glass)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#131020] border border-[#231D3A] rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-500 font-sans"
                    />
                  </div>
                  <span className="text-xs text-purple-400/80 font-mono shrink-0">{filteredPresets.length} loaded</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.name}
                      className="p-3.5 rounded-xl bg-[#131020] border border-[#231D3A] hover:border-purple-500/60 hover:bg-[#181330] transition flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-white">{preset.name}</div>
                        <div className="text-[10px] text-purple-400 flex items-center gap-2 mt-1 font-mono">
                          <span className="px-1.5 py-0.5 rounded bg-[#100E1C] text-purple-300 border border-purple-900/40">{preset.category}</span>
                          <span>{preset.tag}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => triggerHostNotice(`Applied FFX Preset: ${preset.file}`)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#7C3AED]/30 hover:bg-[#7C3AED] text-purple-200 hover:text-white border border-[#7C3AED]/50 transition"
                      >
                        Apply FFX
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* VIEW 3: VISUAL CURVE EDITOR */}
            {activeTab === 'curves' && (
              <div className="p-5 flex flex-col gap-4 flex-1 overflow-y-auto max-h-[520px]">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Curve Canvas */}
                  <div className="col-span-2 bg-[#131020] rounded-2xl border border-[#231D3A] p-4 flex flex-col items-center justify-center relative min-h-[260px]">
                    <div className="w-full flex justify-between text-[11px] font-mono text-purple-400 pb-2 border-b border-[#231D3A]">
                      <span>Active Bézier: {selectedCurve}</span>
                      <span>Coordinates: ({CURVE_PRESETS[selectedCurve].x1}, {CURVE_PRESETS[selectedCurve].y1}, {CURVE_PRESETS[selectedCurve].x2}, {CURVE_PRESETS[selectedCurve].y2})</span>
                    </div>

                    <svg className="w-full h-44 overflow-visible my-3" viewBox="0 0 200 120">
                      <path d="M 0,120 L 200,120" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                      <path d="M 0,0 L 200,0" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                      <path
                        d={`M 0,120 C ${CURVE_PRESETS[selectedCurve].x1 * 200},${120 - (CURVE_PRESETS[selectedCurve].y1 * 120)} ${CURVE_PRESETS[selectedCurve].x2 * 200},${120 - (CURVE_PRESETS[selectedCurve].y2 * 120)} 200,0`}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="3.5"
                      />
                      <circle cx={CURVE_PRESETS[selectedCurve].x1 * 200} cy={120 - (CURVE_PRESETS[selectedCurve].y1 * 120)} r="4" fill="#38BDF8" />
                      <circle cx={CURVE_PRESETS[selectedCurve].x2 * 200} cy={120 - (CURVE_PRESETS[selectedCurve].y2 * 120)} r="4" fill="#EC4899" />
                    </svg>

                    <div className="text-[11px] text-neutral-400 font-mono">
                      {CURVE_PRESETS[selectedCurve].desc}
                    </div>
                  </div>

                  {/* Curve Preset List */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider block">Select Curve Preset</span>
                    {Object.keys(CURVE_PRESETS).map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedCurve(c)}
                        className={`w-full p-2.5 rounded-xl text-left text-xs font-bold transition border ${
                          selectedCurve === c
                            ? 'bg-[#7C3AED]/30 border-purple-500 text-white'
                            : 'bg-[#131020] border-[#231D3A] text-purple-300/80 hover:bg-[#1A1630]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    <button
                      onClick={() => triggerHostNotice(`Injected cubic Bézier ease to selected keyframes`)}
                      className="w-full mt-2 py-2.5 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-xs shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5" /> Apply Curve in AE
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 4: 3x3 ANCHOR POINT MOVER */}
            {activeTab === 'anchor' && (
              <div className="p-6 flex flex-col gap-5 flex-1 items-center justify-center overflow-y-auto max-h-[520px]">
                <div className="max-w-md w-full bg-[#131020] border border-[#231D3A] rounded-2xl p-6 space-y-5 text-center">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">3x3 Non-Destructive Anchor Point Mover</h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      Moves the anchor point to any quadrant without changing the visual position on your canvas.
                    </p>
                  </div>

                  {/* 3x3 Grid */}
                  <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto p-3 rounded-2xl bg-[#0A0812] border border-[#231D3A]">
                    {(['TL', 'TC', 'TR', 'ML', 'C', 'MR', 'BL', 'BC', 'BR'] as const).map((pos) => (
                      <button
                        key={pos}
                        onClick={() => {
                          setActiveAnchor(pos);
                          triggerHostNotice(`Anchor point re-centered to [${pos}] without coordinate displacement.`);
                        }}
                        className={`h-14 rounded-xl flex items-center justify-center font-mono text-xs font-bold transition-all ${
                          activeAnchor === pos
                            ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-600/50 scale-105'
                            : 'bg-[#131020] text-purple-300 hover:bg-[#1A1630] border border-[#231D3A]'
                        }`}
                      >
                        {pos}
                      </button>
                    ))}
                  </div>

                  <div className="text-[11px] font-mono text-purple-300 bg-[#0A0812] p-2.5 rounded-xl border border-[#231D3A]">
                    Active Target: <span className="text-emerald-400 font-bold">{activeAnchor}</span> • Compensates layer position matrix automatically
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          COMPLETE SOURCE-VERIFIED FEATURE CATALOGUE (ALL 14 MODULES)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">Verified Plugin Architecture</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Every Genuine Feature In SaaS Motion Pro</h2>
          <p className="text-sm sm:text-base text-purple-300/70 max-w-2xl mx-auto mt-3 leading-relaxed">
            Directly implemented in the plugin source. Tested across Windows &amp; macOS for production workflows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Smart Toolkit */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Grid className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">01. Smart Composition &amp; Layer Toolkit</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Instantly create 16:9 Full HD or 9:16 vertical compositions with 1 click. Features smart pre-composing, de-composing, comp duplication, and automatic layer centering.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ 16:9 / 9:16 / Smart Duplicate / Smart Paste</div>
          </div>

          {/* 2. 300+ FFX Presets */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">02. 300+ Kinetic FFX Presets</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Production-tested Adobe After Effects preset library covering kinetic typography, 3D title reveals, liquid glass, and smooth camera zooms. Instant 1-click application.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Categorized FFX library with live search</div>
          </div>

          {/* 3. Visual Curve & Easing Editor */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <SlidersHorizontal className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">03. Visual Curve &amp; Easing Graph</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Interactive cubic Bézier curve visualizer. Choose from 30+ precision ease presets (Linear, Ease-In-Out, Elastic, Bounce) and inject keyframe ease directly into AE.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Cubic Bézier graph &amp; keyframe injector</div>
          </div>

          {/* 4. Non-Destructive Anchor Mover */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Move className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">04. 3x3 Anchor Point Mover</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Re-orient the anchor point of selected layers to any 3x3 quadrant (Corners, Centers, Edges) without displacing visual canvas position or breaking parenting hierarchies.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Zero coordinate displacement logic</div>
          </div>

          {/* 5. Arrow & Callout Creator */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">05. Parametric Arrow &amp; Callouts</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Generate vector arrow shape layers with customizable heads (Triangle, Stealth, Chevron, Dot, Diamond), trim paths draw-in animation, and stroke dash controls.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Parametric SVG shapes &amp; Trim Paths</div>
          </div>

          {/* 6. AI Subtitles & Kinetic Captions */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Type className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">06. AI Subtitles &amp; Kinetic Captions</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Import standard .SRT subtitle files or transcribe timeline audio. Automatically generates synchronized After Effects text layers with kinetic word-by-word styling.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ SRT import &amp; text layer parser</div>
          </div>

          {/* 7. Standalone Motion Asset Library */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <FolderPlus className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">07. Motion Asset Library (.AEP)</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Package any active composition into a standalone .aep asset with 1 click. Browse your personal library folder and import comps directly into new projects.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Standalone comp package &amp; import</div>
          </div>

          {/* 8. Color Palette & Gradient Lock */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">08. Color Palette &amp; Gradient Lock</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Curated color harmonies and gradient locks. Quickly sync fill and stroke colors across selected shape and text layers without opening multiple picker dialogs.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Hex color converter &amp; gradient binding</div>
          </div>

          {/* 9. B-Roll Footage Finder */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Camera className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">09. B-Roll Stock Footage Finder</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Integrated stock footage search engine. Find royalty-free clips and download them straight into your active After Effects project bin.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Integrated stock footage browser</div>
          </div>

          {/* 10. AI 4x Image Upscaler */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">10. AI 4x Image &amp; Frame Upscaler</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Powered by local ONNX machine learning models. Upscale low-res assets or frozen frames to 4K clarity directly within the CEP extension environment.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Local ONNX model inference engine</div>
          </div>

          {/* 11. SFX Sound Library */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">11. SFX Studio Sound Library</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Built-in audio player and sound effects browser. Audition whooshes, impacts, and UI clicks, then drop them into your comp at the current time indicator.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Waveform preview &amp; timeline import</div>
          </div>

          {/* 12. Project Comp Notepad */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <FileText className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">12. Comp Project Notepad</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Never lose feedback or timestamps. Keep per-project notes, color codes, and client revisions saved right inside your After Effects panel workspace.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Persistent localStorage notes engine</div>
          </div>

          {/* 13. Live Layer Inspector */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">13. Live Layer Inspector</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Inspect and tweak position, scale, rotation, and opacity values from a consolidated dashboard without twirling open deep timeline property twirl-downs.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Real-time ExtendScript property bridge</div>
          </div>

          {/* 14. Ed25519 Cryptographic Licensing */}
          <div className="p-6 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-300 mb-4">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white mb-1.5">14. Ed25519 Cryptographic Security</h3>
              <p className="text-xs text-purple-300/70 leading-relaxed mb-4">
                Asymmetric cryptographic licensing backed by Ed25519 signatures. Binds to your workstation HWID with zero background daemons or performance impact.
              </p>
            </div>
            <div className="text-[11px] font-mono text-emerald-400">✓ Multi-seat release &amp; offline verification</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SYSTEM COMPATIBILITY & REQUIREMENTS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="p-8 sm:p-10 rounded-3xl bg-[#0D0B18] border border-[#231D3A] space-y-6">
          <div className="flex items-center gap-2.5 text-white font-extrabold text-xl">
            <Monitor className="w-5 h-5 text-purple-400" /> System Compatibility &amp; Requirements
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono text-purple-200">
            <div className="p-4 rounded-xl bg-[#131020] border border-[#231D3A] space-y-2">
              <span className="text-purple-400 font-bold block uppercase">Host Software</span>
              <p className="text-neutral-300">Adobe After Effects CC 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026+ (v16.0 – v25.x+)</p>
            </div>

            <div className="p-4 rounded-xl bg-[#131020] border border-[#231D3A] space-y-2">
              <span className="text-purple-400 font-bold block uppercase">Operating Systems</span>
              <p className="text-neutral-300">macOS 12+ (Apple Silicon M1/M2/M3/M4 &amp; Intel) &bull; Windows 10 &amp; 11 (64-bit)</p>
            </div>

            <div className="p-4 rounded-xl bg-[#131020] border border-[#231D3A] space-y-2">
              <span className="text-purple-400 font-bold block uppercase">Architecture</span>
              <p className="text-neutral-300">Native Adobe CEP 6.0+ panel. Zero invasive background services or system daemons.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#131020] border border-[#231D3A] space-y-2">
              <span className="text-purple-400 font-bold block uppercase">Licensing Security</span>
              <p className="text-neutral-300">Ed25519 asymmetric cryptography with 1-click self-service workstation seat release.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          BDT PRICING TEASER & PLANS
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 w-full scroll-mt-24">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-block px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 font-mono text-xs uppercase mb-3">
            Transparent Bangladeshi Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
            Pay Once. Own Forever. No Subscriptions.
          </h2>
          <p className="text-sm sm:text-base text-purple-300/70">
            All prices in Bangladeshi Taka (BDT). Instant digital license delivery via official Google Drive link upon payment verification.
          </p>
        </div>

        {/* 3 Pricing Cards in BDT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-12">
          {/* Creator */}
          <div className="p-8 rounded-3xl bg-[#0f0b24]/90 border border-purple-900/40 flex flex-col justify-between hover:border-purple-700/60 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Creator License</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  1 Seat
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mb-6">Ideal for solo freelance animators &amp; indie editors.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">৳{bdtRates.creator.toLocaleString()}</span>
                <span className="text-xs text-purple-300 font-mono ml-auto">BDT / Perpetual</span>
              </div>

              <div className="border-t border-purple-900/40 pt-5 space-y-2.5 text-xs text-purple-200 mb-8">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1 Active Workstation Seat</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> All 300+ FFX Presets</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Smart Composition &amp; Layer Toolkit</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Non-Destructive Anchor Mover</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Lifetime Updates for v1.x</div>
              </div>
            </div>

            <Link
              href="/saas-motion-pro/checkout?plan=plan_creator"
              className="w-full py-3.5 rounded-xl bg-[#181238] hover:bg-purple-900/50 text-purple-200 hover:text-white border border-purple-700/50 font-bold text-xs text-center transition block"
            >
              Get Creator License (৳{bdtRates.creator.toLocaleString()})
            </Link>
          </div>

          {/* Studio Commercial */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-[#181138] to-[#0f0b24] border-2 border-purple-500 shadow-2xl shadow-purple-900/40 flex flex-col justify-between relative transform md:-translate-y-2">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-purple-600 to-violet-500 text-white font-bold text-xs uppercase tracking-wider shadow-md">
              Most Popular
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Studio Commercial</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  2 Seats
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mb-6">The standard for commercial video editors &amp; motion studios.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">৳{bdtRates.studio.toLocaleString()}</span>
                <span className="text-xs text-purple-300 font-mono ml-auto">BDT / Perpetual</span>
              </div>

              <div className="border-t border-purple-900/40 pt-5 space-y-2.5 text-xs text-purple-200 mb-8">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 2 Active Workstations (Mac &amp; PC)</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Commercial Client Project Rights</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Visual Curve &amp; Bézier Easing Editor</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> AI Subtitles &amp; SRT Kinetic Captions</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1-Click Self-Service Seat Release</div>
              </div>
            </div>

            <Link
              href="/saas-motion-pro/checkout?plan=plan_studio"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs text-center shadow-lg shadow-purple-600/35 transition block"
            >
              Get Studio Commercial (৳{bdtRates.studio.toLocaleString()})
            </Link>
          </div>

          {/* Lifetime Enterprise */}
          <div className="p-8 rounded-3xl bg-[#0f0b24]/90 border border-purple-900/40 flex flex-col justify-between hover:border-purple-700/60 transition">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-white">Enterprise VIP</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/40">
                  4 Seats
                </span>
              </div>
              <p className="text-xs text-purple-300/70 mb-6">Maximum seat capacity for motion agencies &amp; teams.</p>

              <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-black text-white">৳{bdtRates.lifetime.toLocaleString()}</span>
                <span className="text-xs text-purple-300 font-mono ml-auto">BDT / Perpetual</span>
              </div>

              <div className="border-t border-purple-900/40 pt-5 space-y-2.5 text-xs text-purple-200 mb-8">
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4 Active Workstation Activations</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Full Agency &amp; Reseller Rights</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> All Future Expansion Packs Included</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Offline Air-Gapped Licensing Support</div>
                <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Direct Engineer WhatsApp Support</div>
              </div>
            </div>

            <Link
              href="/saas-motion-pro/checkout?plan=plan_lifetime"
              className="w-full py-3.5 rounded-xl bg-[#181238] hover:bg-purple-900/50 text-purple-200 hover:text-white border border-purple-700/50 font-bold text-xs text-center transition block"
            >
              Get Enterprise VIP (৳{bdtRates.lifetime.toLocaleString()})
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CONCISE FAQS
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-purple-300/70 mt-1">Everything you need to know about purchasing and activating SaaS Motion Pro.</p>
        </div>

        <div className="space-y-4">
          <div className="p-5 rounded-2xl bg-[#0D0B18] border border-[#231D3A] space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" /> How do I receive my plugin and license?
            </h4>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              Upon submitting your manual bKash or Bank Transfer payment, our administrator verifies the transaction. You immediately receive an official email containing your unique Ed25519 license key and the authenticated Google Drive download link.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0B18] border border-[#231D3A] space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" /> Can I move my license to a new computer?
            </h4>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              Yes. You can manage and release workstation seats in 1 click from your self-service Customer Dashboard anytime you upgrade your Mac or PC.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0B18] border border-[#231D3A] space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" /> Does it work offline?
            </h4>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              Yes. SaaS Motion Pro verifies cryptographic signatures locally on your machine using the distributed Ed25519 public key. No permanent internet connection is required to animate.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#0D0B18] border border-[#231D3A] space-y-1.5">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-purple-400" /> Are updates included?
            </h4>
            <p className="text-xs text-purple-300/80 leading-relaxed">
              All minor and maintenance updates for v1.x are included permanently. There are zero recurring subscription fees.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          FINAL PURCHASE CTA
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <div className="p-10 rounded-3xl bg-gradient-to-r from-[#171030] via-[#241348] to-[#120a26] border border-purple-500/30 shadow-2xl space-y-5">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">Ready to Animate 10x Faster in After Effects?</h2>
          <p className="text-xs sm:text-sm text-purple-300/80 max-w-xl mx-auto leading-relaxed">
            Join professional editors across Bangladesh and worldwide. Get instant access to 300+ presets, easing curves, and smart toolkit.
          </p>
          <div className="pt-2">
            <Link
              href="/saas-motion-pro/checkout?plan=plan_studio"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#7C3AED] hover:bg-purple-600 text-white font-bold text-sm shadow-xl shadow-purple-600/40 transition"
            >
              <span>Get Studio Commercial License — ৳{bdtRates.studio.toLocaleString()} BDT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
