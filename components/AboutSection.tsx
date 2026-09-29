'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Globe, Upload } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function AboutSection() {
  const { data } = useSettings();
  const [viewportDevice, setViewportDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const update = () => {
      const searchParamDevice = new URLSearchParams(window.location.search).get('device') as 'desktop' | 'tablet' | 'mobile' | null;
      if (searchParamDevice) {
        setViewportDevice(searchParamDevice);
        return;
      }
      const w = window.innerWidth;
      setViewportDevice(w < 768 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const responsive = viewportDevice === 'desktop' ? {} : (data.responsiveElementOffsets?.[viewportDevice] || {});
  const offsets = { ...(data.elementOffsets || {}), ...responsive };
  
  const styleFor = (path: string): React.CSSProperties => { 
    const o = offsets[path]; 
    if (!o) return {}; 
    return { 
      transform: `translate(${o.x || 0}px, ${o.y || 0}px) scale(${o.scale || 1}) rotate(${o.rotate || 0}deg)`, 
      transformOrigin: 'center', 
      fontSize: o.fontSize ? `${o.fontSize}px` : undefined, 
      fontWeight: o.fontWeight || undefined, 
      color: o.color || undefined, 
      opacity: o.opacity ?? 1, 
      width: o.width || undefined, 
      marginTop: o.marginTop || undefined, 
      marginRight: o.marginRight || undefined, 
      marginBottom: o.marginBottom || undefined, 
      marginLeft: o.marginLeft || undefined, 
      textAlign: o.textAlign || undefined 
    }; 
  };

  const imageOffset = offsets['about.aboutImage'] || {};

  return (
    <section id="about" className="py-24 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left: About Me Photo - Frame is 100% FIXED (কোনো নড়াচড়া করবে না, ফ্রেমের বাইরে হাইড থাকবে) */}
        <div className="lg:col-span-5 relative">
          <div 
            data-editor-path="about.aboutImage" 
            data-editor-type="image" 
            data-editor-label="About Photo" 
            className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 shadow-2xl flex items-center justify-center cursor-pointer"
          >
            {data.about.aboutImage ? (
              <picture className="w-full h-full block relative overflow-hidden">
                {data.about.aboutMobileImage && <source media="(max-width: 767px)" srcSet={data.about.aboutMobileImage} />}
                {/* 
                  max-w-none ও min-w-full ব্যবহার করায় আসল ছবি পার্মানেন্ট ক্রপ হবে না,
                  শুধু ফ্রেমের বাইরের অংশ হাইড থাকবে এবং Pan X / Pan Y দিয়ে ছবির যেকোনো অংশ ফ্রেমের ভেতরে আনা যাবে 
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={data.about.aboutImage}
                  alt="Sabbir Hossen"
                  className="absolute max-w-none max-h-none pointer-events-none transition-transform duration-75 select-none"
                  style={{ 
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height: 'auto',
                    left: '50%',
                    top: '50%',
                    transform: `translate(-50%, -50%) translate(${imageOffset.x || 0}px, ${imageOffset.y || 0}px) scale(${imageOffset.scale || 1})`, 
                    transformOrigin: 'center center' 
                  }}
                />
              </picture>
            ) : (
              <div className="text-center p-6 space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto text-[#FF6B00]">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-neutral-400 text-xs font-mono font-medium">Click to upload photo from Visual Editor</p>
              </div>
            )}
            
            <div className="absolute bottom-6 left-6 bg-black/80 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl pointer-events-none">
              <p className="text-3xl font-extrabold text-white">{data.about.experienceYears}</p>
              <p className="text-xs text-neutral-400 font-mono mt-1">Years Experience</p>
            </div>
          </div>
        </div>

        {/* Right: Narrative */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span style={styleFor('about.label')} className="text-[11px] font-mono text-[#FF6B00] uppercase tracking-wider font-semibold">
              {data.about.label}
            </span>
          </div>
          <h2 style={styleFor('about.headline')} className="text-3xl sm:text-5xl font-extrabold text-white leading-tight tracking-tight">
            {data.about.headline} <span style={styleFor('about.highlightText')} className="text-[#FF6B00]">{data.about.highlightText}</span>
          </h2>
          <p style={styleFor('about.description')} className="text-sm sm:text-base text-neutral-300 leading-relaxed font-light">
            {data.about.description}
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-neutral-300 pt-2">
            <div className="flex items-center gap-2 bg-[#121318] border border-white/10 px-4 py-2.5 rounded-full">
              <MapPin className="w-3.5 h-3.5 text-[#FF6B00]" /> {data.about.locationText}
            </div>
            <div className="flex items-center gap-2 bg-[#121318] border border-white/10 px-4 py-2.5 rounded-full">
              <Globe className="w-3.5 h-3.5 text-[#FF6B00]" /> {data.about.availabilityText}
            </div>
          </div>

          <div className="pt-2">
            <Link 
              href="#contact" 
              className="inline-flex items-center gap-2 border border-[#FF6B00] text-white hover:bg-[#FF6B00] hover:text-black font-semibold text-xs px-7 py-3.5 rounded-full transition duration-300"
            >
              {data.about.btnText} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}