"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons';
import { ThemeToggle } from '@/components/theme-toggle';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [hasScrolled, setHasScrolled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 20);
    };

    const checkLoginStatus = () => {
        if (localStorage.getItem('loggedInUser')) {
            setIsLoggedIn(true);
        } else {
            setIsLoggedIn(false);
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkLoginStatus);

    checkLoginStatus(); // Initial check
    
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('storage', checkLoginStatus);
    }
  }, []);

  const handleLogout = () => {
    // Immediately redirect for a better user experience
    router.push('/login');
    
    // Then clear the state
    localStorage.removeItem('loggedInUser');
    window.dispatchEvent(new Event('storage')); // Notify other components
    setIsLoggedIn(false);
  }

  const navLinks = [
    { href: '#how-it-works', label: 'How It Works' },
  ];

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full transition-all duration-300",
      hasScrolled ? "bg-background/80 backdrop-blur-sm border-b" : "bg-transparent"
    )}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Logo className="h-7 w-7 text-primary" />
          <span className="font-headline">IOT MEDICINE REMINDER</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-foreground/80 hover:text-foreground transition-colors">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {isLoggedIn ? (
            <>
              <Button variant="outline" asChild>
                  <Link href="/dashboard">Dashboard</Link>
              </Button>
              <Button onClick={handleLogout}>Log Out</Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href="/login">Log In</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

    