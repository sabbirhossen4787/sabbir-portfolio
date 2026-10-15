'use client';

import React from 'react';
import Link from 'next/link';
import { 
  FolderKanban, Sparkles, Tags, MessageSquareQuote, Plus, 
  ExternalLink, ArrowUpRight, Database, Cloud, Key, DollarSign, Monitor, ShieldCheck
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AdminDashboardPage() {
  const { data } = useSettings();

  const totalProjects = data.projects.length;
  const publishedProjects = data.projects.filter(p => p.published).length;
  const featuredProjects = data.projects.filter(p => p.featured).length;
  const behanceProjects = data.projects.filter(p => p.behanceUrl).length;
  const totalCategories = data.categories?.length || 0;
  const totalTestimonials = data.testimonials.length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold">Administration Hub</span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Portfolio &amp; CMS Overview</h1>
          <p className="text-xs text-neutral-400 mt-1">Manage content, Behance synchronizations, and page elements.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/visual-editor"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs border border-white/10 transition"
          >
            Launch Visual Editor <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/admin/projects"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs transition shadow-lg shadow-[#FF6B00]/25"
          >
            <Plus className="w-3.5 h-3.5" /> Add Project
          </Link>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Turso Database</p>
              <p className="text-[10px] text-neutral-400 font-mono">libSQL Cloud Pipeline</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Connected
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Cloudflare R2</p>
              <p className="text-[10px] text-neutral-400 font-mono">media.sabbirhossen.site</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
            Active
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Behance Sync</p>
              <p className="text-[10px] text-neutral-400 font-mono">{data.behanceSync?.lastSync || 'Ready'}</p>
            </div>
          </div>
          <Link href="/admin/behance" className="text-[10px] text-[#FF6B00] hover:underline font-mono">
            Sync Now →
          </Link>
        </div>
      </div>

      {/* SaaS Motion Pro Commercial & Licensing Operations Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0c0a1a] via-[#100d24] to-[#181135] border border-purple-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-r from-purple-600 to-violet-500 text-white flex items-center justify-center text-xs font-bold shadow-md">
              <Key className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-mono uppercase tracking-wider text-purple-300 font-bold">Commercial Licensing Engine</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Ed25519 Active</span>
          </div>
          <h2 className="text-xl font-black text-white">SaaS Motion Pro — Super Admin Operations</h2>
          <p className="text-xs text-neutral-300 max-w-xl leading-relaxed">
            Manage customer workstation seats, issue manual licenses, track real-time telemetry, and configure website pricing &amp; copy in Visual CMS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Link
            href="/admin/licensing"
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition"
          >
            <Key className="w-3.5 h-3.5" /> License Telemetry &amp; Keys
          </Link>
          <Link
            href="/admin/saas-motion-pro"
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center gap-1.5 border border-white/10 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-300" /> Motion Pro CMS
          </Link>
          <Link
            href="/saas-motion-pro"
            target="_blank"
            className="px-3.5 py-2 rounded-xl bg-black/40 hover:bg-black/60 text-neutral-300 hover:text-white font-mono text-xs flex items-center gap-1 border border-white/10 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Storefront
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Total Projects', value: totalProjects, icon: FolderKanban },
          { label: 'Published', value: publishedProjects, icon: FolderKanban },
          { label: 'Featured', value: featuredProjects, icon: ArrowUpRight },
          { label: 'Behance Synced', value: behanceProjects, icon: Sparkles },
          { label: 'Categories', value: totalCategories, icon: Tags },
          { label: 'Testimonials', value: totalTestimonials, icon: MessageSquareQuote },
        ].map((stat, i) => (
          <div key={i} className="p-4 rounded-2xl bg-[#0D0E12] border border-white/10 flex flex-col justify-between">
            <span className="text-[10px] font-mono uppercase text-neutral-500">{stat.label}</span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-black text-white">{stat.value}</span>
              <stat.icon className="w-4 h-4 text-[#FF6B00] opacity-80" />
            </div>
          </div>
        ))}
      </div>

      {/* Recent Projects Table */}
      <div className="bg-[#0D0E12] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Recent Projects</h2>
          <Link href="/admin/projects" className="text-xs text-[#FF6B00] hover:underline">
            View All ({totalProjects}) →
          </Link>
        </div>

        {data.projects.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-500 border border-dashed border-white/10 rounded-xl">
            No projects added yet. Click &quot;Add Project&quot; to create your first case study.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/10 text-neutral-500 font-mono text-[10px] uppercase">
                  <th className="pb-3">Project</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Behance</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {data.projects.slice(0, 5).map((project) => (
                  <tr key={project.id} className="hover:bg-white/5 transition">
                    <td className="py-3 font-semibold text-white flex items-center gap-3">
                      {project.coverImage && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={project.coverImage} alt={project.title} className="w-10 h-7 object-cover rounded-md bg-neutral-900 border border-white/10" />
                      )}
                      <span>{project.title}</span>
                    </td>
                    <td className="py-3 text-neutral-400">{project.category}</td>
                    <td className="py-3 text-neutral-400">{project.projectType}</td>
                    <td className="py-3">
                      {project.behanceUrl ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          Synced
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-neutral-600">Manual</span>
                      )}
                    </td>
                    <td className="py-3">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        project.published ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-neutral-800 text-neutral-500'
                      }`}>
                        {project.published ? 'Live' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href={`/work/${project.slug}`} target="_blank" className="p-1 hover:text-[#FF6B00] text-neutral-400 inline-block mr-2" title="Preview live">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <Link href={`/admin/projects`} className="text-xs font-semibold text-[#FF6B00] hover:underline">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}