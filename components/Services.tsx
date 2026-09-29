'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

export default function Services() {
  const { data } = useSettings();
  const meta = data.servicesMeta || { eyebrow: 'MY SERVICES', title: 'What I Can Do', highlight: 'for You', description: 'Professional visual solutions to bring your ideas to life. From design to video, I help brands stand out.', buttonText: 'View All Services', buttonUrl: '/work' };

  return (
    <section id="services" className="py-24 px-6 bg-[#FAF7F2] text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-14">
          <div>
            <span className="text-xs font-mono font-bold text-[#FF6B00] uppercase tracking-wider">
              {meta.eyebrow}
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-neutral-950 mt-2 tracking-tight">
              {meta.title} <span className="text-[#FF6B00]">{meta.highlight}</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-2 max-w-md leading-relaxed">
              {meta.description}
            </p>
          </div>
          <Link 
            href={meta.buttonUrl} 
            className="mt-4 sm:mt-0 text-xs font-bold text-neutral-800 hover:text-[#FF6B00] inline-flex items-center gap-1.5 transition"
          >
            {meta.buttonText} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {[...data.services].filter(item => item.enabled).sort((a,b) => a.order - b.order).map((item) => (
            <div
              data-editor-path={`services[${data.services.findIndex(x => x.id === item.id)}]`} data-editor-type="card" data-editor-label={`Service: ${item.title}`}
              key={item.id}
              className="bg-white border border-neutral-200/80 hover:border-[#FF6B00] rounded-2xl p-4 flex flex-col justify-between shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 group overflow-hidden"
            >
              <div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 mb-4 border border-neutral-100">
                  <Image
                    data-editor-path={`services[${data.services.findIndex(x => x.id === item.id)}].image`} data-editor-type="image" data-editor-label={`Service Image: ${item.title}`}
                    src={item.image} 
                    alt={item.title} 
                    fill 
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />
                  <span className="absolute top-2.5 left-2.5 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-white border border-white/10">
                    {item.num}
                  </span>
                </div>

                <h3 className="text-base font-bold text-neutral-900 mb-1.5 group-hover:text-[#FF6B00] transition">
                  {item.title}
                </h3>
                <p className="text-xs text-neutral-500 leading-relaxed font-normal">{item.desc}</p>
              </div>

              <div className="mt-6 flex justify-end">
                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-[#FF6B00] text-neutral-700 group-hover:text-black flex items-center justify-center transition duration-300 shadow-sm">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}