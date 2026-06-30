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
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Get in touch
            </h2>
            <p className="mt-4 text-lg text-[#4A4A4A]">
              Have questions or need help? Reach out to us.
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          {contactInfo.map((item) => (
            <SectionWrapper key={item.label}>
              <div className="rounded-2xl border border-[#E5E5E5] bg-white p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center rounded-xl bg-[#ED1C24]/5 p-3">
                  <item.icon className="h-6 w-6 text-[#ED1C24]" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-[#111111]">{item.label}</h3>
                {item.href ? (
                  <a
                    href={item.href}
                    className="mt-2 block text-sm text-[#4A4A4A] hover:text-[#ED1C24] transition-colors"
                  >
                    {item.value}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-[#4A4A4A] whitespace-pre-line">{item.value}</p>
                )}
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
