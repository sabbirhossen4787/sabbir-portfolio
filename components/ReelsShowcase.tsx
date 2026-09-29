'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export default function ReelsShowcase() {
  const { data } = useSettings();
  const reels = data.reels.filter(r => r.published).map(r => ({ title: r.title, views: r.views, img: r.thumbnail, id: r.id }));
  /* fallback keeps the section populated if older saved data has no reels */
  const visibleReels = reels.length ? reels : [
    { id: "", title: "Product Commercial", views: "125K", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500" },
    { id: "", title: "Dynamic Streetwear", views: "342K", img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500" },
    { id: "", title: "Headphone Beat Cut", views: "342K", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500" },
    { id: "", title: "Sports Car Cinema", views: "412K", img: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500" },
  ];

  return (
    /* স্ক্রোলে গভীরতা আনতে ডিপ চারকোল কালার (#0B0C10) ও হালকা অরেঞ্জ অ্যাম্বিয়েন্ট গ্লো */
    <section className="relative py-24 px-6 bg-[#0E1015] text-white border-t border-white/5 overflow-hidden">
      
      {/* Background Soft Glow */}
      <div className="absolute top-1/2 left-0 w-80 h-80 bg-[#FF6B00]/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between sm:items-end mb-12 gap-4"
        >
          <div>
            <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider font-semibold">● Short-Form Content</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
              Reels, Shorts & <span className="text-[#FF6B00]">Fast-Paced Edits</span>
            </h2>
            <p className="text-xs text-neutral-400 mt-1 max-w-md">
              Engaging short-form videos for social media, brands and creators.
            </p>
          </div>
          <Link href="/work" className="inline-flex items-center gap-2 bg-[#FF6B00] hover:bg-[#e05e00] text-black font-bold text-xs px-5 py-2.5 rounded-full transition shadow-lg shadow-[#FF6B00]/20">
            View More Reels <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {visibleReels.map((reel, i) => (
            <motion.div 
              data-editor-path={reel.id ? `reels[${data.reels.findIndex(r => r.id === reel.id)}]` : undefined} data-editor-type="card" data-editor-label={`Reel: ${reel.title}`}
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer shadow-xl hover:border-[#FF6B00]/50 transition-all duration-300"
            >
              <Image data-editor-path={reel.id ? `reels[${data.reels.findIndex(r => r.id === reel.id)}].thumbnail` : undefined} data-editor-type="image" data-editor-label={`Reel Image: ${reel.title}`} src={reel.img} alt={reel.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 p-4 flex flex-col justify-between">
                <span className="self-end text-[10px] font-mono text-white bg-black/70 px-2.5 py-0.5 rounded-full backdrop-blur-md border border-white/10">
                  ▶ {reel.views}
                </span>
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#FF6B00] text-black flex items-center justify-center shadow-md">
                    <Play className="w-3 h-3 fill-current ml-0.5" />
                  </div>
                  <p className="text-xs font-bold text-white leading-tight">{reel.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}