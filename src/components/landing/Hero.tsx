'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

function DashboardIllustration() {
  return (
    <div className="relative w-full max-w-[600px] mx-auto" aria-hidden="true">
      <div className="rounded-2xl border border-[#E5E5E5] bg-white shadow-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-[#E5E5E5] bg-[#F5F5F5]">
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
        </div>

        <div className="flex">
          <div className="w-2/5 border-r border-[#E5E5E5] p-3 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-[#F5F5F5]">
              <div className="h-2 w-2 rounded-full bg-[#ED1C24]" />
              <div className="flex-1">
                <div className="h-2.5 w-24 rounded bg-[#111111]/10" />
                <div className="h-2 w-16 rounded bg-[#111111]/5 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors">
              <div className="h-2 w-2 rounded-full bg-[#d97706]" />
              <div className="flex-1">
                <div className="h-2.5 w-20 rounded bg-[#111111]/10" />
                <div className="h-2 w-14 rounded bg-[#111111]/5 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#F5F5F5] transition-colors">
              <div className="h-2 w-2 rounded-full bg-[#16a34a]" />
              <div className="flex-1">
                <div className="h-2.5 w-28 rounded bg-[#111111]/10" />
                <div className="h-2 w-12 rounded bg-[#111111]/5 mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-32 rounded bg-[#111111]/10" />
                <div className="h-2.5 w-20 rounded bg-[#111111]/5 mt-1" />
              </div>
              <span className="inline-flex items-center rounded-full border border-[#ED1C24]/20 bg-[#ED1C24]/5 px-2 py-0.5 text-[10px] font-medium text-[#ED1C24]">
                Open
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-[#E5E5E5] flex-shrink-0" />
                <div className="flex-1">
                  <div className="rounded-xl bg-[#F5F5F5] px-3 py-2">
                    <div className="h-2 w-32 rounded bg-[#111111]/10" />
                    <div className="h-2 w-24 rounded bg-[#111111]/5 mt-1" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="flex-1">
                  <div className="rounded-xl bg-[#ED1C24]/5 px-3 py-2">
                    <div className="h-2 w-28 rounded bg-[#111111]/10" />
                    <div className="h-2 w-20 rounded bg-[#111111]/5 mt-1" />
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full bg-[#E5E5E5] flex-shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t border-[#E5E5E5] pt-2">
              <div className="h-6 w-6 rounded-full bg-[#E5E5E5] flex-shrink-0" />
              <div className="h-2.5 flex-1 rounded-full bg-[#F5F5F5]" />
              <div className="h-6 w-6 rounded bg-[#ED1C24]/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded bg-[#ED1C24]/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border border-[#E5E5E5] bg-white/50 -z-10" />
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#111111] leading-[1.1]">
              Customer Support{' '}
              <span className="text-[#ED1C24]">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-[#4A4A4A] leading-relaxed max-w-xl mx-auto lg:mx-0">
              Manage customer support tickets, communicate with your team, and resolve customer issues
              from one centralized platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Link href="/auth/register">Register</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full border-[#E5E5E5] px-8 py-6 text-base font-medium text-[#111111] hover:bg-[#F5F5F5] transition-all duration-200"
              >
                <Link href="/auth/login">Login</Link>
              </Button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <DashboardIllustration />
          </div>
        </div>
      </div>
    </section>
  );
}
