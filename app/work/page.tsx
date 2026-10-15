'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Search, Sparkles, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import MobileNav from '@/components/MobileNav';
import { useSettings } from '@/context/SettingsContext';

export default function WorkPage() {
  const { data, isContentLoaded } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isContentLoaded) {
    return (
      <main className="min-h-screen bg-[#090A0D] text-white flex items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center text-black font-black text-sm animate-pulse">S</div>
          <div className="text-xs text-white/50 tracking-[0.2em] uppercase">Loading Portfolio</div>
        </div>
      </main>
    );
  }

  const allProjects = data.projects || [];
  const publishedProjects = allProjects.filter(p => p.published);
  const categories = data.categories || [];

  const filteredProjects = publishedProjects.filter(p => {
    const matchesCategory = selectedCategory === 'all' || 
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch = !searchQuery.trim() || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.shortDesc && p.shortDesc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
      <Navbar />

      <section className="py-20 px-6 max-w-7xl mx-auto">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider font-bold">● Portfolio Archive</span>
              <span className="text-neutral-500">•</span>
              <span className="text-xs font-mono text-neutral-400">{publishedProjects.length} Published Projects</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
              Selected Works &amp; Case Studies
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-xl leading-relaxed">
              Explore commercial graphic designs, video editing projects, promotional campaigns, and brand visuals.
            </p>
          </div>

          {data.socialLinks?.behance && (
            <a
              href={data.socialLinks.behance}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white text-xs font-medium border border-white/10 transition shrink-0"
            >
              <Sparkles className="w-4 h-4 text-[#FF6B00]" />
              <span>View Behance Profile</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-60" />
            </a>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-10">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/25'
                  : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
              }`}
            >
              All Works ({publishedProjects.length})
            </button>
            {categories.map((cat) => {
              const count = publishedProjects.filter(p => p.category?.toLowerCase() === cat.name.toLowerCase()).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap ${
                    selectedCategory.toLowerCase() === cat.name.toLowerCase()
                      ? 'bg-[#FF6B00] text-black shadow-lg shadow-[#FF6B00]/25'
                      : 'bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white'
                  }`}
                >
                  {cat.name} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          {/* Search Input */}
          <div className="relative sm:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-2.5" />
            <input
              type="text"
              placeholder="Search works..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-[#FF6B00] text-white text-xs outline-none placeholder-neutral-500"
            />
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-white/10 rounded-3xl">
            <p className="text-neutral-400 text-sm font-medium">No projects found in this category.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearchQuery(''); }}
              className="mt-3 text-xs text-[#FF6B00] hover:underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredProjects.map((p) => (
              <Link
                key={p.id}
                href={`/work/${p.slug}`}
                className="group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 aspect-[16/10] cursor-pointer shadow-2xl block"
              >
                <Image
                  src={p.coverImage}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-7 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-black/70 border border-white/10 text-[#FF6B00] uppercase">
                      {p.projectType || 'Commercial'}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">{p.category}</span>
                      <h3 className="text-xl font-bold text-white mt-1 group-hover:text-neutral-200 transition">{p.title}</h3>
                      {p.shortDesc && (
                        <p className="text-xs text-neutral-300 mt-1 line-clamp-1 max-w-md">{p.shortDesc}</p>
                      )}
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md text-white flex items-center justify-center group-hover:bg-[#FF6B00] group-hover:text-black transition duration-300 shrink-0 ml-4">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <Footer />
      <MobileNav />
    </main>
  );
}