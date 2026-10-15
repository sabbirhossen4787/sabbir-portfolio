'use client';

import React from 'react';
import { Search, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function SEOAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const seo = data.seoSettings || {
    metaTitle: 'Sabbir Hossen — Graphic Designer & Video Editor',
    metaDescription: 'I create visual content that helps brands communicate, promote, and grow.',
    ogTitle: 'Sabbir Hossen Portfolio',
    ogDescription: 'Visual content creator & editor specializing in commercial advertising & brand visuals.',
    ogImage: '',
    canonicalUrl: 'https://sabbirhossen.site',
    robots: 'index, follow',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Metadata &amp; Search Engine Optimization</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">SEO Settings</h1>
          <p className="text-xs text-neutral-400 mt-1">Configure search engine titles, open-graph tags, and canonical links.</p>
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
          <Search className="w-4 h-4 text-[#FF6B00]" /> Search &amp; Social Previews
        </h2>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Global Meta Title</label>
          <input
            type="text"
            value={seo.metaTitle}
            onChange={(e) => updatePath('seoSettings.metaTitle', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Meta Description</label>
          <textarea
            rows={3}
            value={seo.metaDescription}
            onChange={(e) => updatePath('seoSettings.metaDescription', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00] resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Canonical URL</label>
            <input
              type="url"
              value={seo.canonicalUrl}
              onChange={(e) => updatePath('seoSettings.canonicalUrl', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Robots Directive</label>
            <input
              type="text"
              value={seo.robots}
              onChange={(e) => updatePath('seoSettings.robots', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">OpenGraph Social Share Image URL</label>
          <input
            type="url"
            value={seo.ogImage}
            onChange={(e) => updatePath('seoSettings.ogImage', e.target.value)}
            placeholder="https://media.sabbirhossen.site/og.png"
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>
      </div>
    </div>
  );
}