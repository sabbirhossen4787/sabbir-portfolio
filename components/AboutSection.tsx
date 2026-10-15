'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Globe } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AboutSection() {
  const { data } = useSettings();
  const about = data.about;

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5 font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: About Photo — মাথা কখনোই কাটবে না */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center">
            {about.aboutImage ? (
              <picture className="w-full h-full block relative overflow-hidden">
                {about.aboutMobileImage && (
                  <source media="(max-width: 767px)" srcSet={about.aboutMobileImage} />
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={about.aboutImage}
                  alt="Sabbir Hossen"
                  className="w-full h-full object-cover object-top select-none"
                />
              </picture>
            ) : (
              <div className="text-center p-6 text-neutral-500 text-xs font-mono">
                No About image uploaded.
              </div>
            )}
            
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl pointer-events-none">
              <p className="text-3xl font-extrabold text-white">{about.experienceYears || '6+'}</p>
              <p className="text-xs text-neutral-400 font-mono mt-1">Years Experience</p>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="text-[11px] font-mono text-[#FF6B00] uppercase tracking-wider font-semibold">
              {about.label || '● About Me'}
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {about.headline || 'A designer who cares about how the work '} 
            <span className="text-[#FF6B00]">{about.highlightText || 'actually works.'}</span>
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            {about.description || "I'm Sabbir Hossen, a Graphic Designer and Video Editor based in Bangladesh. I help brands turn their ideas into powerful visuals that attract, engage, and deliver real results."}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-neutral-300 pt-2">
            <div className="flex items-center gap-2 bg-[#121318] border border-white/10 px-4 py-2.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" /> {about.locationText || 'Based in Bangladesh'}
            </div>
            <div className="flex items-center gap-2 bg-[#121318] border border-white/10 px-4 py-2.5 rounded-full">
              <Globe className="w-3.5 h-3.5 text-[#FF6B00]" /> {about.availabilityText || 'Available Worldwide'}
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href="#contact" 
              className="inline-flex items-center gap-2 border border-[#FF6B00] text-white hover:bg-[#FF6B00] hover:text-black font-semibold text-xs px-7 py-3.5 rounded-full transition duration-300"
            >
              {about.btnText || 'More About Me'} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}