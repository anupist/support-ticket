'use client';

import { TicketPlus, Bell, MessageSquareShare, CheckCircle } from 'lucide-react';
import { ArrowDown } from 'lucide-react';
import SectionWrapper from './SectionWrapper';

const steps = [
  {
    icon: TicketPlus,
    title: 'Customer creates a support ticket',
    description:
      'A customer submits a request through the portal describing their issue with relevant details and attachments.',
  },
  {
    icon: Bell,
    title: 'Admin receives notification',
    description:
      'Support agents and admins are instantly notified of the new ticket via real-time alerts and email.',
  },
  {
    icon: MessageSquareShare,
    title: 'Customer and Admin communicate',
    description:
      'Both sides exchange messages, share files, and work toward a resolution within the ticket conversation.',
  },
  {
    icon: CheckCircle,
    title: 'Issue is resolved and ticket is closed',
    description:
      'Once the issue is resolved, the ticket is marked as closed. The customer is notified and can reopen if needed.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-muted">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From ticket creation to resolution — four simple steps.
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 mx-auto max-w-3xl">
          {steps.map((step, index) => (
            <SectionWrapper key={step.title}>
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                    <step.icon className="h-5 w-5" />
                  </div>
                  {index < steps.length - 1 && (
                    <div className="mt-2 flex-1 flex items-center justify-center">
                      <ArrowDown className="h-5 w-5 text-muted-foreground/40" />
                    </div>
                  )}
                </div>
                <div className="flex-1 pb-12">
                  <div className="rounded-2xl border bg-card text-card-foreground p-6 transition-all duration-200 hover:shadow-md">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-semibold text-primary">
                        Step {index + 1}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold">{step.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
