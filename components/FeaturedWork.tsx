import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight, Play } from 'lucide-react';

export default function FeaturedWork() {
  const projects = [
    {
      title: "Product Campaign",
      tag: "Graphic Design · Client Work",
      headline: "Sound That Moves You",
      image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80",
      isVideo: false,
    },
    {
      title: "Tech Product Visuals",
      tag: "Graphic Design · Concept",
      headline: "Next Gen Power",
      image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=80",
      isVideo: false,
    },
    {
      title: "Brand Campaign",
      tag: "Social Media · Client Work",
      headline: "Taste The Difference",
      image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80",
      isVideo: false,
    },
    {
      title: "Promotional Video",
      tag: "Video Editing · Concept",
      headline: "Move Beyond Limits",
      image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80",
      isVideo: true,
    },
  ];

  return (
    <section id="work" className="py-16 px-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <span className="text-xs font-mono font-semibold text-neutral-400">01</span>
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-950 mt-1">Featured Work</h2>
        </div>
        <Link href="#work" className="text-xs font-semibold text-neutral-700 hover:text-black inline-flex items-center gap-1.5 transition">
          View All Projects <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {projects.map((item, index) => (
          <div key={index} className="group cursor-pointer">
            <div className="aspect-[4/3] rounded-2xl bg-neutral-900 overflow-hidden relative border border-neutral-200">
              <Image 
                src={item.image} 
                alt={item.title} 
                fill 
                className="object-cover group-hover:scale-105 transition duration-500" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-5">
                <p className="text-white font-bold text-sm tracking-tight leading-tight uppercase">
                  {item.headline}
                </p>
              </div>
              {item.isVideo && (
                <div className="absolute bottom-3 left-3 w-7 h-7 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white">
                  <Play className="w-3 h-3 fill-current ml-0.5" />
                </div>
              )}
              <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-neutral-900 group-hover:bg-white transition">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <h3 className="font-bold text-sm text-neutral-900">{item.title}</h3>
              <p className="text-xs text-neutral-500 font-medium">{item.tag}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}