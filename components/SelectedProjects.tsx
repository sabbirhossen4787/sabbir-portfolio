'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function SelectedProjects() {
  const { data } = useSettings();
  const displayedProjects = data.projects.filter(p => p.published);

  return (
    <section id="portfolio" className="py-24 px-6 bg-[#090A0D] text-white border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-4">
          <div>
            <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">● Featured Work</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">Selected Projects</h2>
            <p className="text-xs text-neutral-400 mt-1">A curated collection of client designs and video projects.</p>
          </div>
          <Link href="/work" className="text-xs font-bold text-[#FF6B00] hover:underline flex items-center gap-1">
            View All Work ({data.projects.length}) →
          </Link>
        </div>

        {displayedProjects.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-neutral-500 text-xs">No projects added yet. Open /admin to add your first project.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {displayedProjects.map((p) => (
              <Link
                data-editor-path={`projects[${data.projects.findIndex(x => x.id === p.id)}]`} data-editor-type="card" data-editor-label={`Project: ${p.title}`}
                key={p.id}
                href={`/work/${p.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 aspect-[16/10] cursor-pointer shadow-2xl block"
              >
                <Image data-editor-path={`projects[${data.projects.findIndex(x => x.id === p.id)}].coverImage`} data-editor-type="image" data-editor-label={`Project Image: ${p.title}`} src={p.coverImage} alt={p.title} fill className="object-cover group-hover:scale-105 transition duration-700 ease-out" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[#FF6B00] uppercase">
                      {p.projectType}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">{p.category}</span>
                      <h3 className="text-xl font-bold text-white mt-1 group-hover:text-neutral-200 transition">{p.title}</h3>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-black transition duration-300">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}