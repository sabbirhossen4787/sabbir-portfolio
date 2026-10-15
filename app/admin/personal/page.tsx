'use client';

import React from 'react';
import { Contact, Share2, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function PersonalInfoAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const info = data.personalInfo || {
    name: 'Sabbir Hossen',
    title: 'Graphic Designer & Video Editor',
    email: 'contact@sabbirhossen.site',
    phone: '01794232652',
    whatsapp: '01629774787',
    location: 'Bangladesh',
    website: 'sabbirhossen.site',
  };
  const social = data.socialLinks || {
    facebook: 'https://www.facebook.com/share/19ZRGTRK2V/',
    behance: 'https://www.behance.net/sisabbirahamed',
    linkedin: 'https://bd.linkedin.com/in/sabbir-hossen-60b22a212',
    instagram: '',
    youtube: '',
    whatsapp: '01629774787',
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Profile Data</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Personal Info &amp; Social Links</h1>
          <p className="text-xs text-neutral-400 mt-1">Centralized contact details used across the website &amp; footer.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      {/* Personal Info Card */}
      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Contact className="w-4 h-4 text-[#FF6B00]" /> Personal Information
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Full Name</label>
            <input
              type="text"
              value={info.name}
              onChange={(e) => updatePath('personalInfo.name', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Professional Title</label>
            <input
              type="text"
              value={info.title}
              onChange={(e) => updatePath('personalInfo.title', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Email</label>
            <input
              type="email"
              value={info.email}
              onChange={(e) => updatePath('personalInfo.email', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Phone</label>
            <input
              type="text"
              value={info.phone}
              onChange={(e) => updatePath('personalInfo.phone', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">WhatsApp</label>
            <input
              type="text"
              value={info.whatsapp}
              onChange={(e) => updatePath('personalInfo.whatsapp', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Location</label>
            <input
              type="text"
              value={info.location}
              onChange={(e) => updatePath('personalInfo.location', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* Social Links Card */}
      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Share2 className="w-4 h-4 text-[#FF6B00]" /> Social Media URLs
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Facebook</label>
            <input
              type="url"
              value={social.facebook}
              onChange={(e) => updatePath('socialLinks.facebook', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Behance Profile</label>
            <input
              type="url"
              value={social.behance}
              onChange={(e) => updatePath('socialLinks.behance', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">LinkedIn</label>
            <input
              type="url"
              value={social.linkedin}
              onChange={(e) => updatePath('socialLinks.linkedin', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Instagram</label>
            <input
              type="url"
              value={social.instagram}
              onChange={(e) => updatePath('socialLinks.instagram', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}