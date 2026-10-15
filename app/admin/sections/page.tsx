'use client';

import React, { useState } from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff, Save } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AdminSectionsPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const [sectionTitle, setSectionTitle] = useState('');
  const [sectionType, setSectionType] = useState('youtube');
  const [videoUrl, setVideoUrl] = useState('');

  const sections = data.homepageSections || [];
  const customSections = data.customSections || [];

  const handleAddSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    const newId = 'custom-' + Date.now();

    let embedContent = '';
    if (sectionType === 'youtube' && videoUrl) {
      let cleanUrl = videoUrl.trim();
      if (cleanUrl.includes('watch?v=')) cleanUrl = cleanUrl.replace('watch?v=', 'embed/');
      else if (cleanUrl.includes('youtu.be/')) cleanUrl = cleanUrl.replace('youtu.be/', 'www.youtube.com/embed/');
      embedContent = cleanUrl;
    }

    const newCustom = {
      id: newId,
      title: sectionTitle.trim(),
      description: sectionType === 'youtube' ? 'Video Showcase / Documentary' : 'Custom Portfolio Section',
      backgroundColor: '#090A0D',
      minHeight: 400,
      blocks: [
        {
          id: 'b-' + Date.now(),
          type: 'text' as const,
          content: embedContent || 'Custom section content created from admin.',
          x: 0,
          y: 0,
          width: 100
        }
      ]
    };

    const newHomeSec = {
      id: newId,
      name: sectionTitle.trim(),
      enabled: true,
      order: sections.length + 1,
      kind: 'custom' as const
    };

    updatePath('customSections', [...customSections, newCustom]);
    updatePath('homepageSections', [...sections, newHomeSec]);
    setSectionTitle('');
    setVideoUrl('');
    alert('Section created! Click "Save Changes" to publish on live website.');
  };

  const handleToggle = (id: string) => {
    const updated = sections.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    updatePath('homepageSections', updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this section from homepage?')) {
      updatePath('homepageSections', sections.filter(s => s.id !== id));
      updatePath('customSections', customSections.filter(s => s.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Page Builder</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Sections &amp; Layout Manager</h1>
          <p className="text-xs text-neutral-400 mt-1">Create new sections, reorder, or show/hide sections on your homepage.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-6 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </div>

      {/* 1-Click Create Section Form */}
      <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-4 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FF6B00]" /> Add New Section to Homepage
        </h2>

        <form onSubmit={handleAddSection} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Section Title</label>
              <input
                type="text"
                required
                value={sectionTitle}
                onChange={(e) => setSectionTitle(e.target.value)}
                placeholder="e.g. Old Documentary Work"
                className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Section Type</label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value)}
                className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
              >
                <option value="youtube">YouTube Video / Documentary Embed</option>
                <option value="content">Custom Content &amp; Text</option>
              </select>
            </div>
          </div>

          {sectionType === 'youtube' && (
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">YouTube Video / Channel Embed URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
              />
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Plus className="w-4 h-4" /> Create Section Now
          </button>
        </form>
      </div>

      {/* Sections List */}
      <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
          Homepage Sections ({sections.length})
        </h2>

        {sections.map((sec, i) => (
          <div key={sec.id} className="p-3.5 rounded-2xl bg-[#121318] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-mono text-neutral-500">{i + 1}</span>
              <span className="text-xs font-bold text-white">{sec.name}</span>
              {sec.kind === 'custom' && (
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  Custom
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(sec.id)}
                className={'p-1.5 rounded-lg cursor-pointer ' + (sec.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500')}
                title={sec.enabled ? 'Enabled' : 'Hidden'}
              >
                {sec.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              {sec.kind === 'custom' && (
                <button
                  onClick={() => handleDelete(sec.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 cursor-pointer"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}