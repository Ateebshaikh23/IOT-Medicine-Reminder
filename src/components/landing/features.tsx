import { PillIcon } from '@/components/icons';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const features = [
  {
    icon: (
      <div className="relative w-10 h-10">
        <svg
          className="w-10 h-10 text-primary"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <PillIcon className="absolute w-5 h-5 text-primary -bottom-1 -right-1" />
      </div>
    ),
    title: 'Precision & Punctuality',
    description:
      'Our robust reminder system ensures you never miss a dose. Get timely alerts that cut through the noise, powered by technology that respects your schedule.',
  },
  {
    icon: (
       <svg
        className="w-10 h-10 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
        ></path>
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
            d="M12 14.5l-1.5 1.5-1-1"
            className="text-green-500"
        ></path>
      </svg>
    ),
    title: 'Effortless Tracking',
    description:
      "Log every dose with a single tap. The monthly calendar view provides a clear, visual history of your adherence, empowering you and your healthcare provider.",
  },
  {
    icon: (
       <svg
        className="w-10 h-10 text-primary"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.955a11.955 11.955 0 018.618-3.04A12.02 12.02 0 0021 7.045a11.955 11.955 0 01-2.382-3.06z"
        ></path>
      </svg>
    ),
    title: 'Peace of Mind',
    description:
      'Relax knowing your medication schedule is managed. Our reliable system works in the background, giving you the freedom to focus on living your life.',
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 lg:py-32 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm font-medium text-primary">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Your Partner in Health
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Designed to be simple, reliable, and supportive. Here’s how we help you stay on track.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col items-center text-center p-6 border-2 border-transparent hover:border-primary/50 hover:shadow-xl transition-all duration-300">
              <CardHeader className="items-center p-0 mb-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
