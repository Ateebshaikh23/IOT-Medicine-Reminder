import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export function Hero() {
  return (
    <section className="relative w-full h-[80vh] min-h-[480px] flex items-center justify-center text-center overflow-hidden bg-background">
      <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-accent opacity-20"></div>
      <Image
        src="https://images.unsplash.com/photo-1624727828489-a1e03b79bba8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHwxN3x8ZG9jdG9yfGVufDB8fHx8MTc1NzI2ODk3MXww&ixlib=rb-4.1.0&q=80&w=1080"
        alt="A doctor reviewing a tablet"
        fill
        className="absolute inset-0 w-full h-full object-cover"
        data-ai-hint="doctor"
      />
      <div className="absolute inset-0 bg-black/30 mix-blend-multiply"></div>
      <div className="container px-4 md:px-6 relative z-10">
        <div className="grid items-center gap-6">
          <div className="space-y-4">
            <div className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
            <div className="absolute -bottom-24 -right-12 w-72 h-72 bg-accent/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl font-headline text-primary-foreground">
              Health Reminders, Simplified.
            </h1>
            <p className="max-w-[600px] text-lg text-primary-foreground/80 md:text-xl mx-auto">
              A simple, reliable tool to help you and your family remember to
              take medications on time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
