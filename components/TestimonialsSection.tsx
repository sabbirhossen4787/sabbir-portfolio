'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { useSettings } from '@/context/SettingsContext';

export default function TestimonialsSection() {
  const { data } = useSettings();
  const reviews = data.testimonials.filter(t => t.published);

  return (
    <section id="testimonials" className="py-24 px-6 bg-[#FAF7F2] text-neutral-900 border-t border-neutral-200">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-14"
        >
          <span className="text-xs font-mono text-[#FF6B00] font-bold uppercase tracking-wider">● Testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-neutral-950 mt-1">What Clients Say</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">Real feedback from amazing people I&apos;ve worked with.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((r, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-7 rounded-2xl bg-white border border-neutral-200/80 shadow-sm flex flex-col justify-between"
            >
              <p className="text-xs text-neutral-600 leading-relaxed italic">&ldquo;{r.quote}&rdquo;</p>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-neutral-100">
                <div data-editor-path={`testimonials[${i}].avatar`} data-editor-type="image" data-editor-label={`Client Avatar: ${r.name}`} className="w-9 h-9 rounded-full bg-neutral-200 relative overflow-hidden">
                  {r.avatar ? <Image data-editor-path={`testimonials[${i}].avatar`} data-editor-type="image" data-editor-label={`Client Avatar: ${r.name}`} src={r.avatar} alt={r.name} fill className="object-cover" /> : <div className="w-full h-full bg-neutral-200" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-neutral-900">{r.name}</p>
                  <p className="text-[10px] text-neutral-500">{r.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}