'use client';

import React from 'react';
import { User, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AboutAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const about = data.about;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Content Editor</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">About Me Section</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage bio, experience years, and locations.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <User className="w-4 h-4 text-[#FF6B00]" /> Narrative &amp; Bio
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Badge Label</label>
            <input
              type="text"
              value={about.label}
              onChange={(e) => updatePath('about.label', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Experience Years</label>
            <input
              type="text"
              value={about.experienceYears}
              onChange={(e) => updatePath('about.experienceYears', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Headline</label>
          <input
            type="text"
            value={about.headline}
            onChange={(e) => updatePath('about.headline', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Highlight Text (Orange)</label>
          <input
            type="text"
            value={about.highlightText}
            onChange={(e) => updatePath('about.highlightText', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Full Description</label>
          <textarea
            rows={4}
            value={about.description}
            onChange={(e) => updatePath('about.description', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00] resize-none"
          />
        </div>
      </div>
    </div>
  );
}