import { Sparkles, Layers, CheckCircle2 } from 'lucide-react';

export default function StatsStrip() {
  return (
    <section className="px-6 max-w-7xl mx-auto my-8">
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 sm:p-7 grid grid-cols-2 md:grid-cols-4 gap-6 shadow-sm">
        
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">6+</p>
            <p className="text-xs text-neutral-500 font-medium">Years Experience</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">100+</p>
            <p className="text-xs text-neutral-500 font-medium">Projects Completed</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">20+</p>
            <p className="text-xs text-neutral-500 font-medium">Happy Clients</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center font-bold">
            <span className="text-xl">∞</span>
          </div>
          <div>
            <p className="text-2xl font-bold text-neutral-900">∞</p>
            <p className="text-xs text-neutral-500 font-medium">More to Create</p>
          </div>
        </div>

      </div>
    </section>
  );
}