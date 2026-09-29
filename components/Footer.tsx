import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const sectionHref = (id: string) => pathname === '/' ? `#${id}` : `/#${id}`;

  return (
    <footer className="bg-[#07080B] text-neutral-400 py-16 px-6 border-t border-white/5 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded bg-[#FF6B00] flex items-center justify-center text-black font-bold text-xs">⚡</div>
            <span className="font-bold text-white tracking-wider">SABBIR HOSSEN</span>
          </div>
          <p className="text-neutral-500 text-[11px] leading-relaxed">
            Graphics Designer & Video Editor based in Bangladesh.
          </p>
        </div>

        <div>
          <p className="text-white font-bold mb-3">Quick Links</p>
          <div className="flex flex-col space-y-2">
            <Link href={sectionHref("home")} className="hover:text-white">Home</Link>
            <Link href={sectionHref("about")} className="hover:text-white">About</Link>
            <Link href={sectionHref("services")} className="hover:text-white">Services</Link>
            <Link href="/work" className="hover:text-white">Portfolio</Link>
            <Link href={sectionHref("process")} className="hover:text-white">Process</Link>
            <Link href={sectionHref("testimonials")} className="hover:text-white">Testimonials</Link>
            <Link href={sectionHref("contact")} className="hover:text-white">Contact</Link>
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3">My Services</p>
          <div className="flex flex-col space-y-2">
            <span>Graphic Design</span>
            <span>Video Editing</span>
            <span>Brand Identity</span>
            <span>Social Media Design</span>
          </div>
        </div>

        <div>
          <p className="text-white font-bold mb-3">Contact Info</p>
          <div className="space-y-2 text-[11px]">
            <p>✉ sabbirhossen@email.com</p>
            <p>📞 +880 1234 567890</p>
            <p>📍 Dhaka, Bangladesh</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-[11px] text-neutral-600">
        <p>© 2026 Sabbir Hossen. All rights reserved.</p>
        <p>Designed & Developed with ❤️ for Creative People</p>
      </div>
    </footer>
  );
}