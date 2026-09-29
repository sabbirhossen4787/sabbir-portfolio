'use client';

import { useSettings } from '@/context/SettingsContext';

export default function ProcessSection() {
  const { data } = useSettings();

  return (
    <section id="process" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-12">
        <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">How Process</span>
        <h2 className="text-3xl font-extrabold text-white mt-1">From Idea to Impact</h2>
        <p className="text-xs text-neutral-400 mt-1">A clear and simple process to bring your vision to life.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {data.process.map((st) => (
          <div key={st.id} className="p-5 rounded-2xl bg-[#121318] border border-white/5 relative">
            <span className="text-xs font-mono text-[#FF6B00] font-bold">{st.num}</span>
            <h3 className="text-base font-bold text-white mt-3 mb-1">{st.title}</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">{st.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}