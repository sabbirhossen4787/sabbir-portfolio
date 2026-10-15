'use client';

import React, { useState } from 'react';
import { Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { useSettings, CategoryItem } from '@/context/SettingsContext';

export default function CategoriesPage() {
  const { data, updatePath } = useSettings();
  const [newCatName, setNewCatName] = useState('');

  const categories = data.categories || [];

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    const slug = newCatName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newCat: CategoryItem = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      slug,
      order: categories.length + 1,
      enabled: true,
    };

    updatePath('categories', [...categories, newCat]);
    setNewCatName('');
  };

  const handleToggle = (id: string) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, enabled: !c.enabled } : c));
    updatePath('categories', updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this category?')) {
      updatePath('categories', categories.filter((c) => c.id !== id));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Classification</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Category Management</h1>
        <p className="text-xs text-neutral-400 mt-1">Define categories for portfolio filtering on the public website.</p>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FF6B00]" /> Add New Category
        </h2>
        <form onSubmit={handleAdd} className="flex gap-3">
          <input
            type="text"
            required
            value={newCatName}
            onChange={(e) => setNewCatName(e.target.value)}
            placeholder="e.g. 3D Animation"
            className="flex-1 bg-[#121318] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6B00]"
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs flex items-center gap-2 cursor-pointer shadow"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-3">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono mb-4">
          Existing Categories ({categories.length})
        </h2>

        {categories.map((cat, i) => (
          <div key={cat.id} className="p-3.5 rounded-xl bg-[#121318] border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 text-center text-xs font-mono text-neutral-500">{i + 1}</span>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => {
                  const updated = [...categories];
                  updated[i] = { ...cat, name: e.target.value };
                  updatePath('categories', updated);
                }}
                className="bg-transparent text-sm font-bold text-white focus:outline-none focus:border-b border-[#FF6B00]"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleToggle(cat.id)}
                className={`p-1.5 rounded-lg transition cursor-pointer ${cat.enabled ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-500 bg-neutral-800'}`}
                title={cat.enabled ? 'Enabled' : 'Disabled'}
              >
                {cat.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}