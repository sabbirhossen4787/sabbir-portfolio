'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoReels from '@/components/VideoReels';
import { useSettings } from '@/context/SettingsContext';

export default function VideoPage() {
  const { data } = useSettings();
  const showreel = data.showreel || { videoUrl: '' };

  let embedUrl = showreel.videoUrl || '';
  if (embedUrl.includes('watch?v=')) {
    embedUrl = embedUrl.replace('watch?v=', 'embed/') + '?autoplay=1';
  } else if (embedUrl.includes('youtu.be/')) {
    embedUrl = embedUrl.replace('youtu.be/', 'www.youtube.com/embed/') + '?autoplay=1';
  }

  return (
    <div className="min-h-screen bg-[#090A0D] text-white font-sans antialiased selection:bg-[#FF6B00] selection:text-black">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-16 pb-12">
        <span className="text-xs font-mono uppercase text-[#FF6B00] font-bold tracking-wider">● Video Production &amp; Cinema</span>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-2 mb-4">Video Editing &amp; Documentary Works</h1>
        <p className="text-neutral-400 max-w-2xl text-sm leading-relaxed">
          From cinematic documentaries and brand commercials to viral retention-optimized short-form reels. Mastered with Premiere Pro and After Effects.
        </p>

        {/* Master Showcase / Documentary YouTube Embed */}
        {embedUrl && (
          <div className="mt-12 rounded-3xl overflow-hidden bg-black border border-white/10 aspect-video shadow-2xl">
            <iframe
              src={embedUrl}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </div>

      {/* Short Form Reels Section */}
      <VideoReels />

      <Footer />
    </div>
  );
}