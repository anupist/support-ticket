'use client';

import { Mail, Phone, MapPin } from 'lucide-react';
import SectionWrapper from './SectionWrapper';

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@coder71.com',
    href: 'mailto:support@coder71.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Office Address',
    value: '123 Tech Street, Suite 100\nSan Francisco, CA 94105',
    href: null,
  },
];

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              Get in touch
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Have questions or need help? Reach out to us.
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactInfo.map((item) => (
            <SectionWrapper key={item.label}>
              <div className="rounded-2xl border bg-card text-card-foreground p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center rounded-xl bg-primary/5 p-3">
                  <item.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{item.label}</h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-line">{item.value}</p>
                )}
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
