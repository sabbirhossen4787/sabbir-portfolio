import Image from 'next/image';
import { ArrowUpRight } from 'lucide-react';

export default function VisualGallery() {
  const artworks = [
    {
      title: "Cyberpunk Gaming Thumbnail",
      category: "YouTube CTR Design",
      size: "col-span-1 md:col-span-2 aspect-[16/9]",
      img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&auto=format&fit=crop&q=80",
    },
    {
      title: "Minimal E-Commerce Brand Ad",
      category: "Product Creative",
      size: "col-span-1 aspect-square",
      img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Energy Drink Social Campaign",
      category: "Commercial Poster",
      size: "col-span-1 aspect-square",
      img: "https://images.unsplash.com/photo-1622543925917-763c34d1a86e?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "SaaS Dashboard Social Promo",
      category: "Figma & UI Asset",
      size: "col-span-1 aspect-square",
      img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Fitness Club Dynamic Banner",
      category: "Social Media Banner",
      size: "col-span-1 md:col-span-2 aspect-[16/9]",
      img: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-neutral-100">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
        <div>
          <span className="text-xs font-mono font-semibold text-neutral-400">03 — VISUAL ARCHIVE</span>
          <h2 className="text-3xl font-bold text-neutral-950 mt-1">Creative Artwork & Poster Showcase</h2>
          <p className="text-sm text-neutral-500 mt-2">A raw gallery of commercial social creatives, ad banners, and visual assets.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {artworks.map((item, idx) => (
          <div key={idx} className={`group relative rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-900 ${item.size}`}>
            <Image 
              src={item.img} 
              alt={item.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-500" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end">
              <div className="flex justify-between items-end">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-blue-400">{item.category}</span>
                  <h3 className="text-white text-base font-bold mt-1">{item.title}</h3>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}