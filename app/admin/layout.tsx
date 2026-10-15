'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, FolderKanban, Tags, Wrench, MessageSquareQuote, 
  User, Contact, Share2, Image as ImageIcon, Search, Settings, 
  Sparkles, ExternalLink, LogOut, Menu, X, Save, Video, Layers, Key
} from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  external?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isSaving, saveStatus, saveToServer } = useSettings();

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    if (confirm('Are you sure you want to sign out?')) {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    }
  };

  const navGroups: NavGroup[] = [
    {
      group: 'CONTENT',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
        { label: 'Hero Content', href: '/admin/hero', icon: Sparkles },
        { label: 'Videos & Showreel', href: '/admin/videos', icon: Video },
        { label: 'Projects', href: '/admin/projects', icon: FolderKanban },
        { label: 'Categories', href: '/admin/categories', icon: Tags },
        { label: 'Services', href: '/admin/services', icon: Wrench },
        { label: 'Testimonials', href: '/admin/testimonials', icon: MessageSquareQuote },
      ],
    },
    {
      group: 'PAGES & SECTIONS',
      items: [
        { label: 'Visual Live CMS Studio', href: '/admin/visual-editor', icon: ExternalLink },
        { label: 'Sections Manager', href: '/admin/sections', icon: Layers },
      ],
    },
    {
      group: 'PROFILE',
      items: [
        { label: 'About Me', href: '/admin/about', icon: User },
        { label: 'Personal Info', href: '/admin/personal', icon: Contact },
        { label: 'Social Links', href: '/admin/social', icon: Share2 },
      ],
    },
    {
      group: 'MEDIA',
      items: [
        { label: 'Media Library', href: '/admin/media', icon: ImageIcon },
      ],
    },
    {
      group: 'WEBSITE',
      items: [
        { label: 'SEO Settings', href: '/admin/seo', icon: Search },
        { label: 'Site Settings', href: '/admin/settings', icon: Settings },
        { label: 'Behance Sync', href: '/admin/behance', icon: Sparkles },
      ],
    },
    {
      group: 'COMMERCE',
      items: [
        { label: 'SaaS Motion Pro Licenses', href: '/admin/licensing', icon: Key },
        { label: 'SaaS Motion Pro CMS', href: '/admin/saas-motion-pro', icon: Sparkles },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#090A0D] text-white flex flex-col md:flex-row font-sans selection:bg-[#FF6B00] selection:text-black">
      <header className="md:hidden h-14 bg-[#0D0E12] border-b border-white/10 px-4 flex items-center justify-between z-40 sticky top-0">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FF6B00] text-black font-extrabold text-sm flex items-center justify-center">⚡</div>
          <span className="font-bold text-xs uppercase tracking-wider">CMS Hub</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={() => saveToServer()}
            disabled={isSaving}
            className="p-1.5 px-3 rounded-lg bg-[#FF6B00] text-black font-bold text-xs flex items-center gap-1"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-neutral-400 hover:text-white">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      <aside
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-[#0D0E12] border-r border-white/10 flex flex-col justify-between z-50 transition-transform duration-200 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 flex-1 overflow-y-auto scrollbar-none">
          <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FF6B00] text-black font-extrabold text-base flex items-center justify-center shadow-lg shadow-[#FF6B00]/30">⚡</div>
              <div>
                <span className="font-bold text-sm tracking-wide block uppercase font-mono">Sabbir CMS</span>
                <span className="text-[10px] text-neutral-500 font-mono">Next.js 16 Production</span>
              </div>
            </Link>
            <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-neutral-400">✕</button>
          </div>

          <nav className="space-y-6">
            {navGroups.map((grp) => (
              <div key={grp.group}>
                <span className="text-[10px] font-mono uppercase text-neutral-500 font-semibold tracking-wider block mb-2 px-2">
                  {grp.group}
                </span>
                <div className="space-y-1">
                  {grp.items.map((item) => {
                    const active = pathname === item.href;
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition ${
                          active
                            ? 'bg-[#FF6B00] text-black font-bold shadow-md shadow-[#FF6B00]/20'
                            : 'text-neutral-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                        {item.external && <ExternalLink className="w-3 h-3 ml-auto opacity-70" />}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40 space-y-3">
          {saveStatus && (
            <div className="text-[10px] font-mono text-[#FF6B00] truncate animate-pulse">
              ● {saveStatus}
            </div>
          )}
          <button
            onClick={() => saveToServer()}
            disabled={isSaving}
            className="w-full py-2.5 rounded-xl bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs flex items-center justify-center gap-1.5 transition shadow cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save Changes'}
          </button>

          <div className="flex items-center justify-between pt-2 border-t border-white/5">
            <Link href="/" target="_blank" className="text-[11px] text-neutral-400 hover:text-white flex items-center gap-1">
              Live Site <ExternalLink className="w-3 h-3" />
            </Link>
            <button onClick={handleLogout} className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 cursor-pointer">
              <LogOut className="w-3 h-3" /> Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 w-full min-h-screen overflow-x-hidden p-5 sm:p-8 md:p-10">
        {children}
      </main>
    </div>
  );
}