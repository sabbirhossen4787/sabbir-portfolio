import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";

export const metadata: Metadata = {
  title: "Sabbir Hossen — Graphics Designer & Video Editor",
  description: "I create visual content that helps brands communicate, promote, and grow.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className="scroll-smooth bg-[#090A0D]" 
      style={{ backgroundColor: '#090A0D', colorScheme: 'dark' }} 
      suppressHydrationWarning
    >
      <body 
        className="antialiased bg-[#090A0D] text-white selection:bg-[#FF6B00] selection:text-black overflow-x-hidden" 
        style={{ backgroundColor: '#090A0D' }} 
        suppressHydrationWarning
      >
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}