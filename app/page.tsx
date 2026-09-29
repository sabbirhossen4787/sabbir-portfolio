'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import SelectedProjects from '@/components/SelectedProjects';
import ReelsShowcase from '@/components/ReelsShowcase';
import WatchShowreel from '@/components/WatchShowreel';
import AboutSection from '@/components/AboutSection';
import ProcessSection from '@/components/ProcessSection';
import ToolsSection from '@/components/ToolsSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import BottomCTA from '@/components/BottomCTA';
import Footer from '@/components/Footer';
import CustomSection from '@/components/CustomSection';
import MobileNav from '@/components/MobileNav';
import ShowreelModal from '@/components/ShowreelModal';
import ResponsiveEditorBridge from '@/components/ResponsiveEditorBridge';
import { useSettings } from '@/context/SettingsContext';

export default function Home() {
  const [showreelOpen, setShowreelOpen] = useState(false);
  const { data, isContentLoaded } = useSettings();
  const editorPreview = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('editorPreview') === '1';
  const editorSection = typeof window !== 'undefined' ? (new URLSearchParams(window.location.search).get('section') || 'hero') : 'hero';

  if (!isContentLoaded) {
    return (
      <main className="min-h-screen bg-[#090A0D] text-white flex items-center justify-center font-sans antialiased">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded-xl bg-[#FF6B00] flex items-center justify-center text-black font-black text-sm animate-pulse">S</div>
          <div className="text-xs text-white/50 tracking-[0.2em] uppercase">Loading</div>
        </div>
      </main>
    );
  }

  const renderSection = (id: string) => {
    switch (id) {
      case 'hero':
        return <Hero key="hero" onPlayShowreel={() => setShowreelOpen(true)} />;
      case 'services':
        return <Services key="services" />;
      case 'selectedProjects':
        return <SelectedProjects key="selectedProjects" />;
      case 'reels':
        return <ReelsShowcase key="reels" />;
      case 'showreel':
        return <WatchShowreel key="showreel" onPlay={() => setShowreelOpen(true)} />;
      case 'about':
        return <AboutSection key="about" />;
      case 'process':
        return <ProcessSection key="process" />;
      case 'tools':
        return <ToolsSection key="tools" />;
      case 'testimonials':
        return <TestimonialsSection key="testimonials" />;
      case 'cta':
        return <BottomCTA key="cta" />;
      default: {
        const custom = data.customSections?.find(s => s.id === id);
        return custom ? <CustomSection key={id} sectionId={id} /> : null;
      }
    }
  };

  // লাইভ ওয়েবসাইটের মতো হুবহু একই হেডারসহ রেন্ডার হবে
if (editorPreview) {
    return (
      <main className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
        <Navbar />
        {renderSection(editorSection)}
        {/* লাইভ সাইটের মতো একই ফ্রেমের জন্য MobileNav */}
        <MobileNav />
        <ResponsiveEditorBridge />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
      <Navbar />
      {data.homepageSections
        ?.filter((sec) => sec.enabled)
        .sort((a, b) => a.order - b.order)
        .map((sec) => renderSection(sec.id))}
      <Footer />
      <MobileNav />
      <ShowreelModal isOpen={showreelOpen} onClose={() => setShowreelOpen(false)} />
    </main>
  );
}