'use client';

import React, { useState } from 'react';
import { Sparkles, Plus, ExternalLink, Check, AlertCircle } from 'lucide-react';
import { useSettings, ProjectItem } from '@/context/SettingsContext';

export default function BehanceSyncPage() {
  const { data, updatePath, addProject } = useSettings();
  const [projectUrlInput, setProjectUrlInput] = useState('');
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleImportSingle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectUrlInput.trim()) return;

    setStatusMessage('');
    setErrorMessage('');
    setImporting(true);

    try {
      const res = await fetch('/api/behance/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: projectUrlInput.trim() }),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to parse Behance project');
      }

      const p = result.project;

      const existing = data.projects.find((item) => item.behanceUrl === p.behanceUrl);
      if (existing) {
        throw new Error(`Project is already imported into your website as "${existing.title}".`);
      }

      const cleanSlug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `behance-${Date.now()}`;

      const newProject: ProjectItem = {
        id: `behance-${Date.now()}`,
        slug: cleanSlug,
        title: p.title,
        category: 'Graphic Design',
        projectType: 'Behance Showcase',
        year: '2026',
        client: p.authorName || 'Client Work',
        coverImage: p.thumbnail || 'https://images.unsplash.com/photo-1542744094-3a31f272c490?w=800',
        shortDesc: p.description || `Behance visual campaign by ${p.authorName || 'Sabbir Hossen'}.`,
        fullDesc: p.description || '',
        featured: false,
        published: true,
        order: data.projects.length + 1,
        gallery: [],
        behanceUrl: p.behanceUrl,
        behanceEmbed: p.embedHtml || undefined,
      };

      addProject(newProject);
      updatePath('behanceSync.lastSync', new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }));
      setProjectUrlInput('');
      setStatusMessage(`Successfully imported "${newProject.title}" from Behance! Click "Save Changes" to publish live.`);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Error syncing project');
    } finally {
      setImporting(false);
    }
  };

  const syncedProjects = data.projects.filter(p => Boolean(p.behanceUrl));

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Behance-First Workflow</span>
        <h1 className="text-3xl font-extrabold text-white mt-1">Behance Portfolio Synchronization</h1>
        <p className="text-xs text-neutral-400 mt-1 max-w-xl">
          Publish your full design case studies on Behance once. Import them directly into your website without re-uploading every visual.
        </p>
      </div>

      {statusMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-medium">
          <Check className="w-4 h-4 shrink-0" /> {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0" /> {errorMessage}
        </div>
      )}

      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
          <Plus className="w-4 h-4 text-[#FF6B00]" /> Import Behance Project
        </h2>
        <form onSubmit={handleImportSingle} className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            required
            value={projectUrlInput}
            onChange={(e) => setProjectUrlInput(e.target.value)}
            placeholder="https://www.behance.net/gallery/12345678/Project-Title"
            className="flex-1 bg-[#121318] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-[#FF6B00]"
          />
          <button
            type="submit"
            disabled={importing}
            className="px-6 py-3 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs flex items-center justify-center gap-2 shrink-0 transition shadow-lg shadow-[#FF6B00]/25 disabled:opacity-50 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> {importing ? 'Importing...' : 'Sync Now'}
          </button>
        </form>
      </div>

      <div className="p-6 rounded-2xl bg-[#0D0E12] border border-white/10 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            Synced Behance Projects ({syncedProjects.length})
          </h2>
          <span className="text-[11px] font-mono text-neutral-500">
            Last sync: {data.behanceSync?.lastSync || 'Never'}
          </span>
        </div>

        {syncedProjects.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-white/10 rounded-xl">
            No Behance projects imported yet. Paste a Behance project URL above to begin.
          </div>
        ) : (
          <div className="space-y-3">
            {syncedProjects.map((p) => (
              <div key={p.id} className="p-3.5 rounded-xl bg-[#121318] border border-white/5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={p.coverImage} alt={p.title} className="w-14 h-10 object-cover rounded-lg bg-neutral-900 border border-white/10" />
                  <div>
                    <h3 className="text-xs font-bold text-white">{p.title}</h3>
                    <a href={p.behanceUrl} target="_blank" rel="noreferrer" className="text-[10px] text-neutral-500 hover:text-[#FF6B00] truncate block max-w-xs">
                      {p.behanceUrl}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <a href={`/work/${p.slug}`} target="_blank" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-300" title="View on site">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <span className="text-[10px] font-mono px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Synced
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}