'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Play, Star } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

interface HeroProps {
  onPlayShowreel: () => void;
}

export default function Hero({ onPlayShowreel }: HeroProps) {
  const { data } = useSettings();
  const card = data.hero.reviewCard;
  const headline = data.hero.headlineStyle;
  const [viewportDevice, setViewportDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const isEditorPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('editorPreview') === '1';

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
  const cardOverride = viewportDevice === 'desktop' ? {} : (data.responsiveElementOffsets?.[viewportDevice]?.['hero.reviewCard.style'] || {});
  const effectiveCardStyle = { ...card.style, ...cardOverride };
  const lineOffset = offsets['hero.decorativeLine'] || {};

  const getStyle = (path: string) => {
    const o = offsets[path];
    if (!o) return {};
    if (o.hide) return { display: 'none' };
    return {
      transform: `translate(${o.x || 0}px, ${o.y || 0}px) scale(${o.scale || 1}) rotate(${o.rotate || 0}deg)`,
      transformOrigin: 'center center',
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

  const startFontSize = offsets['hero.headlineStart']?.fontSize || headline.fontSize;
  const accentFontSize = offsets['hero.headlineAccent']?.fontSize || headline.fontSize;

  const getTextNodeStyle = (path: string, base: CSSProperties = {}) => {
    const o = offsets[path] || {};
    return {
      ...base,
      ...(o.fontSize ? { fontSize: `${o.fontSize}px` } : {}),
      ...(o.fontWeight ? { fontWeight: o.fontWeight as CSSProperties['fontWeight'] } : {}),
      ...(o.color ? { color: o.color } : {})
    };
  };

  return (
    <section 
      id="home" 
      data-editor-section="hero" 
      className="relative bg-[#090A0D] min-h-[calc(100vh-5rem)] flex flex-col justify-between overflow-x-clip pt-4 md:pt-6 pb-6"
    >
      {/* Background Image: Frame is 100% FIXED (কোনো নড়াচড়া করবে না) */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* ১. Desktop/Web Banner (>= 1024px): আলাদা ইমেজ + নিজস্ব ক্রপ/স্কেল/প্যানিং */}
        <div className="hidden lg:block absolute inset-0 overflow-hidden">
          {data.hero.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.hero.heroImage}
              alt="Desktop Hero Background"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'right top',
                transform: `translate(${data.hero.heroImageX || 0}px, ${data.hero.heroImageY || 0}px) scale(${(data.hero.heroImageScale || 100) / 100})`,
                transformOrigin: 'center center',
              }}
              className="w-full h-full object-cover opacity-95 transition-transform duration-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090A0D] via-[#14151B] to-[#25180F]" />
          )}
        </div>

        {/* ২. Tablet Banner (768px - 1023px): সেন্টারে সুন্দরভাবে অটো-ফিট */}
        <div className="hidden md:block lg:hidden absolute inset-0 overflow-hidden">
          {data.hero.heroImage || data.hero.mobileHeroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.hero.heroImage || data.hero.mobileHeroImage}
              alt="Tablet Hero Background"
              className="w-full h-full object-cover object-center opacity-95"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090A0D] via-[#14151B] to-[#25180F]" />
          )}
        </div>

       {/* ৩. Mobile Banner (< 768px): আলাদা মোবাইল ব্যানার + উপর থেকে পারফেক্ট ক্রপ/ফিট */}
        <div className="block md:hidden absolute inset-0 overflow-hidden pointer-events-none">
          {data.hero.mobileHeroImage || data.hero.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={data.hero.mobileHeroImage || data.hero.heroImage}
              alt="Mobile Hero Background"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center top',
                transform: `translate(${data.hero.mobileHeroImageX || 0}px, ${data.hero.mobileHeroImageY || 0}px) scale(${(data.hero.mobileHeroImageScale || 100) / 100})`,
                transformOrigin: 'center top',
              }}
              className="w-full h-full object-cover opacity-95 transition-transform duration-75"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-tr from-[#090A0D] via-[#14151B] to-[#25180F]" />
          )}
        </div>

        {/* Desktop Left-to-Right Gradient */}
        <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#090A0D] via-[#090A0D]/75 to-transparent w-full md:w-3/5 z-0 pointer-events-none" />

        {/* Mobile Bottom-to-Top Gradient */}
        <div className="block md:hidden absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-[#090A0D] via-[#090A0D]/80 via-45% to-transparent z-0 pointer-events-none" />
      </div>

      {/* Hero Content Grid */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-6 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center my-auto pt-44 sm:pt-48 md:pt-0">
        
        {/* ALL CONTENT GROUP: পুরো টেক্সট ও বাটন ব্লক একসাথে সিলেক্ট ও মুভ করার মাদার র‍্যাপার */}
        <div 
          data-editor-path="hero.contentGroup"
          data-editor-type="card"
          data-editor-label="All Content Group (সব একসাথে)"
          style={getStyle('hero.contentGroup')}
          className="lg:col-span-7 space-y-3.5 sm:space-y-4 md:space-y-5"
        >
          
          {/* Availability Badge */}
          <div data-editor-path="hero.availabilityText" data-editor-type="text" data-editor-label="Availability Badge" style={getStyle('hero.availabilityText')} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#FF6B00]"></span>
            <span style={getTextNodeStyle('hero.availabilityText')} className="text-[11px] font-mono tracking-wider text-neutral-300">
              {data.hero.availabilityText}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-1"></span>
          </div>

          {/* Independent Headlines */}
          <div className="space-y-1">
            <div data-editor-path="hero.headlineStart" data-editor-type="text" data-editor-label="Headline Prefix" style={getStyle('hero.headlineStart')}>
              <h1 
                style={getTextNodeStyle('hero.headlineStart', { 
                  fontSize: `clamp(2.2rem, 5vw, ${startFontSize}px)`, 
                  color: headline.color,
                  lineHeight: headline.lineHeight 
                })}
                className="font-extrabold tracking-tight whitespace-pre-line leading-none"
              >
                {data.hero.headlineStart}
              </h1>
            </div>

            <div data-editor-path="hero.headlineAccent" data-editor-type="text" data-editor-label="Accent Headline" style={getStyle('hero.headlineAccent')}>
              <span 
                style={getTextNodeStyle('hero.headlineAccent', { 
                  fontSize: `clamp(2.2rem, 5vw, ${accentFontSize}px)`,
                  color: headline.accentColor 
                })}
                className="font-extrabold tracking-tight block leading-tight"
              >
                {data.hero.headlineAccent}
              </span>
            </div>
          </div>

          {/* Subheadline */}
          <div data-editor-path="hero.subheadline" data-editor-type="text" data-editor-label="Subheadline" style={getStyle('hero.subheadline')}>
            <p style={getTextNodeStyle('hero.subheadline')} className="text-neutral-300 text-xs sm:text-sm md:text-base max-w-md leading-relaxed font-light">
              {data.hero.subheadline}
            </p>
          </div>

          {/* Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div data-editor-path="hero.primaryBtnText" data-editor-type="button" data-editor-label="Primary Button" style={getStyle('hero.primaryBtnText')}>
              <Link href="/work" style={getTextNodeStyle('hero.primaryBtnText')} className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs px-5 py-2.5 sm:px-6 sm:py-3 rounded-full transition shadow-lg shadow-[#FF6B00]/30 whitespace-nowrap">
                {data.hero.primaryBtnText} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div data-editor-path="hero.secondaryBtnText" data-editor-type="button" data-editor-label="Secondary Button" style={getStyle('hero.secondaryBtnText')}>
              <button onClick={onPlayShowreel} style={getTextNodeStyle('hero.secondaryBtnText')} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 text-white font-medium text-xs px-4 py-2.5 sm:px-5 sm:py-3 rounded-full border border-white/15 backdrop-blur-md transition whitespace-nowrap">
                <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center"><Play className="w-2 h-2 fill-current ml-0.5" /></div>
                {data.hero.secondaryBtnText} <span className="text-[10px] text-neutral-400">1 min</span>
              </button>
            </div>
          </div>

          {/* হালকা লাইন সেপারেটর */}
          <div 
            data-editor-path="hero.dividerLine" 
            data-editor-type="card" 
            data-editor-label="Divider Line Shape (হালকা লাইন)"
            style={getStyle('hero.dividerLine')}
            className="py-2 -my-1 cursor-pointer max-w-md"
          >
            <div 
              style={{
                backgroundColor: offsets['hero.dividerLine']?.color || 'rgba(255, 255, 255, 0.12)',
                height: `${offsets['hero.dividerLine']?.fontSize || 1}px`,
                opacity: offsets['hero.dividerLine']?.opacity ?? 1,
              }}
              className="w-full" 
            />
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 max-w-md pt-1">
            <div data-editor-path="hero.experienceYears" data-editor-type="stat" data-editor-label="Experience" style={getStyle('hero.experienceYears')}>
              <p style={getTextNodeStyle('hero.experienceYears')} className="text-lg sm:text-2xl font-bold text-white">{data.hero.experienceYears}</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">Years Experience</p>
            </div>
            <div data-editor-path="hero.completedProjects" data-editor-type="stat" data-editor-label="Projects" style={getStyle('hero.completedProjects')}>
              <p style={getTextNodeStyle('hero.completedProjects')} className="text-lg sm:text-2xl font-bold text-white">{data.hero.completedProjects}</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">Projects Completed</p>
            </div>
            <div data-editor-path="hero.happyClients" data-editor-type="stat" data-editor-label="Clients" style={getStyle('hero.happyClients')}>
              <p style={getTextNodeStyle('hero.happyClients')} className="text-lg sm:text-2xl font-bold text-white">{data.hero.happyClients}</p>
              <p className="text-[10px] sm:text-[11px] text-neutral-400">Happy Clients</p>
            </div>
          </div>
        </div>

        {/* Review Card */}
        <div className="lg:col-span-5 relative flex justify-center items-center pointer-events-none min-h-0 lg:min-h-[260px]">
          {card.show && (
            <div className={`contents ${data.hero.mobileReviewCardShow ? '' : 'max-md:hidden'}`}>
              <div 
                data-editor-path="hero.reviewCard.style" 
                data-editor-type="card" 
                data-editor-label="Review Card"
                style={{
                  transform: `translate(${effectiveCardStyle.x}px, ${effectiveCardStyle.y}px) scale(${effectiveCardStyle.scale}) rotate(${effectiveCardStyle.rotate}deg)`,
                  width: typeof effectiveCardStyle.width === 'number' ? `${effectiveCardStyle.width}px` : effectiveCardStyle.width,
                  backgroundColor: effectiveCardStyle.backgroundColor,
                  borderRadius: `${effectiveCardStyle.borderRadius}px`,
                  padding: `${effectiveCardStyle.padding}px`,
                  opacity: effectiveCardStyle.opacity,
                  transition: 'transform 0.05s ease-out'
                }}
                className="w-full max-w-none backdrop-blur-xl border border-white/15 shadow-2xl pointer-events-auto hover:border-[#FF6B00]/40 origin-center"
              >
                <span className="text-[#FF6B00] text-xl font-serif leading-none block">“</span>
                <p 
                  style={{ fontSize: `${effectiveCardStyle.fontSize}px`, color: effectiveCardStyle.color }} 
                  className="leading-relaxed font-light mt-1"
                >
                  {card.text}
                </p>
                <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-white/10">
                  <div>
                    <p className="text-[10px] font-bold text-white leading-tight">{card.clientName}</p>
                    <p className="text-[8px] text-neutral-400">{card.clientRole}</p>
                  </div>
                  <div className="flex text-[9px] gap-0.5" style={{ color: card.style.accentColor || '#FF6B00' }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Brands Strip: এক লাইনে স্লিম ও চিকন */}
      {data.hero.brands && (
        <div 
          data-editor-path="hero.brands" 
          data-editor-type="card" 
          data-editor-label="Brands & Clients" 
          style={getStyle('hero.brands')} 
          className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 mt-2 pb-1"
        >
          <div className="bg-[#0E1015]/90 backdrop-blur-md border border-white/10 rounded-full py-1.5 sm:py-2.5 px-3.5 sm:px-6 flex items-center justify-between gap-3 shadow-xl overflow-hidden">
            <span className="font-mono text-[7.5px] sm:text-[9px] tracking-widest uppercase text-neutral-400 font-semibold whitespace-nowrap shrink-0">
              BRANDS &amp; CLIENTS
            </span>
            
            <div className="flex items-center gap-3 sm:gap-5 font-bold text-neutral-300 tracking-wider text-[9px] sm:text-xs overflow-x-auto scrollbar-none py-0.5">
              {data.hero.brands.map((b: any, i: number) => {
                const isObj = typeof b === 'object' && b !== null;
                const name = isObj ? b.name : b;
                const logoUrl = isObj ? b.logoUrl : null;

                return (
                  <span key={i} className="whitespace-nowrap shrink-0 flex items-center gap-1.5 hover:text-white transition">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={name || 'Brand logo'} className="h-3.5 sm:h-4 w-auto object-contain opacity-85 hover:opacity-100 transition" />
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

      {/* White Decorative Line */}
      {data.hero.decorativeLine?.show && !lineOffset.hide && (
        <div 
          data-editor-path="hero.decorativeLine" 
          data-editor-type="card" 
          data-editor-label="Hero White Line" 
          className="absolute z-20 py-2 -my-2 pointer-events-auto cursor-pointer" 
          style={{ 
            left: `${lineOffset.x || 0}px`, 
            bottom: `${-(lineOffset.y || 0)}px`, 
            width: `${data.hero.decorativeLine.width || 100}%`, 
            opacity: lineOffset.opacity ?? data.hero.decorativeLine.opacity ?? 0.7, 
            transform: `scale(${lineOffset.scale || 1}) rotate(${lineOffset.rotate || 0}deg)`, 
            transformOrigin: 'center center' 
          }} 
        >
          <div 
            style={{
              height: `${data.hero.decorativeLine.height || 1}px`,
              backgroundColor: lineOffset.color || '#FFFFFF',
            }}
            className="w-full bg-white"
          />
        </div>
      )}
    </section>
  );
}