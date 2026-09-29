'use client';

import { useSettings } from '@/context/SettingsContext';
import type { CSSProperties } from 'react';

export default function CustomSection({ sectionId }: { sectionId: string }) {
  const { data } = useSettings();
  const section = data.customSections.find(s => s.id === sectionId);
  if (!section) return null;

  return (
    <section
      id={section.id}
      className="relative overflow-hidden border-t border-white/5"
      style={{ backgroundColor: section.backgroundColor || '#090A0D', minHeight: `${section.minHeight || 320}px` }}
    >
      <div className="relative max-w-7xl mx-auto min-h-[inherit] px-6 py-20">
        {(section.title || section.description) && (
          <div className="relative z-10 max-w-2xl mb-8">
            {section.title && <h2 className="text-3xl sm:text-5xl font-extrabold text-white">{section.title}</h2>}
            {section.description && <p className="mt-3 text-sm text-neutral-400">{section.description}</p>}
          </div>
        )}

        <div className="relative min-h-[220px]">
          {section.blocks.filter(b => !b.hidden).map(block => {
            const base: CSSProperties = {
              position: 'absolute', left: `${block.x}%`, top: `${block.y}px`, width: `${block.width}%`,
              zIndex: block.zIndex || 1, color: block.color || '#fff', fontSize: block.fontSize ? `${block.fontSize}px` : undefined,
              backgroundColor: block.backgroundColor, borderRadius: block.borderRadius ? `${block.borderRadius}px` : undefined,
            };
            if (block.type === 'image') {
              return <img key={block.id} src={block.content} alt="" style={base} className="max-w-full h-auto object-contain" />;
            }
            if (block.type === 'button') {
              return <a key={block.id} href="#contact" style={base} className="inline-flex items-center justify-center px-5 py-3 font-bold text-sm bg-[#FF6B00] text-black rounded-full">{block.content}</a>;
            }
            return <div key={block.id} style={base} className="whitespace-pre-line">{block.content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
