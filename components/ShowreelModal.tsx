interface ShowreelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShowreelModal({ isOpen, onClose }: ShowreelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
        >
          ✕
        </button>
        {/* এখানে আপনার Showreel ভিডিওর লিংক বসাবেন */}
        <iframe 
          src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1" 
          className="w-full h-full" 
          allow="autoplay; encrypted-media" 
          allowFullScreen 
        />
      </div>
    </div>
  );
}