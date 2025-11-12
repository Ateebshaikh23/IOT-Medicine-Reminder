import { UserPlus, ListPlus, BellRing } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const steps = [
  {
    icon: <UserPlus className="w-8 h-8 text-primary" />,
    title: 'Create an Account',
    description: 'A quick and easy sign-up process gets you started in seconds.',
  },
  {
    icon: <ListPlus className="w-8 h-8 text-primary" />,
    title: 'Add Medications',
    description: 'Enter your medication details and set up your personalized schedule.',
  },
  {
    icon: <BellRing className="w-8 h-8 text-primary" />,
    title: 'Get Reminders',
    description: "Receive unmissable alerts on your screen when it's time for your dose.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 md:py-24 lg:py-32 bg-background">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">How It Works</div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Get Started in 3 Simple Steps</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Managing your medications is as easy as 1, 2, 3. Our intuitive platform makes it effortless.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          {steps.map((step, index) => (
             <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300">
              <CardHeader className="items-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-4">
                  {step.icon}
                </div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription className="pt-2">{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
