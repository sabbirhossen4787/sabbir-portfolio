'use client';

import React, { useState } from 'react';
import { Save, Upload, Sparkles, Video } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AdminHeroCMSPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const hero = data.hero;
  const showreel = data.showreel || { videoUrl: '' };
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, targetField: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        updatePath(targetField, json.url);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleShowreelUrlChange = (val: string) => {
    let clean = val.trim();
    if (clean.includes('watch?v=')) {
      clean = clean.replace('watch?v=', 'embed/') + '?autoplay=1';
    } else if (clean.includes('youtu.be/')) {
      clean = clean.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1';
    }
    updatePath('showreel.videoUrl', clean);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">CMS Manager</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Hero Section Content</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage headlines, buttons, video links, and banners.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#FF6B00]/25 transition cursor-pointer"
        >
          <Save className="w-4 h-4" /> {isSaving ? 'Saving...' : 'Save & Publish'}
        </button>
      </div>

      <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-6 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#FF6B00]" /> Text &amp; Headline Content
        </h2>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Availability Badge Text</label>
          <input
            type="text"
            value={hero.availabilityText}
            onChange={(e) => updatePath('hero.availabilityText', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Headline Line 1 (White)</label>
            <input
              type="text"
              value={hero.headlineStart}
              onChange={(e) => updatePath('hero.headlineStart', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Headline Line 2 (Orange Accent)</label>
            <input
              type="text"
              value={hero.headlineAccent}
              onChange={(e) => updatePath('hero.headlineAccent', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Subheadline Description</label>
          <textarea
            rows={3}
            value={hero.subheadline}
            onChange={(e) => updatePath('hero.subheadline', e.target.value)}
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00] resize-none"
          />
        </div>

        {/* Buttons & Video Link */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
            <Video className="w-4 h-4 text-[#FF6B00]" /> Buttons &amp; YouTube Video Link
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Primary Button Label</label>
              <input
                type="text"
                value={hero.primaryBtnText}
                onChange={(e) => updatePath('hero.primaryBtnText', e.target.value)}
                className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Secondary Button Label</label>
              <input
                type="text"
                value={hero.secondaryBtnText}
                onChange={(e) => updatePath('hero.secondaryBtnText', e.target.value)}
                className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          </div>

          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">
              Watch Showreel YouTube Video URL
            </label>
            <input
              type="text"
              value={showreel.videoUrl}
              onChange={(e) => handleShowreelUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=your_video_id"
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>

        {/* Banner Images */}
        <div className="pt-4 border-t border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Hero Background Banner</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="block text-neutral-400 font-mono text-[10px] uppercase">Desktop Background Banner</label>
              {hero.heroImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <img src={hero.heroImage} alt="Desktop Hero" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition w-full justify-center border border-white/10">
                <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload Desktop Banner'}
                <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={(e) => handleImageUpload(e, 'hero.heroImage')} />
              </label>
            </div>

            <div className="space-y-3">
              <label className="block text-neutral-400 font-mono text-[10px] uppercase">Mobile Background Banner</label>
              {hero.mobileHeroImage && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 border border-white/10">
                  <img src={hero.mobileHeroImage} alt="Mobile Hero" className="w-full h-full object-cover" />
                </div>
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition w-full justify-center border border-white/10">
                <Upload className="w-3.5 h-3.5" /> {uploading ? 'Uploading...' : 'Upload Mobile Banner'}
                <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={(e) => handleImageUpload(e, 'hero.mobileHeroImage')} />
              </label>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}