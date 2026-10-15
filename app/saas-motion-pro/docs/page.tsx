'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Terminal,
  Mic,
  Layers,
  Sliders,
  Shield,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState<'quickstart' | 'voicestudio' | 'transcribe' | 'curves' | 'troubleshooting'>('quickstart');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-12">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-purple-400" /> SaaS Motion Pro Documentation
        </h1>
        <p className="text-sm text-purple-300/70 mt-2">
          Comprehensive guide for installing, configuring, and animating with SaaS Motion Pro for Adobe After Effects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-1 bg-[#0d0920] border border-purple-900/40 p-4 rounded-2xl h-fit">
          <button
            onClick={() => setActiveSection('quickstart')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeSection === 'quickstart' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-950/50'
            }`}
          >
            <span>Quick Start & Installation</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveSection('voicestudio')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeSection === 'voicestudio' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-950/50'
            }`}
          >
            <span>Voice Studio (TTS)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveSection('transcribe')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeSection === 'transcribe' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-950/50'
            }`}
          >
            <span>Transcribe (Speech to Text)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveSection('curves')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeSection === 'curves' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-950/50'
            }`}
          >
            <span>Curve Editor & 300+ Presets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setActiveSection('troubleshooting')}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
              activeSection === 'troubleshooting' ? 'bg-purple-600 text-white' : 'text-purple-300 hover:bg-purple-950/50'
            }`}
          >
            <span>Troubleshooting & FAQ</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="lg:col-span-3 bg-[#0d0920] border border-purple-900/40 p-8 rounded-3xl text-sm leading-relaxed text-purple-200">
          {activeSection === 'quickstart' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Quick Start & Installation</h2>
              <p>
                SaaS Motion Pro runs as an Adobe CEP (Common Extensibility Platform) panel inside Adobe After Effects 2019 through 2026+.
              </p>

              <h3 className="text-lg font-bold text-white pt-2">1. Installation Paths</h3>
              <p>Place the extracted <code className="text-purple-300 font-mono">com.saasmotion.panel</code> directory in:</p>
              <ul className="list-disc pl-5 space-y-1 font-mono text-xs text-purple-300">
                <li>macOS: <span className="text-purple-100">~/Library/Application Support/Adobe/CEP/extensions/</span></li>
                <li>Windows: <span className="text-purple-100">C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\</span></li>
              </ul>

              <h3 className="text-lg font-bold text-white pt-2">2. Activating Your Commercial License</h3>
              <p>
                When opening the panel for the first time via <strong>Window → Extensions → SaaS Motion Pro</strong>, you will be prompted to enter your license key. Enter your Crockford-Base32 format key (<code className="text-purple-300 font-mono">SMP-XXXX-XXXX-XXXX-XXXX</code>). The extension validates with the server and receives a cryptographically signed Ed25519 token cached locally for seamless offline operation.
              </p>
            </div>
          )}

          {activeSection === 'voicestudio' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Voice Studio Configuration</h2>
              <p>
                Voice Studio allows motion designers to create natural AI voiceovers without leaving After Effects.
              </p>

              <h3 className="text-lg font-bold text-white pt-2">Gemini 3.8 / 2.0 Flash TTS (Free Tier)</h3>
              <p>
                You can generate studio voiceovers at zero cost using Google Gemini TTS API. In Settings:
              </p>
              <ol className="list-decimal pl-5 space-y-2 text-xs">
                <li>Obtain a free API key from Google AI Studio (aistudio.google.com).</li>
                <li>Add the key into the Gemini Account Pool in SaaS Motion Pro Settings.</li>
                <li>Voice Studio automatically detects TTS compatibility and populates all 30 official voices (Puck, Charon, Fenrir, Aoede, Zephyr, Kore, etc.).</li>
              </ol>

              <h3 className="text-lg font-bold text-white pt-2">ElevenLabs Integration</h3>
              <p>
                If you have an ElevenLabs subscription, enter your API key in the ElevenLabs section in Settings to access your custom voice clones and multilingual models.
              </p>
            </div>
          )}

          {activeSection === 'transcribe' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">AI Transcribe (Speech-to-Text)</h2>
              <p>
                Transcribe extracts audio directly from your active composition, runs multimodal speech recognition, and creates perfectly aligned After Effects text layers with word-by-word markers.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Supports 50+ languages with automatic accent detection.</li>
                <li>Export to standard .SRT subtitle format with 1 click.</li>
                <li>Uses existing Gemini accounts without creating duplicate credential records.</li>
              </ul>
            </div>
          )}

          {activeSection === 'curves' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Curve Editor & Presets</h2>
              <p>
                Apply kinetic easing to selected keyframes instantly. The Curve Editor includes presets for Exponential Ease, Smooth Back, Elastic Bounce, and custom Bézier curves.
              </p>
              <h3 className="text-lg font-bold text-white pt-2">Anchor Point Mover</h3>
              <p>
                Click any of the 9 quadrant buttons to snap the layer anchor point without moving the visual layer in comp space. Works across single or multiple selected layers.
              </p>
            </div>
          )}

          {activeSection === 'troubleshooting' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white">Troubleshooting & FAQ</h2>
              <div className="space-y-4 text-xs">
                <div>
                  <h4 className="font-bold text-white">Q: Extension menu is grayed out or does not open.</h4>
                  <p className="text-purple-300/70 mt-1">
                    Ensure PlayerDebugMode is set to 1 in your operating system registry or defaults. See the <Link href="/saas-motion-pro/download" className="text-purple-400 underline">Download Center</Link> for the terminal copy-paste commands.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold text-white">Q: How do I move my license to a new computer?</h4>
                  <p className="text-purple-300/70 mt-1">
                    Go to the <Link href="/saas-motion-pro/dashboard" className="text-purple-400 underline">Customer Seat Manager</Link>, look up your license key, and click "Deactivate Machine". Your seat is freed immediately.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
