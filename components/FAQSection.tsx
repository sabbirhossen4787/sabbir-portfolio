export default function FAQSection() {
  const faqs = [
    { q: "What software do you primarily use?", a: "For graphic design I use Adobe Photoshop, Illustrator, and Figma. For video editing I rely on Premiere Pro and After Effects for motion graphics." },
    { q: "How do we collaborate across time zones?", a: "I work with clients worldwide via Slack, WhatsApp, Notion, and Loom. Communication is asynchronous and responsive." },
    { q: "What is your typical turnaround time?", a: "Single graphics/thumbnails are delivered within 24-48 hours. Video editing projects usually take 2 to 4 days depending on complexity." },
    { q: "Do you offer revisions?", a: "Yes, every project includes standard revision rounds until the visual matches your brand's benchmark." },
  ];

  return (
    <section className="py-20 px-6 max-w-4xl mx-auto border-t border-neutral-100">
      <div className="text-center mb-12">
        <span className="text-xs font-mono font-semibold text-neutral-400">06 — CLARITY</span>
        <h2 className="text-3xl font-bold text-neutral-950 mt-1">Frequently Asked Questions</h2>
      </div>

      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="p-6 rounded-2xl bg-white border border-neutral-200/80 shadow-sm">
            <h3 className="text-sm font-bold text-neutral-900 mb-2">{f.q}</h3>
            <p className="text-xs text-neutral-500 leading-relaxed">{f.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}