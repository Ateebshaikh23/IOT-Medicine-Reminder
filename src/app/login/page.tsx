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
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const storedUser = localStorage.getItem('user');
      if (!storedUser) {
        toast({
          title: 'Login Failed',
          description: 'No account found. Please sign up first.',
          variant: 'destructive',
        });
        return;
      }
      
      const user = JSON.parse(storedUser);

      if (user.email === values.email && user.password === values.password) {
        localStorage.setItem('loggedInUser', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        router.push('/dashboard');
        toast({
          title: 'Success!',
          description: 'You are now logged in.',
        });
      } else {
        toast({
          title: 'Login Failed',
          description: 'Incorrect email or password.',
          variant: 'destructive',
        });
      }
    } catch (error) {
       toast({
        title: 'Uh oh!',
        description: 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  }

  return (
    <div className="w-full min-h-screen lg:grid lg:grid-cols-2">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <Image
          src="https://picsum.photos/1200/1800"
          alt="An old man in a hospital bed"
          width={1200}
          height={1800}
          className="absolute inset-0 w-full h-full object-cover"
          data-ai-hint="old man hospital"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Logo className="h-8 w-8 mr-2" />
          IOT MEDICINE REMINDER
        </div>
        <div className="relative z-20 mt-auto">
           <p className="text-lg">
              Health Reminders, Simplified. Your personal companion for timely medication.
            </p>
        </div>
      </div>
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[350px] gap-6">
          <Button variant="ghost" className="absolute top-4 left-4" asChild>
            <Link href="/"><ArrowLeft className="mr-2 h-4 w-4"/>Home</Link>
          </Button>
          <div className="grid gap-2 text-center">
            <h1 className="text-3xl font-bold">Log In</h1>
            <p className="text-balance text-muted-foreground">
              Enter your email below to login to your account
            </p>
          </div>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
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
                Log in
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
