'use client';

import { useSettings } from '@/context/SettingsContext';

export default function ToolsSection() {
  const { data } = useSettings();

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="mb-8">
        <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">Tools &amp; Technologies</span>
        <h2 className="text-2xl font-bold text-white mt-1">Tools I Use</h2>
        <p className="text-xs text-neutral-400 mt-1">Professional tools for professional results.</p>
      </div>

      <div className="flex flex-wrap gap-4">
        {data.tools.map((t) => (
          <div key={t.id} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-[#121318] border border-white/10 hover:border-[#FF6B00]/40 transition">
            <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-white/10 flex items-center justify-center overflow-hidden">
              {t.iconUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img data-editor-path={`tools[${data.tools.findIndex(x => x.id === t.id)}].iconUrl`} data-editor-type="image" data-editor-label={`Tool Logo: ${t.name}`} src={t.iconUrl} alt={t.name} className="w-full h-full object-contain p-1.5" />
              ) : (
                <span className="font-bold text-xs text-[#FF6B00]">{t.tag}</span>
              )}
            </div>
            <span className="text-xs font-medium text-white">{t.name}</span>
          </div>
        ))}
      </div>
    </section>
  );
}