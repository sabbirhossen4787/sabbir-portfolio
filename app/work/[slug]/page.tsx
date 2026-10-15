'use client';

import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight, ExternalLink } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings, ProjectBlock } from '@/context/SettingsContext';

function legacyBlocks(project: any): ProjectBlock[] {
  return (project.gallery || []).map((g: any, i: number) => ({
    id: g.id || ('legacy-' + i),
    type: 'image',
    url: g.url,
    content: g.caption || '',
    x: typeof g.x === 'number' ? g.x : (i % 2 ? 52 : 0),
    y: typeof g.y === 'number' ? g.y : Math.floor(i / 2) * 360,
    width: typeof g.width === 'number' ? g.width : (g.widthPercent || 48),
    height: 0,
    zIndex: g.zIndex || i + 1,
    rotate: g.rotate || 0,
    hidden: g.hidden || false
  }));
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { data, isContentLoaded } = useSettings();

  if (!isContentLoaded) {
    return (
      <main className="min-h-screen bg-[#090A0D] text-white flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#FF6B00] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Loading Project...</span>
        </div>
      </main>
    );
  }

  const rawSlug = String(params?.slug || '');
  const decodedSlug = decodeURIComponent(rawSlug).toLowerCase().trim();

  const project = data.projects.find(p => {
    const slugMatch = p.slug?.toLowerCase().trim() === decodedSlug;
    const idMatch = p.id?.toLowerCase().trim() === decodedSlug;
    const titleSlug = p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') === decodedSlug;
    return slugMatch || idMatch || titleSlug;
  });

  if (!project) {
    return (
      <main className="min-h-screen bg-[#090A0D] text-white flex flex-col justify-between font-sans">
        <Navbar />
        <div className="py-32 text-center space-y-4 px-4">
          <p className="text-xl font-bold text-neutral-300">Project not found or not published.</p>
          <p className="text-xs text-neutral-500">If you just synced this from Behance, make sure to click &quot;Save Changes&quot; in Admin.</p>
          <div className="pt-2">
            <Link href="/work" className="inline-flex items-center gap-2 text-xs text-[#FF6B00] hover:underline">
              <ArrowLeft className="w-4 h-4" /> Back to all projects
            </Link>
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  const blocks = project.blocks?.length ? project.blocks : legacyBlocks(project);
  const settings = project.pageSettings || {
    marginEnabled: true,
    marginTop: 64,
    marginRight: 24,
    marginBottom: 96,
    marginLeft: 24,
    canvasMinHeight: 900
  };
  const maxY = blocks.reduce((m, b) => Math.max(m, b.y + (b.height || 160)), settings.canvasMinHeight);

  // বেহ্যান্সের এম্বেড লিংক প্রস্তুতকরণ
  let behanceIframeSrc = '';
  if (project.behanceUrl) {
    const idMatch = project.behanceUrl.match(/\/gallery\/(\d+)/);
    if (idMatch && idMatch[1]) {
      behanceIframeSrc = `https://www.behance.net/embed/project/${idMatch[1]}?ilo0=1`;
    }
  }

  return (
    <main className="min-h-screen bg-[#090A0D] text-white font-sans antialiased selection:bg-[#FF6B00] selection:text-black">
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <Link href="/work" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Portfolio
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
          <div className="max-w-3xl">
            <span className="text-[10px] font-mono uppercase tracking-[.22em] text-[#FF6B00]">
              {project.category} · {project.projectType}
            </span>
            <h1 className="text-3xl sm:text-6xl font-extrabold tracking-tight mt-3">{project.title}</h1>
            <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mt-5 leading-relaxed">
              {project.fullDesc || project.shortDesc}
            </p>
          </div>

          <div className="text-xs text-neutral-500 lg:text-right space-y-1">
            {project.client && <p><span className="text-neutral-300">Client:</span> {project.client}</p>}
            {project.role && <p><span className="text-neutral-300">Role:</span> {project.role}</p>}
            {project.year && <p><span className="text-neutral-300">Year:</span> {project.year}</p>}
            {project.behanceUrl && (
              <div className="pt-2">
                <a
                  href={project.behanceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#0057FF] hover:bg-[#0047D4] text-white font-bold text-xs transition shadow-lg shadow-[#0057FF]/30"
                >
                  View Full Case Study on Behance <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Behance Official Embed Showcase */}
      {behanceIframeSrc ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
          <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-[#121318] shadow-2xl">
            <iframe
              src={behanceIframeSrc}
              height="850"
              width="100%"
              allowFullScreen
              frameBorder="0"
              allow="clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              className="w-full min-h-[850px] border-0 block bg-[#121318]"
            />
          </div>
        </section>
      ) : project.coverImage && (
        <section className="max-w-7xl mx-auto px-6 pb-20">
          <div className="w-full rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-video relative shadow-2xl">
            <Image src={project.coverImage} alt={project.title} fill className="object-cover" />
          </div>
        </section>
      )}

      {/* Custom Blocks Canvas (if available) */}
      {blocks.length > 0 && !behanceIframeSrc && (
        <section
          className="relative mx-auto max-w-7xl overflow-hidden border-y border-white/5 bg-[#0B0C10]"
          style={{
            marginTop: settings.marginEnabled ? settings.marginTop : 0,
            marginRight: settings.marginEnabled ? settings.marginRight : 0,
            marginBottom: settings.marginEnabled ? settings.marginBottom : 0,
            marginLeft: settings.marginEnabled ? settings.marginLeft : 0,
            minHeight: maxY,
          }}
        >
          <div
            className="absolute inset-0 pointer-events-none opacity-[.035]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
            }}
          />

          {blocks.map((block) => {
            if (block.hidden) return null;

            const fontSize = Number.isFinite(Number(block.fontSize)) ? Number(block.fontSize) : undefined;
            const padding = Number.isFinite(Number(block.padding)) ? Number(block.padding) : undefined;
            const borderRadius = Number.isFinite(Number(block.borderRadius)) ? Number(block.borderRadius) : undefined;

            const style: CSSProperties = {
              position: 'absolute',
              left: block.x + '%',
              top: block.y + 'px',
              width: block.width + '%',
              height: block.height > 0 ? (block.height + 'px') : undefined,
              minHeight: block.height > 0 ? (block.height + 'px') : undefined,
              zIndex: block.zIndex || 1,
              transform: 'rotate(' + (block.rotate || 0) + 'deg)',
              transformOrigin: 'top left',
              padding: padding !== undefined ? (padding + 'px') : undefined,
              borderRadius: borderRadius !== undefined ? (borderRadius + 'px') : undefined,
              backgroundColor: block.backgroundColor || undefined,
              color: block.color || undefined,
              fontSize: fontSize !== undefined ? (fontSize + 'px') : undefined,
              fontWeight: block.fontWeight || undefined,
              textAlign: block.align || 'left',
              boxSizing: 'border-box',
            };

            if (block.type === 'image' && block.url) {
              return (
                <figure key={block.id} style={style} className="overflow-hidden m-0">
                  <Image src={block.url} alt={block.content || project.title} width={1600} height={1000} className="w-full h-auto block object-cover" />
                  {block.content && <figcaption className="text-[10px] text-neutral-500 mt-2 px-1">{block.content}</figcaption>}
                </figure>
              );
            }

            if (block.type === 'heading') {
              return (
                <h2 key={block.id} style={style} className="font-extrabold tracking-tight m-0">
                  {block.content}
                </h2>
              );
            }

            if (block.type === 'button') {
              return (
                <div key={block.id} style={{ ...style, backgroundColor: 'transparent', padding: 0 }}>
                  <span style={{ fontSize, color: block.color || '#000', backgroundColor: block.backgroundColor || '#FF6B00', borderRadius: borderRadius || 999, padding: padding || 14 }} className="inline-flex items-center gap-2 font-bold">
                    {block.content} <ArrowUpRight className="w-4 h-4 shrink-0" />
                  </span>
                </div>
              );
            }

            if (block.type === 'divider') {
              return <div key={block.id} style={{ ...style, height: 1, minHeight: 1, padding: 0, backgroundColor: block.backgroundColor || 'rgba(255,255,255,.12)' }} />;
            }

            return (
              <p key={block.id} style={style} className="leading-relaxed m-0">
                {block.content}
              </p>
            );
          })}
        </section>
      )}

      <Footer />
    </main>
  );
}