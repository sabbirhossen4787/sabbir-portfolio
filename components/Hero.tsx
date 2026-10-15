'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface HeroProps {
  onPlayShowreel: () => void;
}

export default function Hero({ onPlayShowreel }: HeroProps) {
  const { data } = useSettings();
  const hero = data.hero;

  return (
    <section 
      id="home" 
      className="relative bg-[#090A0D] min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-x-hidden pt-2 md:pt-4 pb-2 w-full"
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Desktop Background */}
        <div className="hidden md:block absolute inset-0 overflow-hidden">
          {hero.heroImage ? (
            <img
              src={hero.heroImage}
              alt="Desktop Hero Background"
              className="w-full h-full object-cover object-right-top opacity-95"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090A0D] via-[#14151B] to-[#25180F]" />
          )}
        </div>

        {/* Mobile Background */}
        <div className="block md:hidden absolute inset-0 overflow-hidden pointer-events-none">
          {hero.mobileHeroImage || hero.heroImage ? (
            <img
              src={hero.mobileHeroImage || hero.heroImage}
              alt="Mobile Hero Background"
              className="w-full h-full object-cover object-top opacity-95"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090A0D] via-[#14151B] to-[#25180F]" />
          )}
        </div>

        {/* Dark Gradients */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#090A0D] via-[#090A0D]/75 to-transparent w-full md:w-3/5 z-0 pointer-events-none" />
        <div className="block md:hidden absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#090A0D] via-[#090A0D]/95 via-45% to-transparent z-0 pointer-events-none" />
      </div>

      {/* Main Content: মোবাইলে হালকা আরেকটু নিচে বুক থেকে শুরু */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-[370px] xs:pt-[390px] sm:pt-[415px] md:pt-10 lg:pt-0 my-auto">
        
        {/* Left Column: Text & Buttons */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-3.5 md:space-y-4">
          
          {/* Availability Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
            <span className="text-[11px] font-mono tracking-wider text-neutral-300">
              {hero.availabilityText || 'Available for new projects'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          </div>

          {/* Headlines */}
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white whitespace-pre-line leading-none">
              {hero.headlineStart || 'Visual &\nDesigner'}
            </h1>
            <span className="text-3xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight block leading-tight text-[#FF6B00]">
              {hero.headlineAccent || 'Video Editor'}
            </span>
          </div>

          {/* Subheadline */}
          <p className="text-neutral-300 text-xs sm:text-sm md:text-base max-w-md leading-relaxed font-light">
            {hero.subheadline || 'I create visual content that helps brands communicate, promote, and grow.'}
          </p>

          {/* Action Buttons: মোবাইলেও পাশাপাশি থাকবে */}
          <div className="flex flex-row items-center gap-2 sm:gap-3 pt-1 flex-nowrap w-full">
            <Link 
              href="/work" 
              className="inline-flex items-center justify-center gap-1.5 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-[11px] sm:text-xs px-3.5 py-2.5 sm:px-6 sm:py-3.5 rounded-full transition shadow-lg shadow-[#FF6B00]/30 whitespace-nowrap shrink-0"
            >
              {hero.primaryBtnText || 'View My Work'} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            
            <button 
              onClick={onPlayShowreel} 
              className="inline-flex items-center justify-center gap-1.5 bg-white/10 hover:bg-white/15 text-white font-medium text-[11px] sm:text-xs px-3 py-2.5 sm:px-5 sm:py-3.5 rounded-full border border-white/15 backdrop-blur-md transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white text-black flex items-center justify-center shrink-0">
                <Play className="w-2 h-2 fill-current ml-0.5" />
              </div>
              {hero.secondaryBtnText || 'Watch Showreel'} <span className="text-[9px] text-neutral-400 hidden xs:inline">1 min</span>
            </button>
          </div>

          {/* Divider Line */}
          <div className="py-1.5 max-w-md">
            <div className="w-full h-[1px] bg-white/15" />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md pt-0.5">
            <div>
              <p className="text-base sm:text-2xl font-bold text-white">{hero.experienceYears || '6+'}</p>
              <p className="text-[9px] sm:text-[11px] text-neutral-400">Years Experience</p>
            </div>
            <div>
              <p className="text-base sm:text-2xl font-bold text-white">{hero.completedProjects || '100+'}</p>
              <p className="text-[9px] sm:text-[11px] text-neutral-400">Projects Completed</p>
            </div>
            <div>
              <p className="text-base sm:text-2xl font-bold text-white">{hero.happyClients || '20+'}</p>
              <p className="text-[9px] sm:text-[11px] text-neutral-400">Happy Clients</p>
            </div>
          </div>
        </div>

        {/* Right Column: Spacer (কার্ড বাদ দেওয়ায় ডানপাশের ছবি ও ব্যানার ১০০% পরিষ্কার থাকবে) */}
        <div className="hidden lg:block lg:col-span-5 pointer-events-none" />
      </div>

      {/* Brands Strip Footer */}
      {hero.brands && hero.brands.length > 0 && (
        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 mt-3 pb-1">
          <div className="bg-[#0E1015]/90 backdrop-blur-md border border-white/10 rounded-full py-1.5 sm:py-2 px-3.5 sm:px-6 flex items-center justify-between gap-3 shadow-xl overflow-hidden">
            <span className="font-mono text-[7.5px] sm:text-[9px] tracking-widest uppercase text-neutral-400 font-semibold whitespace-nowrap shrink-0">
              BRANDS &amp; CLIENTS
            </span>
            <div className="flex items-center gap-3 sm:gap-5 font-bold text-neutral-300 tracking-wider text-[9px] sm:text-xs overflow-x-auto scrollbar-none py-0.5">
              {hero.brands.map((b: any, i: number) => {
                const isObj = typeof b === 'object' && b !== null;
                const name = isObj ? b.name : b;
                const logoUrl = isObj ? b.logoUrl : null;
                return (
                  <span key={i} className="whitespace-nowrap shrink-0 flex items-center gap-1.5 opacity-85 hover:opacity-100 transition">
                    {logoUrl ? (
                      <img src={logoUrl} alt={name} className="h-3.5 sm:h-4 w-auto object-contain" />
                    ) : (
                      <span>{name}</span>
                    )}
                  </span>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}