'use client';

import React from 'react';
import { Share2, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function SocialLinksAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const social = data.socialLinks || {
    facebook: '',
    behance: '',
    linkedin: '',
    instagram: '',
    youtube: '',
    whatsapp: ''
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Social Profiles</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Social Links Management</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage social media profile URLs linked across the site &amp; footer.</p>
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
          <Share2 className="w-4 h-4 text-[#FF6B00]" /> Social Media URLs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Facebook URL</label>
            <input
              type="url"
              value={social.facebook}
              onChange={(e) => updatePath('socialLinks.facebook', e.target.value)}
              placeholder="https://facebook.com/..."
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Behance Profile URL</label>
            <input
              type="url"
              value={social.behance}
              onChange={(e) => updatePath('socialLinks.behance', e.target.value)}
              placeholder="https://behance.net/..."
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={social.linkedin}
              onChange={(e) => updatePath('socialLinks.linkedin', e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">WhatsApp Number</label>
            <input
              type="text"
              value={social.whatsapp}
              onChange={(e) => updatePath('socialLinks.whatsapp', e.target.value)}
              placeholder="01629774787"
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Instagram URL</label>
            <input
              type="url"
              value={social.instagram}
              onChange={(e) => updatePath('socialLinks.instagram', e.target.value)}
              placeholder="https://instagram.com/..."
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">YouTube Channel URL</label>
            <input
              type="url"
              value={social.youtube}
              onChange={(e) => updatePath('socialLinks.youtube', e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}