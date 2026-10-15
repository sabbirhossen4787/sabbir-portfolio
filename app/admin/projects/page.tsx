'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Eye, EyeOff, Star, Trash2, ExternalLink } from 'lucide-react';
import { useSettings, ProjectItem } from '@/context/SettingsContext';

export default function ProjectsAdminPage() {
  const { data, addProject, updateProject, deleteProject } = useSettings();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPublished, setFilterPublished] = useState<'all' | 'published' | 'draft'>('all');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Graphic Design');
  const [projectType, setProjectType] = useState('Client Work');
  const [shortDesc, setShortDesc] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [behanceUrl, setBehanceUrl] = useState('');
  const [featured, setFeatured] = useState(false);
  const [published, setPublished] = useState(true);

  const openCreateModal = () => {
    setEditingProject(null);
    setTitle('');
    setCategory(data.categories?.[0]?.name || 'Graphic Design');
    setProjectType('Client Work');
    setShortDesc('');
    setCoverImage('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
    setBehanceUrl('');
    setFeatured(false);
    setPublished(true);
    setModalOpen(true);
  };

  const openEditModal = (p: ProjectItem) => {
    setEditingProject(p);
    setTitle(p.title);
    setCategory(p.category);
    setProjectType(p.projectType);
    setShortDesc(p.shortDesc);
    setCoverImage(p.coverImage);
    setBehanceUrl(p.behanceUrl || '');
    setFeatured(p.featured);
    setPublished(p.published);
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') || `project-${Date.now()}`;

    if (editingProject) {
      updateProject(editingProject.id, {
        title,
        category,
        projectType,
        shortDesc,
        coverImage,
        behanceUrl: behanceUrl || undefined,
        featured,
        published,
      });
    } else {
      const newP: ProjectItem = {
        id: `p-${Date.now()}`,
        slug: cleanSlug,
        title,
        category,
        projectType,
        year: '2026',
        coverImage,
        shortDesc,
        featured,
        published,
        order: data.projects.length + 1,
        gallery: [],
        behanceUrl: behanceUrl || undefined,
      };
      addProject(newP);
    }
    setModalOpen(false);
  };

  const filtered = data.projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filterCategory === 'all' || p.category === filterCategory;
    const matchesStatus = filterPublished === 'all' || (filterPublished === 'published' ? p.published : !p.published);
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Portfolio Management</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Projects &amp; Case Studies</h1>
          <p className="text-xs text-neutral-400 mt-1">Create, edit, feature, and synchronize projects with Behance.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs shadow-lg shadow-[#FF6B00]/25 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      <div className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-transparent text-xs text-white placeholder-neutral-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-[#121318] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Categories</option>
            {data.categories?.map((c) => (
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          <select
            value={filterPublished}
            onChange={(e) => setFilterPublished(e.target.value as any)}
            className="bg-[#121318] border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project) => (
          <div key={project.id} className="bg-[#0D0E12] border border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between group">
            <div>
              <div className="relative aspect-[16/10] bg-neutral-900 overflow-hidden">
                <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md text-white border border-white/10">
                    {project.category}
                  </span>
                  {project.behanceUrl && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/80 text-white font-bold">
                      Behance
                    </span>
                  )}
                </div>

                <div className="absolute top-2.5 right-2.5 flex gap-1">
                  <button
                    onClick={() => updateProject(project.id, { featured: !project.featured })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition cursor-pointer ${
                      project.featured ? 'bg-[#FF6B00] text-black' : 'bg-black/60 text-white hover:bg-black'
                    }`}
                    title={project.featured ? 'Featured' : 'Mark as Featured'}
                  >
                    <Star className="w-3.5 h-3.5 fill-current" />
                  </button>
                  <button
                    onClick={() => updateProject(project.id, { published: !project.published })}
                    className={`w-7 h-7 rounded-full flex items-center justify-center backdrop-blur-md transition cursor-pointer ${
                      project.published ? 'bg-emerald-500 text-white' : 'bg-black/60 text-neutral-400 hover:bg-black'
                    }`}
                    title={project.published ? 'Published' : 'Hidden'}
                  >
                    {project.published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-1.5">
                <h3 className="text-base font-bold text-white">{project.title}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{project.shortDesc}</p>
              </div>
            </div>

            <div className="p-4 pt-2 border-t border-white/5 flex items-center justify-between">
              <a href={`/work/${project.slug}`} target="_blank" className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1">
                Preview <ExternalLink className="w-3 h-3" />
              </a>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(project)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-neutral-300 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete project "${project.title}"?`)) deleteProject(project.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 transition cursor-pointer"
                  title="Delete Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0D0E12] border border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                {editingProject ? 'Edit Project' : 'New Project'}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-neutral-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Project Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cyberpunk Commercial"
                  className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  >
                    {data.categories?.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Project Type</label>
                  <input
                    type="text"
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    placeholder="Client Work / Concept"
                    className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Short Description</label>
                <textarea
                  rows={2}
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="Summary for project card"
                  className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00] resize-none"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Cover / Thumbnail URL</label>
                <input
                  type="text"
                  required
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div>
                <label className="block text-neutral-400 font-mono text-[10px] uppercase mb-1">Behance Project URL (Optional)</label>
                <input
                  type="url"
                  value={behanceUrl}
                  onChange={(e) => setBehanceUrl(e.target.value)}
                  placeholder="https://www.behance.net/gallery/..."
                  className="w-full bg-[#121318] border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#FF6B00]"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded accent-[#FF6B00]"
                  />
                  <span>Featured Project</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                    className="rounded accent-[#FF6B00]"
                  />
                  <span>Publish Live</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 font-semibold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#FF6B00] text-black font-bold text-xs hover:bg-[#e05e00] shadow cursor-pointer"
                >
                  Save Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}