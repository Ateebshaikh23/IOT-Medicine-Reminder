'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/icons';
import { ArrowLeft } from 'lucide-react';


const formSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z
    .string()
    .min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const user = { ...values, id: Date.now().toString() };
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/login');
      toast({
        title: 'Account Created!',
        description: "You've successfully signed up. Please log in.",
      });
    } catch (error) {
       toast({
        title: 'Uh oh!',
        description: 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
     <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
         <div className="mx-auto grid w-[350px] gap-6">
            <Button variant="ghost" className="absolute top-4 left-4" asChild>
                <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/>Home</Link>
            </Button>
            <div className="grid gap-2 text-center">
                <h1 className="text-3xl font-bold">Sign Up</h1>
                <p className="text-balance text-muted-foreground">
                    Enter your information to create an account
                </p>
            </div>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">
                Create an account
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </div>
        </div>
      </div>
       <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
         <Image
          src="https://picsum.photos/1200/1800?grayscale"
          alt="A doctor speaking with a patient"
          width={1200}
          height={1800}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="doctor patient"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="h-8 w-8 mr-2" />
          IOT MEDICINE REMINDER
        </div>
         <div className="relative z-20 mt-auto">
           <p className="text-lg">
             A simple, reliable tool to help you and your family stay on track with medications.
            </p>
        </div>
      </div>
    </div>
  );
}
