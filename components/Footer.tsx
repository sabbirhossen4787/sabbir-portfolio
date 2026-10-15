'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSettings } from '@/context/SettingsContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const { data } = useSettings();
  const pathname = usePathname();
  const sectionHref = (id: string) => pathname === '/' ? `#${id}` : `/#${id}`;

  const info = data.personalInfo || {
    name: 'Sabbir Hossen',
    title: 'Graphic Designer & Video Editor',
    email: 'contact@sabbirhossen.site',
    phone: '01794232652',
    location: 'Bangladesh',
    website: 'sabbirhossen.site'
  };

  const social = data.socialLinks || {
    facebook: 'https://www.facebook.com/share/19ZRGTRK2V/',
    behance: 'https://www.behance.net/sisabbirahamed',
    linkedin: 'https://bd.linkedin.com/in/sabbir-hossen-60b22a212',
    instagram: '',
    youtube: '',
    whatsapp: '01629774787'
  };

  return (
    <footer className="bg-[#07080B] text-neutral-400 py-16 px-6 border-t border-white/5 text-xs font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-[#FF6B00] flex items-center justify-center text-black font-bold text-xs">⚡</div>
            <span className="font-bold text-white tracking-wider uppercase font-mono">{info.name || 'SABBIR HOSSEN'}</span>
          </div>
          <p className="text-neutral-400 text-xs leading-relaxed font-light">
            {info.title || 'Graphic Designer & Video Editor based in Bangladesh.'}
          </p>
          
          {/* Social Links Icons */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {social.facebook && (
              <a href={social.facebook} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#FF6B00] hover:text-black text-[11px] transition">
                Facebook
              </a>
            )}
            {social.behance && (
              <a href={social.behance} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#0057FF] hover:text-white text-[11px] transition">
                Behance
              </a>
            )}
            {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#0A66C2] hover:text-white text-[11px] transition">
                LinkedIn
              </a>
            )}
            {social.whatsapp && (
              <a href={'https://wa.me/' + social.whatsapp.replace(/[^0-9]/g, '')} target="_blank" rel="noreferrer" className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-[#25D366] hover:text-black text-[11px] transition">
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3 font-mono uppercase text-[11px] tracking-wider">Quick Navigation</p>
          <div className="flex flex-col space-y-2">
            <Link href={sectionHref("home")} className="hover:text-white transition">Home</Link>
            <Link href={sectionHref("about")} className="hover:text-white transition">About Me</Link>
            <Link href={sectionHref("services")} className="hover:text-white transition">Services</Link>
            <Link href="/work" className="hover:text-white transition">Portfolio Works</Link>
            <Link href={sectionHref("process")} className="hover:text-white transition">Work Process</Link>
            <Link href={sectionHref("testimonials")} className="hover:text-white transition">Testimonials</Link>
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3 font-mono uppercase text-[11px] tracking-wider">Services</p>
          <div className="flex flex-col space-y-2">
            <span>Graphic Design</span>
            <span>Video Editing</span>
            <span>Brand Identity</span>
            <span>Social Media Creatives</span>
            <span>Thumbnails Design</span>
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3 font-mono uppercase text-[11px] tracking-wider">Direct Contact</p>
          <div className="space-y-2 text-xs">
            <p className="flex items-center gap-2 text-neutral-300">
              <Mail className="w-3.5 h-3.5 text-[#FF6B00]" /> {info.email}
            </p>
            <p className="flex items-center gap-2 text-neutral-300">
              <Phone className="w-3.5 h-3.5 text-[#FF6B00]" /> {info.phone}
            </p>
            <p className="flex items-center gap-2 text-neutral-300">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" /> {info.location}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-600 gap-2">
        <p>© 2026 {info.name}. All rights reserved.</p>
        <p>Built with Next.js 16 &amp; Custom CMS</p>
      </div>
    </footer>
  );
}