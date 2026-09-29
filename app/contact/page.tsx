import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-20">
        <span className="text-xs font-mono uppercase text-blue-600 font-bold">Start a Project</span>
        <h1 className="text-4xl font-extrabold text-neutral-950 mt-2 mb-4">Let&apos;s build something great.</h1>
        <p className="text-sm text-neutral-500 mb-8">
          Fill out the brief inquiry form below or reach out directly via email at <strong className="text-neutral-900">contact@sabbirhossen.com</strong>.
        </p>

        <form className="bg-white p-8 rounded-2xl border border-neutral-200/80 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-neutral-600 mb-1">YOUR NAME</label>
            <input required type="text" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="John Doe" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-neutral-600 mb-1">EMAIL ADDRESS</label>
            <input required type="email" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black" placeholder="john@example.com" />
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-neutral-600 mb-1">PROJECT TYPE</label>
            <select className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black">
              <option>Graphic Design & Ads</option>
              <option>Video Editing & Reels</option>
              <option>YouTube Thumbnails & Assets</option>
              <option>Complete Brand Collateral</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-mono font-semibold text-neutral-600 mb-1">MESSAGE</label>
            <textarea rows={4} className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-black resize-none" placeholder="Tell me about your project..."></textarea>
          </div>
          <button type="submit" className="w-full py-3.5 bg-black text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-neutral-800 transition shadow-md">
            Send Inquiry
          </button>
        </form>
      </div>
      <Footer />
    </div>
  );
}