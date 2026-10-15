'use client';

import React from 'react';
import { Wrench, Save, Eye, EyeOff } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function ServicesAdminPage() {
  const { data, updatePath, saveToServer, isSaving } = useSettings();

  const handleToggle = (id: string) => {
    const updated = data.services.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s);
    updatePath('services', updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Content Editor</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Services Management</h1>
          <p className="text-xs text-neutral-400 mt-1">Edit service offerings shown on the homepage.</p>
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
        {data.services.map((service, i) => (
          <div key={service.id} className="p-5 rounded-2xl bg-[#0D0E12] border border-white/10 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            <div className="flex items-center gap-3 flex-1">
              <span className="font-mono text-xs font-bold text-[#FF6B00]">{service.num}</span>
              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => {
                    const next = [...data.services];
                    next[i] = { ...service, title: e.target.value };
                    updatePath('services', next);
                  }}
                  className="bg-transparent font-bold text-sm text-white w-full focus:outline-none focus:border-b border-[#FF6B00]"
                />
                <input
                  type="text"
                  value={service.desc}
                  onChange={(e) => {
                    const next = [...data.services];
                    next[i] = { ...service, desc: e.target.value };
                    updatePath('services', next);
                  }}
                  className="bg-transparent text-xs text-neutral-400 w-full focus:outline-none"
                />
              </div>
            </div>

            <button
              onClick={() => handleToggle(service.id)}
              className={`p-2 rounded-xl transition cursor-pointer ${
                service.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-neutral-800 text-neutral-500'
              }`}
            >
              {service.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}