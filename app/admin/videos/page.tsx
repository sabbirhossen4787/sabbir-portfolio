'use client';

import React, { useState } from 'react';
import { Video, Plus, Trash2, Eye, EyeOff, Save, Upload } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AdminVideosPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();
  const showreel = data.showreel || {
    title: 'Watch',
    highlight: 'the Work',
    description: 'A quick look at my editing style, visual quality and creative approach.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1',
    thumbnail: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200',
    duration: '01:24',
  };
  const reels = data.reels || [];

  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelViews, setNewReelViews] = useState('150K');
  const [newReelClient, setNewReelClient] = useState('Brand');
  const [newReelThumb, setNewReelThumb] = useState('https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500');
  const [uploadingReel, setUploadingReel] = useState(false);

  // রিল থাম্বনেইল সরাসরি কম্পিউটার থেকে আপলোড করার হ্যান্ডলার
  const handleUploadReelThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReel(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const json = await res.json();
      if (json.url) {
        setNewReelThumb(json.url);
      }
    } catch {
      alert('Upload failed');
    } finally {
      setUploadingReel(false);
    }
  };

  const handleYouTubeUrlChange = (val: string) => {
    let cleanUrl = val.trim();
    if (cleanUrl.includes('watch?v=')) {
      cleanUrl = cleanUrl.replace('watch?v=', 'embed/') + '?autoplay=1';
    } else if (cleanUrl.includes('youtu.be/')) {
      cleanUrl = cleanUrl.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1';
    }
    updatePath('showreel.videoUrl', cleanUrl);
  };

  const handleAddReel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReelTitle.trim()) return;

    const newReel = {
      id: 'r-' + Date.now(),
      title: newReelTitle.trim(),
      views: newReelViews,
      client: newReelClient,
      thumbnail: newReelThumb,
      order: reels.length + 1,
      published: true,
    };

    updatePath('reels', [...reels, newReel]);
    setNewReelTitle('');
    alert('Reel added! Click "Save Changes" to publish on the homepage.');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 font-sans">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Media &amp; Production</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Video &amp; Showreel CMS</h1>
          <p className="text-xs text-neutral-400 mt-1">Embed YouTube Showreel and upload homepage reels.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      {/* 1. YouTube Showreel */}
      <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-5 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Video className="w-4 h-4 text-[#FF6B00]" /> Watch the Work (YouTube Showreel)
        </h2>

        <div>
          <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">
            YouTube Video Link (Paste regular watch link or embed link)
          </label>
          <input
            type="text"
            value={showreel.videoUrl}
            onChange={(e) => handleYouTubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=your_video_id"
            className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Showreel Title</label>
            <input
              type="text"
              value={showreel.title}
              onChange={(e) => updatePath('showreel.title', e.target.value)}
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
          <div>
            <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Showreel Duration</label>
            <input
              type="text"
              value={showreel.duration}
              onChange={(e) => updatePath('showreel.duration', e.target.value)}
              placeholder="01:24"
              className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
            />
          </div>
        </div>
      </div>

      {/* 2. Short-Form Reels Management (সরাসরি ফাইল আপলোড অপশনসহ) */}
      <div className="p-6 rounded-3xl bg-[#0D0E12] border border-white/10 space-y-5 text-xs">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Video className="w-4 h-4 text-[#FF6B00]" /> Homepage Short-Form Reels
        </h2>

        {/* Add Reel Form */}
        <form onSubmit={handleAddReel} className="p-5 rounded-2xl bg-[#121318] border border-white/5 space-y-4">
          <span className="text-[10px] font-mono text-neutral-400 uppercase font-bold block">Add New Reel to Homepage</span>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Reel Title</label>
              <input
                type="text"
                required
                value={newReelTitle}
                onChange={(e) => setNewReelTitle(e.target.value)}
                placeholder="e.g. Viral Hook Commercial"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>
            <div>
              <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Views Count</label>
              <input
                type="text"
                value={newReelViews}
                onChange={(e) => setNewReelViews(e.target.value)}
                placeholder="Views (e.g. 250K)"
                className="w-full bg-black/60 border border-white/10 rounded-xl p-2.5 text-white"
              />
            </div>
          </div>

          {/* Upload Reel Thumbnail / Video from Computer */}
          <div className="space-y-2 pt-2 border-t border-white/5">
            <label className="block text-neutral-400 font-mono text-[10px] uppercase">Upload Reel Thumbnail or Poster</label>
            <div className="flex items-center gap-4">
              {newReelThumb && (
                <img src={newReelThumb} alt="Reel Preview" className="w-12 h-16 object-cover rounded-lg bg-neutral-900 border border-white/10" />
              )}
              <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition">
                <Upload className="w-3.5 h-3.5 text-[#FF6B00]" /> 
                {uploadingReel ? 'Uploading...' : 'Upload Reel File / Image'}
                <input 
                  type="file" 
                  accept="image/*,video/*" 
                  disabled={uploadingReel} 
                  className="hidden" 
                  onChange={handleUploadReelThumbnail} 
                />
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Add Reel to Homepage
          </button>
        </form>

        {/* Existing Reels List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {reels.map((reel, idx) => (
            <div key={reel.id} className="p-3.5 rounded-2xl bg-[#121318] border border-white/5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={reel.thumbnail} alt={reel.title} className="w-10 h-16 object-cover rounded-lg bg-neutral-900 border border-white/10" />
                <div>
                  <h4 className="text-xs font-bold text-white">{reel.title}</h4>
                  <span className="text-[10px] font-mono text-neutral-400 block">{reel.views} Views</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const next = [...reels];
                    next[idx] = { ...reel, published: !reel.published };
                    updatePath('reels', next);
                  }}
                  className={'p-1.5 rounded-lg cursor-pointer ' + (reel.published ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-500 bg-neutral-800')}
                >
                  {reel.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete reel "' + reel.title + '"?')) {
                      updatePath('reels', reels.filter(r => r.id !== reel.id));
                    }
                  }}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}