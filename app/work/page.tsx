'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { ArrowUpRight } from 'lucide-react';

export default function WorkPage() {
  const { data } = useSettings();

  return (
    <main className="min-h-screen bg-[#090A0D] text-white font-sans antialiased">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-20">
        <div className="mb-12">
          <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">● Portfolio Archive</span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-2">All Selected Work</h1>
          <p className="text-sm text-neutral-400 mt-2 max-w-xl">
            A complete collection of client campaigns, concept artwork, and short-form video projects.
          </p>
        </div>

        {data.projects.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
            <p className="text-neutral-500 text-sm">No projects published yet. Add projects from /admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.projects.map((project) => (
              <Link key={project.id} href={`/work/${project.slug}`} className="group block">
                <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 mb-4">
                  <Image src={project.coverImage} alt={project.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
                  <div className="absolute top-3 left-3">
                    <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10">
                      {project.projectType}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-black transition">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#FF6B00] transition">{project.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{project.category} {project.year ? `· ${project.year}` : ''}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}