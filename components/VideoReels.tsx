import { Play } from 'lucide-react';
import Image from 'next/image';

export default function VideoReels() {
  const reels = [
    { title: "Viral Hook Reel", views: "150K+", client: "Creator Brand", thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80" },
    { title: "Product Commercial Cut", views: "85K+", client: "E-Commerce", thumbnail: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop&q=80" },
    { title: "High-Energy Podcast Clip", views: "300K+", client: "Media Show", thumbnail: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80" },
    { title: "Motion Typography Short", views: "65K+", client: "Tech Startup", thumbnail: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop&q=80" },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-neutral-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs font-mono font-semibold text-neutral-400">04 — SHORT-FORM CONTENT</span>
          <h2 className="text-3xl font-bold text-neutral-950 mt-1">Reels, Shorts & Fast-Paced Edits</h2>
          <p className="text-sm text-neutral-500 mt-2">Edited using Premiere Pro & After Effects, focused on high retention and engagement.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {reels.map((reel, idx) => (
          <div key={idx} className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 cursor-pointer shadow-sm">
            <Image 
              src={reel.thumbnail} 
              alt={reel.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent p-4 flex flex-col justify-between">
              <span className="self-end text-[10px] font-mono px-2 py-0.5 rounded-full bg-black/60 text-white border border-white/10 backdrop-blur-md">
                {reel.views} Views
              </span>
              <div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mb-2 group-hover:scale-110 transition-transform">
                  <Play className="w-4 h-4 fill-white ml-0.5" />
                </div>
                <h3 className="text-white text-sm font-bold leading-tight">{reel.title}</h3>
                <p className="text-[11px] text-neutral-400 mt-1">{reel.client}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}