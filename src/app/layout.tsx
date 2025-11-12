'use client';

import type { Metadata } from 'next';
import { Inter, Roboto_Slab } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useState, useEffect, useRef } from 'react';
import type { Medicine, User, HistoryLog } from '@/app/dashboard/page';
import { useToast } from '@/hooks/use-toast';
import { usePathname, useRouter } from 'next/navigation';
import { ReminderPopup } from '@/components/reminder-popup';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const robotoSlab = Roboto_Slab({
  subsets: ['latin'],
  variable: '--font-headline',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [reminder, setReminder] = useState<Medicine | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const workerRef = useRef<Worker | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const isPublicPage = pathname === '/' || pathname === '/login' || pathname === '/signup';

  const loadData = () => {
    if (typeof window !== 'undefined') {
      const loggedInUserStr = localStorage.getItem('loggedInUser');
      if (loggedInUserStr) {
        try {
          const parsedUser = JSON.parse(loggedInUserStr);
          const userDetailsStr = localStorage.getItem(`userDetails_${parsedUser.id}`);
          const medicinesStr = localStorage.getItem(`medicines_${parsedUser.id}`);
          const historyStr = localStorage.getItem(`medHistory_${parsedUser.id}`);
          
          const currentUser = userDetailsStr ? JSON.parse(userDetailsStr) : { name: parsedUser.name || 'User', age: 0 };
          const currentMedicines = medicinesStr ? JSON.parse(medicinesStr) : [];
          const currentHistory = historyStr ? JSON.parse(historyStr) : [];

          setUser(currentUser);
          setMedicines(currentMedicines);
          setHistory(currentHistory);

        } catch (e) {
          console.error("Failed to parse user data from localStorage", e);
          localStorage.removeItem('loggedInUser');
          setUser(null);
          setMedicines([]);
          setHistory([]);
          if (!isPublicPage) router.push('/login');
        }
      } else {
        setUser(null);
        setMedicines([]);
        setHistory([]);
        if (!isPublicPage) router.push('/login');
      }
    }
  };
  
  // Initial data load and storage listener
  useEffect(() => {
    loadData();

    if (typeof window !== 'undefined') {
      const handleStorageChange = () => {
        loadData();
      };
      window.addEventListener('storage', handleStorageChange);
      return () => {
        window.removeEventListener('storage', handleStorageChange);
      };
    }
  }, [pathname]);

  // Effect for managing the reminder worker
  useEffect(() => {
    if (typeof window !== 'undefined' && window.Worker) {
      // Ensure there's only one worker instance.
      if (!workerRef.current) {
        workerRef.current = new Worker('/reminder-worker.js');
      }

      workerRef.current.onmessage = (event) => {
        const dueMedicine = event.data as Medicine;
        
        setReminder(dueMedicine); // Show in-app popup
        audioRef.current?.play().catch(e => console.log("Audio play failed", e)); // Play sound

        // Show browser notification
        if (Notification.permission === 'granted') {
          const notification = new Notification(`Time for your medication, ${user?.name || 'User'}!`, {
            body: `Take ${dueMedicine.medicineName} (${dueMedicine.dosage})`,
            icon: '/logo.svg',
            tag: `med-reminder-${dueMedicine.id}`
          });
          notification.onclick = () => {
            window.focus();
            router.push('/dashboard');
          };
        }
      };

      const worker = workerRef.current;
      return () => {
        worker.terminate();
        workerRef.current = null;
      };
    }
  }, [user, router]);
  
  // Effect for sending updated medicine and history list to worker
  useEffect(() => {
    if (workerRef.current) {
        workerRef.current.postMessage({ type: 'UPDATE_DATA', payload: {medicines, history} });
    }
  }, [medicines, history]);

  // Request notification permission on component mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            console.log('Notification permission granted.');
          }
        });
      }
    }
  }, []);

  const handleReminderClose = () => {
    setReminder(null);
  };

  const handleTaken = () => {
    if(reminder && user) {
        const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')!);
        const newLog: HistoryLog = {
          medicineId: reminder.id,
          name: reminder.medicineName,
          dosage: reminder.dosage,
          time: new Date().toISOString(),
          date: new Date().toISOString(),
        };

        const historyRaw = localStorage.getItem(`medHistory_${loggedInUser.id}`);
        const currentHistory = historyRaw ? JSON.parse(historyRaw) : [];
        const updatedHistory = [...currentHistory, newLog];
        localStorage.setItem(`medHistory_${loggedInUser.id}`, JSON.stringify(updatedHistory));
        
        window.dispatchEvent(new Event('storage'));

        toast({
            title: 'Great!',
            description: `You've marked ${reminder.medicineName} as taken.`,
        });
    }
    handleReminderClose();
  };

  const handleSnooze = () => {
     if (workerRef.current && reminder) {
      workerRef.current.postMessage({ type: 'SNOOZE', payload: reminder });
       toast({
        title: 'Snoozed!',
        description: 'We will remind you again in 5 minutes.',
      });
    }
    handleReminderClose();
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>IOT MEDICINE REMINDER</title>
        <meta name="description" content="A simple way to remember your medications." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Roboto+Slab:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={`${inter.variable} ${robotoSlab.variable} font-body`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
           {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <audio ref={audioRef} src="/notification.mp3" />
          {reminder && user && (
            <ReminderPopup
              reminder={reminder}
              username={user.name || 'User'}
              onTaken={handleTaken}
              onSnooze={handleSnooze}
              onClose={handleReminderClose}
            />
          )}
        </ThemeProvider>
      </body>
    </html>
  );
}

    