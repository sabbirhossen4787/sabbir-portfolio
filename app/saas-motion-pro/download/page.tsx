'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Download,
  Apple,
  Terminal,
  Copy,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export default function DownloadPage() {
  const [copiedMac, setCopiedMac] = useState(false);
  const [copiedWin, setCopiedWin] = useState(false);

  const macCommand = `defaults write com.adobe.CSXS.11 PlayerDebugMode 1
defaults write com.adobe.CSXS.12 PlayerDebugMode 1
defaults write com.adobe.CSXS.13 PlayerDebugMode 1
defaults write com.adobe.CSXS.14 PlayerDebugMode 1
defaults write com.adobe.CSXS.15 PlayerDebugMode 1
defaults write com.adobe.CSXS.16 PlayerDebugMode 1
defaults write com.adobe.CSXS.17 PlayerDebugMode 1
defaults write com.adobe.CSXS.18 PlayerDebugMode 1`;

  const winCommand = `reg add "HKCU\\Software\\Adobe\\CSXS.11" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.12" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.13" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.14" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.15" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.16" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.17" /v PlayerDebugMode /t REG_SZ /d "1" /f
reg add "HKCU\\Software\\Adobe\\CSXS.18" /v PlayerDebugMode /t REG_SZ /d "1" /f`;

  const copyToClipboard = (text: string, type: 'mac' | 'win') => {
    navigator.clipboard.writeText(text);
    if (type === 'mac') {
      setCopiedMac(true);
      setTimeout(() => setCopiedMac(false), 2000);
    } else {
      setCopiedWin(true);
      setTimeout(() => setCopiedWin(false), 2000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800/40 text-purple-300 text-xs font-semibold mb-4">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Official Verified Commercial Distribution</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
          Download SaaS Motion Pro v1.0.0
        </h1>
        <p className="text-base text-purple-300/70 leading-relaxed">
          Clean release packages for macOS and Windows. Follow the 2-minute installation guide below to start animating in Adobe After Effects.
        </p>
      </div>

      {/* OS Download Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* macOS Package */}
        <div className="rounded-3xl bg-[#0f0b24] border border-purple-800/40 p-8 flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-white">
                  <Apple className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">macOS Release</h3>
                  <div className="text-xs text-purple-400 font-mono">Apple Silicon M1-M4 & Intel</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                v1.0.0 Stable
              </span>
            </div>

            <p className="text-xs text-purple-300/70 leading-relaxed mb-6">
              Complete CEP package with Voice Studio, AI Transcribe, 300+ FFX Presets, and automated installation scripts for macOS Catalina through macOS Sequoia.
            </p>

            <div className="space-y-2 text-xs text-purple-300 font-mono bg-[#080614] p-4 rounded-xl border border-purple-900/40 mb-6">
              <div>Target Directory:</div>
              <div className="text-purple-200 break-all select-all">
                ~/Library/Application Support/Adobe/CEP/extensions/com.saasmotion.panel
              </div>
            </div>
          </div>

          <a
            href="/downloads/SaaS_Motion_Pro_v1.0.0_macOS.zip"
            download
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/35 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download for macOS (.ZIP)</span>
          </a>
        </div>

        {/* Windows Package */}
        <div className="rounded-3xl bg-[#0f0b24] border border-purple-800/40 p-8 flex flex-col justify-between shadow-2xl relative">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center text-white">
                  <Terminal className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Windows Release</h3>
                  <div className="text-xs text-purple-400 font-mono">Windows 10 & 11 (64-Bit)</div>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                v1.0.0 Stable
              </span>
            </div>

            <p className="text-xs text-purple-300/70 leading-relaxed mb-6">
              Complete CEP bundle with Voice Studio, AI Transcribe, 300+ FFX Presets, and registry setup script for Windows workstations.
            </p>

            <div className="space-y-2 text-xs text-purple-300 font-mono bg-[#080614] p-4 rounded-xl border border-purple-900/40 mb-6">
              <div>Target Directory:</div>
              <div className="text-purple-200 break-all select-all">
                C:\Program Files (x86)\Common Files\Adobe\CEP\extensions\com.saasmotion.panel
              </div>
            </div>
          </div>

          <a
            href="/downloads/SaaS_Motion_Pro_v1.0.0_Windows.zip"
            download
            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 via-violet-600 to-purple-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-sm shadow-xl shadow-purple-600/35 transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download for Windows (.ZIP)</span>
          </a>
        </div>
      </div>

      {/* 2-Minute Installation Guide */}
      <div className="rounded-3xl bg-[#0c0821] border border-purple-900/40 p-8 sm:p-10 mb-16">
        <h2 className="text-2xl font-extrabold text-white mb-6 flex items-center gap-2">
          <Terminal className="w-6 h-6 text-purple-400" /> 2-Minute Installation & CEP Debug Setup
        </h2>

        <div className="space-y-8 text-sm">
          {/* Step 1 */}
          <div>
            <div className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0">1</span>
              <span>Enable Adobe CEP PlayerDebugMode (Required Once)</span>
            </div>
            <p className="text-xs text-purple-300/70 mb-3 ml-8">
              Adobe requires PlayerDebugMode enabled so third-party extensions can run without certificate pinning.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-8">
              {/* Mac Terminal */}
              <div className="bg-[#080614] rounded-xl border border-purple-900/50 p-4">
                <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-2">
                  <span>macOS (Run in Terminal):</span>
                  <button
                    onClick={() => copyToClipboard(macCommand, 'mac')}
                    className="text-purple-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> {copiedMac ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-purple-200/90 overflow-x-auto whitespace-pre p-2 bg-[#05030b] rounded-lg">
                  {macCommand}
                </pre>
              </div>

              {/* Windows Reg */}
              <div className="bg-[#080614] rounded-xl border border-purple-900/50 p-4">
                <div className="flex items-center justify-between text-xs text-purple-300 font-bold mb-2">
                  <span>Windows (Run in Admin CMD):</span>
                  <button
                    onClick={() => copyToClipboard(winCommand, 'win')}
                    className="text-purple-400 hover:text-white flex items-center gap-1 text-[11px]"
                  >
                    <Copy className="w-3 h-3" /> {copiedWin ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-purple-200/90 overflow-x-auto whitespace-pre p-2 bg-[#05030b] rounded-lg">
                  {winCommand}
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div>
            <div className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0">2</span>
              <span>Copy Extension Folder into Adobe CEP Extensions</span>
            </div>
            <p className="text-xs text-purple-300/70 ml-8 leading-relaxed">
              Extract the downloaded ZIP. Move the entire folder named <code className="text-purple-300 font-bold">com.saasmotion.panel</code> into your Adobe CEP extensions folder.
            </p>
          </div>

          {/* Step 3 */}
          <div>
            <div className="font-bold text-white mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center shrink-0">3</span>
              <span>Launch After Effects & Enter Your License Key</span>
            </div>
            <p className="text-xs text-purple-300/70 ml-8 leading-relaxed">
              Open Adobe After Effects. Go to <strong className="text-white">Window → Extensions → SaaS Motion Pro</strong>. When prompted, enter your commercial license key (e.g. <code className="text-purple-300">SMP-XXXX-XXXX-XXXX-XXXX</code>) to activate your workstation seat.
            </p>
          </div>
        </div>
      </div>

      {/* SHA256 Checksums */}
      <div className="rounded-2xl bg-[#080614] border border-purple-900/40 p-6 font-mono text-xs text-purple-300">
        <div className="text-purple-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> Cryptographic Package Integrity Checksums (SHA-256)
        </div>
        <div className="space-y-1 text-purple-300/70">
          <div>macOS ZIP: <span className="text-purple-200 select-all">97b27c86abc2c389478974d7bba0d29ff1eb32baf07410df400ba7ecc963d0cc</span></div>
          <div>Windows ZIP: <span className="text-purple-200 select-all">1ed6300ef286ebb30e45ec17c7eab614ff60cab2eccd49f07c9e3692f3acf28d</span></div>
          <div>Universal ZIP: <span className="text-purple-200 select-all">092b5cb86a28fd054384e556cdb68e38da6d5a8a0629d48f7a6b58a03440d8bc</span></div>
        </div>
      </div>
    </div>
  );
}
