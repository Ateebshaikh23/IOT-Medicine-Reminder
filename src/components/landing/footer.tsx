import Link from 'next/link';
import { Logo } from '@/components/icons';

export function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-center gap-4 px-4 py-6 md:px-6">
        <div className="flex items-center gap-2">
          <Logo className="h-6 w-6 text-primary" />
          <span className="font-bold font-headline">IOT MEDICINE REMINDER</span>
        </div>
      </div>
    </footer>
  );
}
