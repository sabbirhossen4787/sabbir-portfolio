'use client';

import { useParams } from 'next/navigation';
import type { CSSProperties } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useSettings, ProjectBlock } from '@/context/SettingsContext';

function legacyBlocks(project: any): ProjectBlock[] {
  return (project.gallery || []).map((g: any, i: number) => ({
    id: g.id || `legacy-${i}`, type: 'image', url: g.url, content: g.caption || '',
    x: typeof g.x === 'number' ? g.x : (i % 2 ? 52 : 0), y: typeof g.y === 'number' ? g.y : Math.floor(i / 2) * 360,
    width: typeof g.width === 'number' ? g.width : (g.widthPercent || 48), height: 0,
    zIndex: g.zIndex || i + 1, rotate: g.rotate || 0, hidden: g.hidden || false
  }));
}

export default function ProjectDetailPage() {
  const params = useParams();
  const { data } = useSettings();
  const project = data.projects.find(p => p.slug === params?.slug || p.id === params?.slug);
  if (!project) return <main className="min-h-screen bg-[#090A0D] text-white grid place-items-center">Project not found.</main>;
  const blocks = project.blocks?.length ? project.blocks : legacyBlocks(project);
  const settings = project.pageSettings || { marginEnabled: true, marginTop: 64, marginRight: 24, marginBottom: 96, marginLeft: 24, canvasMinHeight: 900 };
  const maxY = blocks.reduce((m, b) => Math.max(m, b.y + (b.height || 160)), settings.canvasMinHeight);

  return <main className="min-h-screen bg-[#090A0D] text-white font-sans">
    <Navbar />
    <section className="max-w-7xl mx-auto px-6 pt-16 pb-10">
      <Link href="/work" className="inline-flex items-center gap-2 text-xs text-neutral-400 hover:text-white mb-8"><ArrowLeft className="w-4 h-4" /> Back to Portfolio</Link>
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="max-w-3xl"><span className="text-[10px] font-mono uppercase tracking-[.22em] text-[#FF6B00]">{project.category} · {project.projectType}</span><h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mt-3">{project.title}</h1><p className="text-neutral-400 text-sm sm:text-base max-w-2xl mt-5 leading-relaxed">{project.fullDesc || project.shortDesc}</p></div>
        <div className="text-xs text-neutral-500 lg:text-right space-y-1">{project.client && <p><span className="text-neutral-300">Client:</span> {project.client}</p>}{project.role && <p><span className="text-neutral-300">Role:</span> {project.role}</p>}{project.year && <p><span className="text-neutral-300">Year:</span> {project.year}</p>}</div>
      </div>
    </section>
    <section className="relative mx-auto max-w-7xl overflow-hidden border-y border-white/5 bg-[#0B0C10]" style={{marginTop:settings.marginEnabled?settings.marginTop:0,marginRight:settings.marginEnabled?settings.marginRight:0,marginBottom:settings.marginEnabled?settings.marginBottom:0,marginLeft:settings.marginEnabled?settings.marginLeft:0,minHeight:maxY}}>
      <div className="absolute inset-0 pointer-events-none opacity-[.035]" style={{backgroundImage:'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',backgroundSize:'48px 48px'}} />
      {blocks.map(block => {
        if (block.hidden) return null;

        const fontSize = Number.isFinite(Number(block.fontSize)) ? Number(block.fontSize) : undefined;
        const padding = Number.isFinite(Number(block.padding)) ? Number(block.padding) : undefined;
        const borderRadius = Number.isFinite(Number(block.borderRadius)) ? Number(block.borderRadius) : undefined;
        const style: CSSProperties = {
          position: 'absolute',
          left: `${block.x}%`,
          top: `${block.y}px`,
          width: `${block.width}%`,
          height: block.height > 0 ? `${block.height}px` : undefined,
          minHeight: block.height > 0 ? `${block.height}px` : undefined,
          zIndex: block.zIndex || 1,
          transform: `rotate(${block.rotate || 0}deg)`,
          transformOrigin: 'top left',
          padding: padding !== undefined ? `${padding}px` : undefined,
          borderRadius: borderRadius !== undefined ? `${borderRadius}px` : undefined,
          backgroundColor: block.backgroundColor || undefined,
          color: block.color || undefined,
          fontSize: fontSize !== undefined ? `${fontSize}px` : undefined,
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
          const buttonStyle: CSSProperties = {
            ...style,
            backgroundColor: 'transparent',
            padding: 0,
            minHeight: undefined,
            height: block.height > 0 ? `${block.height}px` : undefined,
          };
          const buttonInnerStyle: CSSProperties = {
            fontSize: fontSize !== undefined ? `${fontSize}px` : undefined,
            fontWeight: block.fontWeight || 700,
            color: block.color || '#000000',
            backgroundColor: block.backgroundColor || '#FF6B00',
            borderRadius: `${borderRadius !== undefined ? borderRadius : 999}px`,
            padding: `${padding !== undefined ? padding : 14}px`,
            lineHeight: 1.2,
            boxSizing: 'border-box',
          };
          return (
            <div key={block.id} style={buttonStyle}>
              <span style={buttonInnerStyle} className="inline-flex items-center gap-2 rounded-full font-bold whitespace-nowrap">
                {block.content}
                <ArrowUpRight className="w-4 h-4 shrink-0" />
              </span>
            </div>
          );
        }

        if (block.type === 'divider') {
          return <div key={block.id} style={{ ...style, height: 1, minHeight: 1, padding: 0, backgroundColor: block.backgroundColor || 'rgba(255,255,255,.12)' }} />;
        }

        if (block.type === 'spacer') {
          return <div key={block.id} style={style} />;
        }

        return (
          <p key={block.id} style={style} className="leading-relaxed m-0">
            {block.content}
          </p>
        );
      })}
    </section>
    <Footer />
  </main>;
}
