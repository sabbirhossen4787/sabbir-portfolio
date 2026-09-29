import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function GraphicsPage() {
  const items = [
    { title: "Facebook E-Commerce Ad Creatives", cat: "Client Work", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80" },
    { title: "YouTube High CTR Thumbnails", cat: "Creator Project", img: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80" },
    { title: "Minimal Product Brand Collateral", cat: "Concept Project", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80" },
    { title: "Food Brand Promotional Post", cat: "Client Work", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <span className="text-xs font-mono uppercase text-blue-600 font-bold">Portfolio Category</span>
        <h1 className="text-4xl font-extrabold text-neutral-950 mt-2 mb-4">Graphic Design & Brand Creatives</h1>
        <p className="text-neutral-500 max-w-2xl text-sm leading-relaxed mb-12">
          Designed with Adobe Photoshop, Illustrator, and Figma. Focused on clear visual hierarchy, color theory, and marketing conversion.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {items.map((it, idx) => (
            <div key={idx} className="group bg-white rounded-2xl overflow-hidden border border-neutral-200/80 shadow-sm p-4">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-neutral-900 mb-4">
                <Image src={it.img} alt={it.title} fill className="object-cover group-hover:scale-105 transition duration-500" />
              </div>
              <span className="text-[11px] font-mono uppercase text-neutral-400 font-semibold">{it.cat}</span>
              <h2 className="text-lg font-bold text-neutral-900 mt-1">{it.title}</h2>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}