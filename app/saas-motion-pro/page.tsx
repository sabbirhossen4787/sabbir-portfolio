'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import {
  Sparkles,
  Zap,
  Play,
  Volume2,
  Mic,
  Sliders,
  Layers,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Download,
  Copy,
  Cpu,
  Monitor,
  Search,
  Code,
  Radio,
  RefreshCw,
  Eye,
  Terminal,
  Activity,
  Award,
  Star
} from 'lucide-react';

const GEMINI_VOICES = [
  { name: 'Puck', tone: 'Playful & Energetic', gender: 'Male', accent: 'US Natural' },
  { name: 'Charon', tone: 'Deep & Authoritative', gender: 'Male', accent: 'Narrator' },
  { name: 'Kore', tone: 'Warm & Calming', gender: 'Female', accent: 'Friendly' },
  { name: 'Fenrir', tone: 'Resonant & Dynamic', gender: 'Male', accent: 'Cinematic' },
  { name: 'Aoede', tone: 'Melodic & Clear', gender: 'Female', accent: 'Professional' },
  { name: 'Zephyr', tone: 'Bright & Crisp', gender: 'Female', accent: 'Modern Tech' },
  { name: 'Leda', tone: 'Sophisticated', gender: 'Female', accent: 'Corporate' },
  { name: 'Orus', tone: 'Strong & Confident', gender: 'Male', accent: 'Trailer' }
];

const PRESETS_SAMPLE = [
  { name: 'Liquid Glass Morph', category: 'Glassmorphism', duration: '1.2s', type: 'Shape' },
  { name: 'Kinetic Elastic Pop', category: 'Transitions', duration: '0.8s', type: 'Transform' },
  { name: 'Cyberpunk Glitch Scan', category: 'Text Animation', duration: '1.0s', type: 'Kinetic' },
  { name: 'Smooth Momentum Slide', category: 'Position', duration: '0.6s', type: 'Easing' },
  { name: 'SaaS Feature Zoom', category: 'Camera Rigs', duration: '1.5s', type: '3D Orbit' },
  { name: 'Squircle Badge Pulse', category: 'Shapes', duration: '0.5s', type: 'Loop' },
  { name: 'Clean Typography Reveal', category: 'Text Animation', duration: '0.9s', type: 'Typewriter' },
  { name: '3D Isometric Card Lift', category: '3D Layer', duration: '1.1s', type: 'Spatial' }
];

