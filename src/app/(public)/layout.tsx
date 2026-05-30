import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Red Spine */}
      <div className="yan-spine hidden lg:block" />
      
      <Header />
      {/* Add padding for the spine on desktop */}
      <main className="flex-grow pt-24 md:pt-32 lg:pl-[var(--spine-width)]">
        {children}
      </main>
      <div className="lg:pl-[var(--spine-width)]">
        <Footer />
      </div>
    </div>
  );
}
