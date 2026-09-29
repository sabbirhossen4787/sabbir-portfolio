'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Plus, Grid2X2, User } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();
  const sectionHref = (id: string) => pathname === '/' ? `#${id}` : `/#${id}`;

  return (
    <nav aria-label="Mobile navigation" className="md:hidden fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] left-3 right-3 z-[100] bg-[#0E1015]/95 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl shadow-black/40">
      <Link href={sectionHref("home")} className="text-white flex flex-col items-center gap-1 min-w-12"><Home className="w-4 h-4" /><span className="text-[9px] font-medium">Home</span></Link>
      <Link href="/work" className="text-neutral-400 hover:text-white flex flex-col items-center gap-1 min-w-12"><Briefcase className="w-4 h-4" /><span className="text-[9px] font-medium">Work</span></Link>
      <Link href={sectionHref("contact")} className="w-11 h-11 -mt-6 rounded-full bg-[#FF6B00] text-black flex items-center justify-center shadow-lg shadow-[#FF6B00]/30 border-4 border-[#090A0D]"><Plus className="w-5 h-5" /></Link>
      <Link href={sectionHref("services")} className="text-neutral-400 hover:text-white flex flex-col items-center gap-1 min-w-12"><Grid2X2 className="w-4 h-4" /><span className="text-[9px] font-medium">Services</span></Link>
      <Link href={sectionHref("about")} className="text-neutral-400 hover:text-white flex flex-col items-center gap-1 min-w-12"><User className="w-4 h-4" /><span className="text-[9px] font-medium">About</span></Link>
    </nav>
  );
}
