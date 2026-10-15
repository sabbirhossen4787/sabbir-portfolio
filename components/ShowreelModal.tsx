'use client';

import React from 'react';
import { useSettings } from '@/context/SettingsContext';

interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShowreelModal({ isOpen, onClose }: ShowreelModalProps) {
  const { data } = useSettings();
  if (!isOpen) return null;

  let videoUrl = data.showreel?.videoUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1';

  // লিংক যদি ওয়াচ লিংক হয় তবে স্বয়ংক্রিয়ভাবে এম্বেডে রূপান্তর
  if (videoUrl.includes('watch?v=')) {
    videoUrl = videoUrl.replace('watch?v=', 'embed/') + (videoUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
  } else if (videoUrl.includes('youtu.be/')) {
    videoUrl = videoUrl.replace('youtu.be/', 'www.youtube.com/embed/') + (videoUrl.includes('?') ? '&autoplay=1' : '?autoplay=1');
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-[#FF6B00] hover:text-black transition cursor-pointer"
        >
          ✕
        </button>
        <iframe 
          src={videoUrl} 
          className="w-full h-full border-0" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
          allowFullScreen 
        />
      </div>
    </div>
  );
}