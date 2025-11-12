'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { Trash2, User, Pill, Clock, Bell, LogOut, PlusCircle, CalendarCheck, BookOpen, StickyNote, Sun, CloudSun, Moon } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';

// Schemas
const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  age: z.coerce.number().min(1, 'Age is required'),
});

const medicineSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  frequency: z.enum(['daily', 'weekly']),
  notes: z.string().optional(),
});

export type User = z.infer<typeof personalInfoSchema>;
export type Medicine = z.infer<typeof medicineSchema> & { id: string };
export type HistoryLog = { medicineId: string, name: string, dosage: string, time: string, date: string };


export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [history, setHistory] = useState<HistoryLog[]>([]);
  const [nextDose, setNextDose] = useState<{ medicine: Medicine, time: Date } | null>(null);
  const [timeToNextDose, setTimeToNextDose] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  
  const takenDates = history.map(log => new Date(log.date));
  const logsForSelectedDay = selectedDate ? history.filter(log => isSameDay(new Date(log.date), selectedDate)) : [];

  const groupedMedicines = useMemo(() => {
    const morning: Medicine[] = [];
    const afternoon: Medicine[] = [];
    const evening: Medicine[] = [];

    medicines.forEach(med => {
      const hour = parseInt(med.time.split(':')[0], 10);
      if (hour < 12) {
        morning.push(med);
      } else if (hour >= 12 && hour < 17) {
        afternoon.push(med);
      } else {
        evening.push(med);
      }
    });

    return { morning, afternoon, evening };
  }, [medicines]);


  // Forms
  const personalInfoForm = useForm<User>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: '',
      age: 0,
    }
  });

  const medicineForm = useForm<z.infer<typeof medicineSchema>>({
    resolver: zodResolver(medicineSchema),
    defaultValues: {
      medicineName: '',
      dosage: '',
      time: '',
      frequency: 'daily',
      notes: '',
    },
  });

  const loadDashboardData = () => {
    const loggedInUserStr = localStorage.getItem('loggedInUser');
    if (!loggedInUserStr) {
      router.push('/login');
      return;
    }
    
    try {
        const parsedUser = JSON.parse(loggedInUserStr);
        const storedUserDetails = localStorage.getItem(`userDetails_${parsedUser.id}`);
        const storedMedicines = localStorage.getItem(`medicines_${parsedUser.id}`);
        const storedHistory = localStorage.getItem(`medHistory_${parsedUser.id}`);
        
        let currentUserDetails: User;
        if (storedUserDetails) {
          currentUserDetails = JSON.parse(storedUserDetails);
        } else {
           currentUserDetails = { name: parsedUser.name || 'User', age: 0 };
        }
        setUser(currentUserDetails);
        personalInfoForm.reset(currentUserDetails);

        let currentMedicines: Medicine[] = [];
        if (storedMedicines) {
          currentMedicines = JSON.parse(storedMedicines);
        }
        setMedicines(currentMedicines);

        let currentHistory: HistoryLog[] = [];
        if (storedHistory) {
          currentHistory = JSON.parse(storedHistory);
        }
        setHistory(currentHistory);

    } catch (e) {
        console.error("Failed to parse user data", e);
        localStorage.removeItem('loggedInUser');
        router.push('/login');
    }
  }

  // Effect for initial load and listening to storage changes
  useEffect(() => {
    loadDashboardData();

    const handleStorageChange = () => {
      loadDashboardData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [router]);
  
  // Effect for calculating next dose countdown
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateNextDose = () => {
        if (medicines.length === 0) {
            setNextDose(null);
            setTimeToNextDose('');
            return;
        }
        
        const now = new Date();
        let closestDose: { medicine: Medicine, time: Date } | null = null;
        
        medicines.forEach(med => {
            const [hour, minute] = med.time.split(':');
            const nextDoseTime = new Date();
            nextDoseTime.setHours(parseInt(hour), parseInt(minute), 0, 0);

            if (med.frequency === 'weekly') {
                const currentDay = now.getDay();
                let daysUntilNext = (nextDoseTime.getDay() - currentDay + 7) % 7;
                 if (daysUntilNext === 0 && nextDoseTime.getTime() < now.getTime()) {
                    daysUntilNext = 7;
                }
                nextDoseTime.setDate(now.getDate() + daysUntilNext);
            } else if (nextDoseTime.getTime() < now.getTime()) { // Daily
                nextDoseTime.setDate(nextDoseTime.getDate() + 1);
            }

            if (!closestDose || nextDoseTime.getTime() < closestDose.time.getTime()) {
                closestDose = { medicine: med, time: nextDoseTime };
            }
        });

        if(closestDose) {
            setNextDose(closestDose);
            const diff = closestDose.time.getTime() - now.getTime();
            if (diff > 0) {
                const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const minutes = Math.floor((diff / 1000 / 60) % 60);
                const seconds = Math.floor((diff / 1000) % 60);
                
                let timeString = '';
                if (days > 0) timeString += `${days}d `;
                timeString += `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;

                setTimeToNextDose(timeString);
            } else {
                setTimeToNextDose("It's time!");
            }
        } else {
            setNextDose(null);
            setTimeToNextDose('');
        }
    }

    updateNextDose(); // Initial call
    const countdownTimer = setInterval(updateNextDose, 1000);

    return () => clearInterval(countdownTimer);
  }, [medicines]);

  // Functions
  const handlePersonalInfoSubmit = (values: User) => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')!);
    localStorage.setItem(`userDetails_${loggedInUser.id}`, JSON.stringify(values));
    setUser(values);
    window.dispatchEvent(new Event('storage')); // Notify other tabs/layout
    toast({ title: 'Success', description: 'Personal details updated.' });
  };

  const handleMedicineSubmit = (values: z.infer<typeof medicineSchema>) => {
    const newMedicine: Medicine = { ...values, id: Date.now().toString() };
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')!);
    
    // Fetch existing medicines, update, and save back
    const existingMedicinesRaw = localStorage.getItem(`medicines_${loggedInUser.id}`);
    const existingMedicines = existingMedicinesRaw ? JSON.parse(existingMedicinesRaw) : [];
    const updatedMedicines = [...existingMedicines, newMedicine];

    localStorage.setItem(`medicines_${loggedInUser.id}`, JSON.stringify(updatedMedicines));
    window.dispatchEvent(new Event('storage')); // This will trigger the reload in useEffect
    
    toast({ title: 'Success', description: `${newMedicine.medicineName} added.` });
    medicineForm.reset();
  };

  const deleteMedicine = (id: string) => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser')!);
    
    // Fetch, filter, and save back
    const existingMedicinesRaw = localStorage.getItem(`medicines_${loggedInUser.id}`);
    const existingMedicines = existingMedicinesRaw ? JSON.parse(existingMedicinesRaw) : [];
    const updatedMedicines = existingMedicines.filter((med: Medicine) => med.id !== id);

    localStorage.setItem(`medicines_${loggedInUser.id}`, JSON.stringify(updatedMedicines));
    window.dispatchEvent(new Event('storage'));
    
    toast({ title: 'Success', description: 'Medicine removed.' });
  };
  
  const handleLogout = () => {
    // Immediately navigate to the home page for a faster user experience
    router.push('/');
    
    // Then, clear local storage and notify other tabs
    localStorage.removeItem('loggedInUser');
    window.dispatchEvent(new Event('storage')); // Notify layout to clear state
    
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
  };

  if (!user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <p>Loading...</p>
        </div>
    );
  }

  const renderMedicineCard = (med: Medicine) => (
    <Card key={med.id} className="flex items-start justify-between p-4 hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
            <Pill className="h-6 w-6 text-primary/70 mt-1" />
            <div className="space-y-1">
                <p className="font-bold">{med.medicineName}</p>
                <p className="text-sm text-muted-foreground">{med.dosage}</p>
                <p className="text-sm text-muted-foreground capitalize">{med.frequency} at {med.time}</p>
                {med.notes && (
                    <div className="flex items-start gap-2 pt-1 text-sm text-muted-foreground">
                        <StickyNote className="h-4 w-4 mt-0.5 flex-shrink-0"/>
                        <p className="italic">{med.notes}</p>
                    </div>
                )}
            </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => deleteMedicine(med.id)}>
            <Trash2 className="h-5 w-5 text-destructive" />
        </Button>
    </Card>
  );

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <Logo className="h-7 w-7 text-primary" />
            <span className="font-headline tracking-tight">IOT MEDICINE REMINDER</span>
          </Link>
          <Button variant="ghost" onClick={handleLogout}><LogOut className="mr-2"/>Log Out</Button>
        </div>
      </header>
      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <div className="mb-8">
            <h1 className="text-4xl font-bold tracking-tight">Welcome, {user?.name || 'User'}!</h1>
            <p className="text-muted-foreground">Here&apos;s your medication dashboard for today.</p>
        </div>
        
        {nextDose && (
          <Card className="mb-8 bg-gradient-to-r from-primary to-blue-500 text-primary-foreground border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Bell className="w-6 h-6 animate-pulse-glow"/>
                Next Dose Reminder
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-center md:text-left">
                <p className="text-xl">
                  <span className="font-bold">{nextDose.medicine.medicineName}</span> ({nextDose.medicine.dosage})
                </p>
                <p className="text-sm opacity-80">
                  Scheduled for {nextDose.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
              <p className="text-4xl lg:text-5xl font-bold tracking-tighter">{timeToNextDose}</p>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-1 space-y-8">
                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><User className="w-6 h-6 text-primary"/> Personal Info</CardTitle>
                        <CardDescription>Keep your details up to date.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...personalInfoForm}>
                            <form onSubmit={personalInfoForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
                                <FormField control={personalInfoForm.control} name="name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={personalInfoForm.control} name="age" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Age</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <Button type="submit" className="w-full">Save Details</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><PlusCircle className="w-6 h-6 text-primary" /> Add New Medicine</CardTitle>
                         <CardDescription>Add a new medication to your schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...medicineForm}>
                            <form onSubmit={medicineForm.handleSubmit(handleMedicineSubmit)} className="space-y-4">
                                <FormField control={medicineForm.control} name="medicineName" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medicine Name</FormLabel>
                                        <FormControl><Input placeholder="e.g., Paracetamol" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={medicineForm.control} name="dosage" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Dosage</FormLabel>
                                        <FormControl><Input placeholder="e.g., 500mg or 1 tablet" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                <FormField control={medicineForm.control} name="time" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Time</FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}/>
                                 <FormField
                                    control={medicineForm.control}
                                    name="frequency"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Frequency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            <SelectItem value="daily">Daily</SelectItem>
                                            <SelectItem value="weekly">Weekly</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={medicineForm.control}
                                    name="notes"
                                    render={({ field }) => (
                                        <FormItem>
                                        <FormLabel>Notes (Optional)</FormLabel>
                                        <FormControl>
                                            <Textarea
                                            placeholder="e.g., Take with food"
                                            className="resize-none"
                                            {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full"><PlusCircle/> Add Medicine</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-2 space-y-8">
                 <Card className="shadow-sm">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="w-6 h-6 text-primary"/>My Medications</CardTitle>
                        <CardDescription>Your current medication schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {medicines.length === 0 ? (
                            <div className="text-center text-muted-foreground p-8 flex flex-col items-center justify-center border-2 border-dashed rounded-lg">
                              <Pill className="mx-auto h-12 w-12 text-gray-300" />
                              <h3 className="mt-4 text-lg font-semibold">No Medicines Yet</h3>
                              <p className="mt-2 text-sm max-w-xs mx-auto">
                                You haven&apos;t added any medications. Add your first one to start tracking.
                              </p>
                              <Button
                                className="mt-6"
                                onClick={() => {
                                    const form = document.querySelector('form[class*="space-y-4"]'); // A bit fragile, but works for this
                                    (form?.querySelector('input') as HTMLInputElement)?.focus();
                                }}
                                >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add First Medicine
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {groupedMedicines.morning.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2 text-muted-foreground"><Sun className="w-5 h-5"/>Morning</h3>
                                        {groupedMedicines.morning.map(renderMedicineCard)}
                                    </div>
                                )}
                                {groupedMedicines.afternoon.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2 text-muted-foreground"><CloudSun className="w-5 h-5"/>Afternoon</h3>
                                        {groupedMedicines.afternoon.map(renderMedicineCard)}
                                    </div>
                                )}
                                {groupedMedicines.evening.length > 0 && (
                                    <div className="space-y-4">
                                        <h3 className="font-semibold text-lg flex items-center gap-2 text-muted-foreground"><Moon className="w-5 h-5"/>Evening</h3>
                                        {groupedMedicines.evening.map(renderMedicineCard)}
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarCheck className="h-6 w-6 text-primary" />
                      Medication History
                    </CardTitle>
                    <CardDescription>
                      Review your medication logs.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid md:grid-cols-2 gap-6">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                        modifiers={{ taken: takenDates }}
                        modifiersStyles={{ taken: {
                             color: 'hsl(var(--primary-foreground))',
                             backgroundColor: 'hsl(var(--primary))'
                        } }}
                    />
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">
                            Logs for {selectedDate ? format(selectedDate, "PPP") : "today"}
                        </h3>
                        {logsForSelectedDay.length > 0 ? (
                            <div className="space-y-3">
                                {logsForSelectedDay.map((log, index) => (
                                    <div key={index} className="flex items-center gap-3 text-sm p-3 bg-muted/50 rounded-lg">
                                        <Pill className="h-5 w-5 text-primary/80 flex-shrink-0" />
                                        <div>
                                            <p className="font-semibold">{log.name}</p>
                                            <p className="text-muted-foreground">Dosage: {log.dosage}</p>
                                            <p className="text-muted-foreground">Taken at: {new Date(log.date).toLocaleTimeString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                             <div className="text-center text-muted-foreground py-10 flex flex-col items-center justify-center border-2 border-dashed rounded-lg h-full">
                              <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                              <h3 className="mt-4 text-lg font-semibold">No Doses Logged</h3>
                              <p className="mt-2 text-sm">No medication was recorded for this day.</p>
                            </div>
                        )}
                    </div>
                  </CardContent>
                </Card>
            </div>
        </div>
      </main>
    </>
  );
}
