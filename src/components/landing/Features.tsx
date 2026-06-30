'use client';

import {
  TicketPlus,
  MessageSquareText,
  Paperclip,
  ListChecks,
  Users,
  Bell,
} from 'lucide-react';
import SectionWrapper from './SectionWrapper';

const features = [
  {
    icon: TicketPlus,
    title: 'Easy Ticket Creation',
    description:
      'Customers can submit support tickets quickly through a simple and intuitive form. Every request is captured with essential details from the start.',
  },
  {
    icon: MessageSquareText,
    title: 'Real-time Conversation',
    description:
      'Communicate instantly through ticket conversations. Messages appear in real time so nothing gets delayed.',
  },
  {
    icon: Paperclip,
    title: 'File Attachments',
    description:
      'Attach screenshots, documents, and other files directly to tickets. All attachments are securely stored and linked to the relevant conversation.',
  },
  {
    icon: ListChecks,
    title: 'Ticket Status Tracking',
    description:
      'Every ticket moves through a clear status workflow — from Open to In Progress to Resolved. Know exactly where each request stands.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    description:
      'Agents can leave internal notes and work together on tickets without customers seeing. Collaborate efficiently as a team.',
  },
  {
    icon: Bell,
    title: 'Email Notifications',
    description:
      'Stay updated with automatic email alerts when tickets are created, updated, or receive new messages. Never miss an important update.',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              Everything you need to manage support
            </h2>
            <p className="mt-4 text-lg text-[#4A4A4A]">
              A complete set of tools to handle customer requests from submission to resolution.
            </p>
          </div>
        </SectionWrapper>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <SectionWrapper key={feature.title}>
              <div className="group rounded-2xl border border-[#E5E5E5] bg-white p-8 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                <div className="inline-flex items-center justify-center rounded-xl bg-[#ED1C24]/5 p-3">
                  <feature.icon className="h-6 w-6 text-[#ED1C24]" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-[#111111]">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#4A4A4A]">
                  {feature.description}
                </p>
              </div>
            </SectionWrapper>
          ))}
        </div>
      </div>
    </section>
  );
}
