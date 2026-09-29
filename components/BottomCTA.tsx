import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function BottomCTA() {
  return (
    <section id="contact" className="py-20 px-6 max-w-7xl mx-auto border-t border-white/5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#12141A] via-[#1A1814] to-[#2B1B0C] p-8 sm:p-14 border border-[#FF6B00]/30 shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div>
            <span className="text-xs font-mono text-[#FF6B00] uppercase tracking-wider">Let&apos;s Work Together</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1 mb-2">
              Have a <span className="text-[#FF6B00]">Project</span> in Mind?
            </h2>
            <p className="text-xs text-neutral-300 max-w-md leading-relaxed">
              Let&apos;s create something amazing together! I&apos;m always open to discussing new projects, ideas, or opportunities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link 
              href="mailto:sabbirhossen@email.com"
              className="inline-flex items-center gap-2 bg-[#FF6B00] text-black font-bold text-xs px-7 py-4 rounded-full hover:bg-[#e05e00] transition shadow-lg shadow-[#FF6B00]/30"
            >
              Get In Touch <ArrowRight className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2 text-[11px] text-neutral-400">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-neutral-600 border border-neutral-800 relative overflow-hidden">
                  <Image src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80" alt="Avatar" fill className="object-cover" />
                </div>
                <div className="w-6 h-6 rounded-full bg-[#FF6B00] text-black font-bold flex items-center justify-center text-[9px]">
                  +
                </div>
              </div>
              <span>Open for new projects worldwide</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}