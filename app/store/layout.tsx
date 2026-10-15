import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Store — Digital Tools & Plugins | Sabbir Hossen',
  description: 'Official store for motion design extensions, After Effects tools, and creative production assets developed by Sabbir Hossen.',
};

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black font-sans antialiased">
      {children}
    </div>
  );
}
