import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  const tools = ["Adobe Photoshop", "Adobe Premiere Pro", "Adobe Illustrator", "Adobe After Effects", "Figma", "Adobe XD"];

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-20">
        <span className="text-xs font-mono uppercase text-neutral-400 font-bold">About Me</span>
        <h1 className="text-4xl font-extrabold text-neutral-950 mt-2 mb-6">
          A designer who cares about how the work actually works.
        </h1>
        <div className="space-y-4 text-neutral-600 text-base leading-relaxed font-normal">
          <p>
            I&apos;m Sabbir Hossen, an independent Graphics Designer and Video Editor based in Bangladesh, available for client projects worldwide.
          </p>
          <p>
            I specialize in turning business objectives into clean, engaging visual assets—ranging from high-CTR YouTube thumbnails and e-commerce advertising graphics to fast-paced short-form video content.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-200">
          <h2 className="text-sm font-mono uppercase tracking-wider text-neutral-900 font-bold mb-4">Software Proficiency</h2>
          <div className="flex flex-wrap gap-2.5">
            {tools.map((tool, i) => (
              <span key={i} className="text-xs font-semibold px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-800 shadow-sm">
                {tool}
              </span>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}