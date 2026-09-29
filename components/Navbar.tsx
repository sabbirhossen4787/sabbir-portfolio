'use client';

import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';

export default function Navbar() {
  const { data } = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isEditorPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('editorPreview') === '1';

  const links = [
    ['Home', '/'], ['About', '/#about'], ['Services', '/#services'], ['Portfolio', '/work'],
    ['Process', '/#process'], ['Testimonials', '/#testimonials'], ['Contact', '/#contact']
  ];

  const resolveHref = (href: string) => {
    if (isEditorPreview) return '#';
    if (href === '/') return '/';
    if (href.startsWith('/#') && pathname === '/') return href.slice(1);
    return href;
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0A0B0E]/92 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link href={isEditorPreview ? '#' : '/'} className="flex items-center gap-3" onClick={(e) => { if (isEditorPreview) e.preventDefault(); setOpen(false); }}>
          <div className="w-8 h-8 rounded-lg bg-[#FF6B00] flex items-center justify-center text-black font-extrabold text-lg shadow-lg shadow-[#FF6B00]/30">⚡</div>
          <span className="font-bold tracking-wider text-sm sm:text-base text-white uppercase font-mono">{data.siteSettings?.siteName || 'SABBIR HOSSEN'}</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-xs uppercase tracking-wider text-neutral-400 font-medium">
          {links.map(([label, href], i) => (
            <Link 
              key={label} 
              href={resolveHref(href)} 
              onClick={(e) => { if (isEditorPreview) e.preventDefault(); }}
              className={i === 0 ? 'text-[#FF6B00] font-semibold' : 'hover:text-white transition'}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link 
            href={resolveHref('/#contact')} 
            onClick={(e) => { if (isEditorPreview) e.preventDefault(); }}
            className="hidden sm:inline-flex items-center gap-2 border border-[#FF6B00]/60 hover:bg-[#FF6B00] text-white hover:text-black text-xs font-semibold px-5 py-2.5 rounded-full transition duration-300"
          >
            Let&apos;s Work <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button aria-label={open ? 'Close Menu' : 'Open Menu'} onClick={() => setOpen(v => !v)} className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white md:hidden">
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0A0B0E] px-4 py-4 shadow-2xl">
          <nav className="grid gap-1">
            {links.map(([label, href]) => (
              <Link 
                key={label} 
                href={resolveHref(href)} 
                onClick={(e) => { if (isEditorPreview) e.preventDefault(); setOpen(false); }} 
                className="px-4 py-3 rounded-xl text-sm text-neutral-300 hover:text-white hover:bg-white/5"
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}