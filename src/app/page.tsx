import { Navbar } from '@/components/landing/navbar';
import { Hero } from '@/components/landing/hero';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Features } from '@/components/landing/features';
import { Footer } from '@/components/landing/footer';

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
