import Image from 'next/image';
import { useSettings } from '@/context/SettingsContext';
import { Play } from 'lucide-react';

interface WatchShowreelProps {
  onPlay: () => void;
}

export default function WatchShowreel({ onPlay }: WatchShowreelProps) {
  const { data } = useSettings();
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-4 space-y-4">
          <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">Showreel</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Watch <br /><span className="text-[#FF6B00]">the Work</span>
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            A quick look at my editing style, visual quality and creative approach.
          </p>
          <button 
            onClick={onPlay}
            className="inline-flex items-center gap-2 bg-[#FF6B00] text-black font-bold text-xs px-6 py-3 rounded-full hover:bg-[#e05e00] transition"
          >
            Watch Showreel →
          </button>
        </div>

        <div className="lg:col-span-8">
          <div
            data-editor-path="showreel.thumbnail" data-editor-type="image" data-editor-label="Showreel Thumbnail"
            onClick={onPlay}
            className="relative aspect-video rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 group cursor-pointer shadow-2xl"
          >
            <Image 
              data-editor-path="showreel.thumbnail" data-editor-type="image" data-editor-label="Showreel Thumbnail"
              src={data.showreel.thumbnail || "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200"} 
              alt="Showreel Preview" 
              fill 
              className="object-cover group-hover:scale-105 transition duration-500 opacity-80" 
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-[#FF6B00] text-black flex items-center justify-center shadow-lg shadow-[#FF6B00]/40 group-hover:scale-110 transition">
                <Play className="w-6 h-6 fill-current ml-1" />
              </div>
            </div>
            <div className="absolute bottom-4 left-6 right-6 flex justify-between text-xs text-neutral-300 font-mono">
              <span>Showreel · Edit · Design · Create</span>
              <span>01:24</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}