export default function HomePage() {
  const { data } = useSettings();
  const smp = data?.saasMotionPro;

  const [activeTab, setActiveTab] = useState<'voice' | 'presets' | 'curves' | 'transcribe'>('voice');
  const [selectedVoice, setSelectedVoice] = useState('Puck');
  const [voiceText, setVoiceText] = useState('Welcome to SaaS Motion Pro. Transform your After Effects projects with AI Voice Studio and kinetic animation presets.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [audioGenerated, setAudioGenerated] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedPreset, setAppliedPreset] = useState<string | null>(null);

  // Curve state
  const [curveType, setCurveType] = useState('ease-in-out');
  const [copiedKey, setCopiedKey] = useState(false);

  const heroBadge = smp?.hero?.badgeText || 'Adobe After Effects 2019 – 2026+ Certified';
  const heroHeadline = smp?.hero?.headline || 'The Ultimate Motion Suite for';
  const heroHighlight = smp?.hero?.highlight || 'After Effects Creators';
  const heroSub = smp?.hero?.subheadline || 'Build high-converting SaaS explainers and cinematic motions 10x faster. Featuring AI Voice Studio with 30 Gemini voices, speech-to-text subtitles, visual curve editing, and 300+ production-grade FFX presets.';
  const primaryBtn = smp?.hero?.primaryBtnText || 'Get Instant Access';
  const creatorPrice = smp?.pricing?.creatorPrice ?? 49;

  const handleSimulateTTS = () => {
    setIsGenerating(true);
    setAudioGenerated(false);
    setTimeout(() => {
      setIsGenerating(false);
      setAudioGenerated(true);
    }, 1200);
  };

  const handlePlayAudio = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(voiceText);
      utterance.rate = 1.05;
      utterance.pitch = selectedVoice === 'Puck' ? 1.1 : (selectedVoice === 'Charon' ? 0.8 : 1.0);
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsPlaying(true);
      setTimeout(() => setIsPlaying(false), 2000);
    }
  };

  const filteredPresets = PRESETS_SAMPLE.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-24 pb-20 overflow-hidden">
      {/* ═══════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="relative pt-12 md:pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Glow backdrop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-950/70 border border-purple-700/40 text-purple-300 text-xs font-semibold mb-6 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>{heroBadge}</span>
          <span className="text-purple-500">•</span>
          <span className="text-emerald-400">v1.0.0 Commercial Release</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] mb-6">
          {heroHeadline}{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-violet-300 to-fuchsia-400">
            {heroHighlight}
          </span>
        </h1>

        <p className="text-base sm:text-lg text-purple-200/70 max-w-2xl mx-auto leading-relaxed mb-10">
          {heroSub}
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/saas-motion-pro/pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-base shadow-xl shadow-purple-600/35 hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5 fill-current" /> {primaryBtn} (${creatorPrice})
          </Link>
          <a
            href="#simulator"
            className="w-full sm:w-auto px-7 py-4 rounded-xl bg-[#140f2b] hover:bg-[#1b153b] text-purple-200 font-semibold text-base border border-purple-800/40 transition-all flex items-center justify-center gap-2"
          >
            <Eye className="w-4 h-4 text-purple-400" /> Test Live Panel Simulator
          </a>
        </div>

        {/* Key Selling Badges */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
          <div className="p-4 rounded-xl bg-[#0f0b24]/80 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Voice Studio</div>
              <div className="text-xs text-purple-300/60">30 Gemini + ElevenLabs</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f0b24]/80 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">300+ FFX Presets</div>
              <div className="text-xs text-purple-300/60">Kinetic & Glassmorphism</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f0b24]/80 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 shrink-0">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Visual Curve Editor</div>
              <div className="text-xs text-purple-300/60">Bézier & Keyframe Ease</div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0f0b24]/80 border border-purple-900/40 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-900/40 flex items-center justify-center text-purple-400 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">Ed25519 Licensed</div>
              <div className="text-xs text-purple-300/60">2 Workstation Seats</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          INTERACTIVE PANEL SIMULATOR (Live Browser Replica of CEP Panel)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="simulator" className="max-w-6xl mx-auto px-4 sm:px-6 w-full scroll-mt-24">
        <div className="text-center mb-8">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">Live Interactive Preview</div>
          <h2 className="text-3xl font-extrabold text-white">Experience the After Effects CEP Interface</h2>
          <p className="text-sm text-purple-300/70 max-w-xl mx-auto mt-2">
            This interactive simulator runs the real visual workflow and design tokens of SaaS Motion Pro directly in your browser.
          </p>
        </div>

        {/* Panel Container (Dark Violet Glassmorphism CEP Panel) */}
        <div className="rounded-2xl border border-purple-700/30 bg-[#0c091d] shadow-2xl shadow-purple-950/60 overflow-hidden flex flex-col md:flex-row min-h-[520px]">
          {/* Left Mini-Sidebar (CEP 34px icon rail) */}
          <div className="w-full md:w-16 bg-[#080614] border-b md:border-b-0 md:border-r border-purple-900/30 flex md:flex-col items-center justify-between p-2.5">
            <div className="flex md:flex-col items-center gap-2 w-full">
              <div className="w-10 h-10 rounded-lg bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-purple-300 mb-2">
                <Sparkles className="w-5 h-5" />
              </div>

              <button
                onClick={() => setActiveTab('voice')}
                title="Voice Studio"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'voice'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-purple-950/50'
                }`}
              >
                <Mic className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('presets')}
                title="300+ Presets Library"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'presets'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-purple-950/50'
                }`}
              >
                <Layers className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('curves')}
                title="Curve Editor"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'curves'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-purple-950/50'
                }`}
              >
                <Sliders className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('transcribe')}
                title="AI Transcribe STT"
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                  activeTab === 'transcribe'
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/40'
                    : 'text-purple-400/60 hover:text-purple-200 hover:bg-purple-950/50'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex md:flex-col items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" title="CEP Engine Online" />
            </div>
          </div>

          {/* Main Panel Content Area */}
          <div className="flex-1 flex flex-col bg-[#0b081b]">
            {/* Topbar of CEP panel */}
            <div className="h-12 border-b border-purple-900/30 px-5 flex items-center justify-between bg-[#0e0a22]/70 text-xs">
              <div className="flex items-center gap-2 font-semibold text-purple-200">
                <span className="w-2 h-2 rounded-full bg-purple-500" />
                <span>
                  {activeTab === 'voice' && 'Voice Studio (Text-to-Speech Engine)'}
                  {activeTab === 'presets' && 'Motion Library (300+ Verified Presets)'}
                  {activeTab === 'curves' && 'Bézier Curve Graph Editor'}
                  {activeTab === 'transcribe' && 'AI Speech-to-Text Transcription'}
                </span>
              </div>
              <div className="flex items-center gap-3 text-purple-400 font-mono text-[11px]">
                <span className="bg-purple-950/80 px-2 py-0.5 rounded border border-purple-800/40">Comp: Active 1080p</span>
                <span className="text-emerald-400">● Live Bridge</span>
              </div>
            </div>

            {/* Panel Tab 1: Voice Studio */}
            {activeTab === 'voice' && (
              <div className="p-6 flex flex-col gap-5 flex-1">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[#120d2a] p-3.5 rounded-xl border border-purple-900/40">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-purple-300">Model Engine:</span>
                    <span className="text-xs px-2.5 py-1 rounded-md bg-purple-800/40 text-purple-200 font-mono border border-purple-600/30">
                      gemini-2.0-flash (TTS Free Tier)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-purple-400">
                    <span>Account:</span>
                    <span className="text-emerald-300 font-medium">Studio Key #1 (Ready)</span>
                  </div>
                </div>

                {/* Voice Selection Chips */}
                <div>
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 block">
                    Select Voice (30 Available Studio Voices)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {GEMINI_VOICES.map((v) => (
                      <button
                        key={v.name}
                        onClick={() => setSelectedVoice(v.name)}
                        className={`p-2.5 rounded-lg text-left transition-all border ${
                          selectedVoice === v.name
                            ? 'bg-purple-600/30 border-purple-500 shadow-md text-white'
                            : 'bg-[#120e29] border-purple-900/40 text-purple-300/80 hover:bg-[#181336]'
                        }`}
                      >
                        <div className="font-bold text-xs flex items-center justify-between">
                          <span>{v.name}</span>
                          {selectedVoice === v.name && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        </div>
                        <div className="text-[10px] text-purple-400/80 truncate mt-0.5">{v.tone}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text prompt */}
                <div className="flex-1 flex flex-col">
                  <label className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-2 block">
                    Script / Speech Text
                  </label>
                  <textarea
                    value={voiceText}
                    onChange={(e) => setVoiceText(e.target.value)}
                    rows={3}
                    className="w-full bg-[#110d29] border border-purple-900/50 rounded-xl p-3 text-sm text-purple-100 placeholder-purple-400/40 focus:outline-none focus:border-purple-500 font-sans"
                    placeholder="Enter script to voice over in After Effects..."
                  />
                </div>

                {/* Generation & Playback Controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleSimulateTTS}
                      disabled={isGenerating}
                      className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-purple-600/30 disabled:opacity-60 transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating Voice...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" /> Generate Voice In AE
                        </>
                      )}
                    </button>

                    <button
                      onClick={handlePlayAudio}
                      disabled={!audioGenerated && !isGenerating}
                      className={`px-4 py-2.5 rounded-lg border text-xs font-semibold flex items-center gap-2 transition-all ${
                        audioGenerated
                          ? 'bg-purple-900/40 border-purple-500/60 text-purple-200 hover:bg-purple-800/40'
                          : 'bg-[#120e29] border-purple-900/30 text-purple-500 cursor-not-allowed'
                      }`}
                    >
                      {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Playing Preview...' : 'Listen Preview'}</span>
                    </button>
                  </div>

                  {audioGenerated && (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4" /> Ready to Import to Timeline
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel Tab 2: 300+ Presets Library */}
            {activeTab === 'presets' && (
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search 300+ presets (e.g. Glass, Pop, Slide, Typewriter)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-[#120e29] border border-purple-900/40 rounded-xl text-xs text-purple-200 focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <span className="text-xs text-purple-400/80 font-mono">{filteredPresets.length} loaded</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1 overflow-y-auto max-h-[300px] pr-1">
                  {filteredPresets.map((preset) => (
                    <div
                      key={preset.name}
                      className="p-3.5 rounded-xl bg-[#120e29] border border-purple-900/40 hover:border-purple-600/50 hover:bg-[#191338] transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-xs text-purple-100">{preset.name}</div>
                        <div className="text-[10px] text-purple-400 flex items-center gap-2 mt-1">
                          <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 font-mono">{preset.category}</span>
                          <span>• {preset.duration}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setAppliedPreset(preset.name);
                          setTimeout(() => setAppliedPreset(null), 1800);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          appliedPreset === preset.name
                            ? 'bg-emerald-600 text-white'
                            : 'bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/30'
                        }`}
                      >
                        {appliedPreset === preset.name ? 'Applied!' : 'Apply FFX'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Panel Tab 3: Visual Curve Editor */}
            {activeTab === 'curves' && (
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Curve Visualizer Canvas Mock */}
                  <div className="col-span-2 bg-[#110d29] rounded-xl border border-purple-900/50 p-4 flex flex-col items-center justify-center relative min-h-[220px]">
                    <svg className="w-full h-44 overflow-visible" viewBox="0 0 200 120">
                      <path d="M 0,120 L 200,120" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                      <path d="M 0,0 L 200,0" stroke="rgba(124, 58, 237, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
                      {curveType === 'ease-in-out' && (
                        <path d="M 0,120 C 80,120 120,0 200,0" fill="none" stroke="#a855f7" strokeWidth="3" />
                      )}
                      {curveType === 'elastic' && (
                        <path d="M 0,120 C 40,80 70,-30 110,20 C 140,-10 170,0 200,0" fill="none" stroke="#38bdf8" strokeWidth="3" />
                      )}
                      {curveType === 'bounce' && (
                        <path d="M 0,120 C 60,0 90,40 130,0 C 160,15 180,0 200,0" fill="none" stroke="#f59e0b" strokeWidth="3" />
                      )}
                    </svg>
                    <div className="absolute bottom-2 left-3 text-[10px] font-mono text-purple-400">
                      Bézier Coordinates: {curveType === 'ease-in-out' ? '(0.42, 0.0, 0.58, 1.0)' : '(0.68, -0.55, 0.26, 1.55)'}
                    </div>
                  </div>

                  {/* Curve Presets Picker */}
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold text-purple-300 uppercase">Ease Presets</span>
                    {['ease-in-out', 'elastic', 'bounce'].map((c) => (
                      <button
                        key={c}
                        onClick={() => setCurveType(c)}
                        className={`p-2.5 rounded-lg text-left text-xs font-semibold uppercase tracking-wider border transition-all ${
                          curveType === c
                            ? 'bg-purple-600/30 border-purple-500 text-white'
                            : 'bg-[#120e29] border-purple-900/40 text-purple-400 hover:bg-[#181336]'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setCopiedKey(true);
                        setTimeout(() => setCopiedKey(false), 1500);
                      }}
                      className="mt-auto px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-purple-600/30"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedKey ? 'Applied to Keys!' : 'Apply Curve in AE'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Panel Tab 4: AI Transcribe STT */}
            {activeTab === 'transcribe' && (
              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="p-4 rounded-xl bg-[#120e29] border border-purple-900/40 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-white">Transcribe Speech to Text</div>
                    <div className="text-[11px] text-purple-300/70 mt-0.5">Extract audio from active composition and generate synced subtitle layers</div>
                  </div>
                  <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-300 text-[10px] font-mono">Gemini STT Pool</span>
                </div>

                <div className="flex-1 bg-[#100c26] rounded-xl border border-purple-900/40 p-3 space-y-2 font-mono text-xs overflow-y-auto max-h-[160px]">
                  <div className="text-purple-400/60">[00:00:01.200 - 00:00:03.450] "Welcome to SaaS Motion Pro"</div>
                  <div className="text-purple-400/60">[00:00:03.500 - 00:00:06.100] "The all in one motion suite for After Effects"</div>
                  <div className="text-purple-300">[00:00:06.200 - 00:00:09.800] "Create kinetic typography and voiceovers in minutes"</div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button className="px-4 py-2 rounded-lg bg-[#181335] border border-purple-800/40 text-purple-300 text-xs font-semibold hover:bg-[#201a45]">
                    Export .SRT
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30">
                    Create Subtitle Layers
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          CORE FEATURES BREAKDOWN (Verified Plugin Architecture)
      ═══════════════════════════════════════════════════════════════ */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full scroll-mt-24">
        <div className="text-center mb-16">
          <div className="text-xs font-mono uppercase tracking-widest text-purple-400 mb-2">Designed for High Performance</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">Engineered to Supercharge Your Motion Workflows</h2>
          <p className="text-sm sm:text-base text-purple-300/70 max-w-2xl mx-auto mt-3">
            Every feature in SaaS Motion Pro is built from scratch for professional motion designers, SaaS founders, and video editors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-400 mb-6">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI Voice Studio (TTS)</h3>
            <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
              Integrated multi-account engine supporting 30 natural Gemini voices and ElevenLabs. Preview, customize speech rate and pitch, and inject high-definition audio straight into your active timeline.
            </p>
            <ul className="space-y-2 text-xs text-purple-300 font-mono mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Gemini 3.8 Flash & 2.0 Flash</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> ElevenLabs Multilingual v2</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Zero API key leaks (Encrypted Storage)</li>
            </ul>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-400 mb-6">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">300+ Verified Presets</h3>
            <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
              A comprehensive library of liquid glass, kinetic pop, elastic bounces, 3D card tilts, and camera zooms tested across After Effects 2019 to 2026+. One-click application to selected layers.
            </p>
            <ul className="space-y-2 text-xs text-purple-300 font-mono mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Instant FFX preset injection</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Categorized kinetic typography</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Real-time search & favorite system</li>
            </ul>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-[#0f0b24]/90 border border-purple-900/40 hover:border-purple-600/50 hover:shadow-xl hover:shadow-purple-900/20 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-purple-900/40 border border-purple-600/30 flex items-center justify-center text-purple-400 mb-6">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Curve Editor & Anchor Mover</h3>
            <p className="text-sm text-purple-300/70 leading-relaxed mb-4">
              Fine-tune motion dynamics with visual cubic Bézier handles. Re-position anchor points to any 3x3 quadrant instantly without displacing spatial coordinates or breaking parent links.
            </p>
            <ul className="space-y-2 text-xs text-purple-300 font-mono mt-auto">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 30+ Ease, Back & Elastic presets</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 3x3 Non-destructive Anchor Point Mover</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> One-click Smart Nulls & 3-Node Cameras</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          SECURITY & ED25519 LICENSING SECTION
      ═══════════════════════════════════════════════════════════════ */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 w-full">
        <div className="rounded-3xl bg-gradient-to-br from-[#120d2a] to-[#0a0718] border border-purple-700/30 p-8 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 text-xs font-semibold mb-4 border border-emerald-800/40">
                <ShieldCheck className="w-3.5 h-3.5" /> Ed25519 Cryptographic Security
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-4">
                Enterprise Commercial Licensing with Zero Bloat
              </h2>
              <p className="text-sm text-purple-200/70 leading-relaxed mb-6">
                Your license key is cryptographically signed using modern Ed25519 asymmetric cryptography. Activate up to 2 workstations simultaneously (Mac & Windows), de-activate with 1 click from your customer portal, and enjoy 100% offline verification grace periods.
              </p>
              <div className="space-y-2.5 text-xs text-purple-200 font-mono">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Hardware binding without invasive kernel drivers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Idempotent reactivation on machine reboots</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Zero telemetry or background bloatware</span>
                </div>
              </div>
            </div>

            {/* License Card Mock */}
            <div className="bg-[#07050e] rounded-2xl border border-purple-800/40 p-6 flex flex-col gap-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-purple-900/40 pb-3">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-400" /> Signed Entitlement Token
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  AUTHENTICATED
                </span>
              </div>

              <div className="font-mono text-xs bg-[#100c26] p-3 rounded-lg border border-purple-900/40 space-y-1.5 text-purple-300">
                <div><span className="text-purple-400">KEY:</span> SMP-7934-8921-8841-9920</div>
                <div><span className="text-purple-400">TIER:</span> Studio Commercial (Lifetime)</div>
                <div><span className="text-purple-400">SEATS:</span> 2 / 2 Workstations Active</div>
                <div><span className="text-purple-400">ALG:</span> Ed25519 (Asymmetric Signer)</div>
              </div>

              <Link
                href="/saas-motion-pro/dashboard"
                className="w-full py-2.5 rounded-lg bg-purple-900/40 hover:bg-purple-800/40 border border-purple-700/50 text-purple-200 text-xs font-semibold text-center transition-all"
              >
                Open Customer Seat Manager
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          PRICING CTA TEASER
      ═══════════════════════════════════════════════════════════════ */}
      <section id="pricing-teaser" className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <h2 className="text-3xl font-extrabold text-white mb-3">One-Time Investment. Lifetime Commercial Rights.</h2>
        <p className="text-sm text-purple-300/70 max-w-xl mx-auto mb-8">
          No recurring monthly fees. No cloud render credits. Install once, own forever.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/saas-motion-pro/pricing"
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/35 transition-all flex items-center gap-2"
          >
            <span>View All Plans (Starting at $49)</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
