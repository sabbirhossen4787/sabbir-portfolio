import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import VideoReels from '@/components/VideoReels';

export default function VideoPage() {
  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-20">
        <span className="text-xs font-mono uppercase text-purple-600 font-bold">Video Production</span>
        <h1 className="text-4xl font-extrabold text-neutral-950 mt-2 mb-4">Video Editing & Short-Form Content</h1>
        <p className="text-neutral-500 max-w-2xl text-sm leading-relaxed">
          From fast-paced TikToks/Reels to polished promotional brand videos. Mastered with Adobe Premiere Pro and After Effects.
        </p>
      </div>
      <VideoReels />
      <Footer />
    </div>
  );
}