'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

function DashboardIllustration() {
  return (
    <div className="relative w-full max-w-[600px] mx-auto" aria-hidden="true">
      <div className="rounded-2xl border bg-card text-card-foreground shadow-xl overflow-hidden">
        <div className="flex items-center gap-1.5 px-4 py-3 border-b bg-muted">
          <div className="h-3 w-3 rounded-full bg-border" />
          <div className="h-3 w-3 rounded-full bg-border" />
          <div className="h-3 w-3 rounded-full bg-border" />
        </div>

        <div className="flex">
          <div className="w-2/5 border-r border-border p-3 space-y-2">
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-muted">
              <div className="h-2 w-2 rounded-full bg-primary" />
              <div className="flex-1">
                <div className="h-2.5 w-24 rounded bg-foreground/10" />
                <div className="h-2 w-16 rounded bg-foreground/5 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <div className="flex-1">
                <div className="h-2.5 w-20 rounded bg-foreground/10" />
                <div className="h-2 w-14 rounded bg-foreground/5 mt-1" />
              </div>
            </div>
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <div className="h-2 w-2 rounded-full bg-success" />
              <div className="flex-1">
                <div className="h-2.5 w-28 rounded bg-foreground/10" />
                <div className="h-2 w-12 rounded bg-foreground/5 mt-1" />
              </div>
            </div>
          </div>

          <div className="flex-1 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 w-32 rounded bg-foreground/10" />
                <div className="h-2.5 w-20 rounded bg-foreground/5 mt-1" />
              </div>
              <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2 py-0.5 text-[10px] font-medium text-primary">
                Open
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-border flex-shrink-0" />
                <div className="flex-1">
                  <div className="rounded-xl bg-muted px-3 py-2">
                    <div className="h-2 w-32 rounded bg-foreground/10" />
                    <div className="h-2 w-24 rounded bg-foreground/5 mt-1" />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <div className="flex-1">
                  <div className="rounded-xl bg-primary/5 px-3 py-2">
                    <div className="h-2 w-28 rounded bg-foreground/10" />
                    <div className="h-2 w-20 rounded bg-foreground/5 mt-1" />
                  </div>
                </div>
                <div className="h-6 w-6 rounded-full bg-border flex-shrink-0" />
              </div>
            </div>

            <div className="flex items-center gap-2 border-t pt-2">
              <div className="h-6 w-6 rounded-full bg-border flex-shrink-0" />
              <div className="h-2.5 flex-1 rounded-full bg-muted" />
              <div className="h-6 w-6 rounded bg-primary/10 flex items-center justify-center">
                <div className="h-3 w-3 rounded bg-primary/30" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-3 -right-3 h-full w-full rounded-2xl border bg-card/50 -z-10" />
    </div>
  );
}

export default function Hero() {
  return (
    <section id="hero" className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Customer Support{' '}
              <span className="text-primary">Made Simple</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0">
              Manage customer support tickets, communicate with your team, and resolve customer issues
              from one centralized platform.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-base font-medium shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Link href="/auth/register">Register</Link>
              </Button>
              <Button
                variant="outline"
                asChild
                size="lg"
                className="w-full sm:w-auto rounded-full px-8 py-6 text-base font-medium text-foreground hover:bg-accent transition-all duration-200"
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
