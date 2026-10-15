'use client';

import React from 'react';
import { MessageSquareQuote, Save, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function TestimonialsAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();

  const handleToggle = (id: string) => {
    const updated = data.testimonials.map(t => t.id === id ? { ...t, published: !t.published } : t);
    updatePath('testimonials', updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this client review?')) {
      updatePath('testimonials', data.testimonials.filter(t => t.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Social Proof</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Client Testimonials</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage client reviews and feedback.</p>
        </div>
        <button
          onClick={() => saveToServer()}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1.5 shadow cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" /> Save Changes
        </button>
      </div>

      <div className="space-y-4">
        {data.testimonials.map((t, i) => (
          <div key={t.id} className="p-5 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <input
                  type="text"
                  value={t.name}
                  onChange={(e) => {
                    const next = [...data.testimonials];
                    next[i] = { ...t, name: e.target.value };
                    updatePath('testimonials', next);
                  }}
                  className="bg-transparent font-bold text-sm text-white focus:outline-none"
                  placeholder="Client Name"
                />
                <span className="text-neutral-500">·</span>
                <input
                  type="text"
                  value={t.role}
                  onChange={(e) => {
                    const next = [...data.testimonials];
                    next[i] = { ...t, role: e.target.value };
                    updatePath('testimonials', next);
                  }}
                  className="bg-transparent text-xs text-neutral-400 focus:outline-none"
                  placeholder="Role / Company"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggle(t.id)}
                  className={`p-1.5 rounded-lg transition cursor-pointer ${
                    t.published ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
                  }`}
                >
                  {t.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <textarea
              rows={2}
              value={t.quote}
              onChange={(e) => {
                const next = [...data.testimonials];
                next[i] = { ...t, quote: e.target.value };
                updatePath('testimonials', next);
              }}
              className="w-full bg-[#121318] border border-white/5 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#FF6B00] resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}