import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Image from 'next/image';

export default function ClientsPage() {
  const clientWorks = [
    { title: "Local E-Commerce Facebook Campaign", type: "Client Work (Bangladesh)", tag: "Social Creatives", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80" },
    { title: "Fitness Apparel Product Launch", type: "Client Work", tag: "Video & Ad Banners", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80" },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <span className="text-xs font-mono uppercase text-emerald-600 font-bold">Real Projects</span>
        <h1 className="text-4xl font-extrabold text-neutral-950 mt-2 mb-4">Client Work & Case Studies</h1>
        <p className="text-neutral-500 max-w-2xl text-sm leading-relaxed mb-12">
          Genuine design and video projects created for real businesses, e-commerce stores, and digital brands.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {clientWorks.map((work, idx) => (
            <div key={idx} className="bg-white rounded-2xl overflow-hidden border border-neutral-200/80 p-5 shadow-sm">
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden mb-4">
                <Image src={work.img} alt={work.title} fill className="object-cover" />
              </div>
              <span className="text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                {work.type}
              </span>
              <h2 className="text-lg font-bold text-neutral-900 mt-2">{work.title}</h2>
              <p className="text-xs text-neutral-500 mt-1">{work.tag}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}