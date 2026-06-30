'use client';

import SectionWrapper from './SectionWrapper';

function DashboardScreenshot() {
  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow-xl overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b bg-muted">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-border" />
          <div className="h-3 w-3 rounded-full bg-border" />
          <div className="h-3 w-3 rounded-full bg-border" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-lg bg-background px-4 py-1.5 border">
          <div className="h-3 w-3 rounded bg-primary" />
          <span className="text-xs text-muted-foreground">app.coder71.com</span>
        </div>
      </div>

      <div className="flex h-[420px]">
        <div className="w-64 border-r border-border bg-card p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 rounded bg-foreground/10" />
            <div className="h-6 w-6 rounded bg-primary/10" />
          </div>
          {[
            { label: 'Login page not loading', status: 'Open', color: '#ED1C24' },
            { label: 'Invoice #1234', status: 'In Progress', color: '#d97706' },
            { label: 'Account setup help', status: 'Resolved', color: '#16a34a' },
            { label: 'Feature request', status: 'Open', color: '#ED1C24' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border p-3 transition-colors hover:bg-muted/50 cursor-pointer"
            >
              <div className="h-3 w-full rounded bg-foreground/10 mb-2" />
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-16 rounded bg-foreground/5" />
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    backgroundColor: `${item.color}10`,
                    color: item.color,
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-5 space-y-4 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <div className="h-5 w-48 rounded bg-foreground/10" />
                <div className="mt-1.5 h-3 w-32 rounded bg-foreground/5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-card bg-border"
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">3 agents</span>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { side: 'left', lines: 2 },
                { side: 'right', lines: 3 },
                { side: 'left', lines: 1 },
              ].map((msg, i) => (
                <div
                  key={i}
                  className={`flex gap-2.5 ${msg.side === 'right' ? 'justify-end' : ''}`}
                >
                  {msg.side === 'left' && (
                    <div className="h-7 w-7 rounded-full bg-border flex-shrink-0 mt-1" />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[70%] ${
                      msg.side === 'right'
                        ? 'bg-primary/5 rounded-tr-sm'
                        : 'bg-muted rounded-tl-sm'
                    }`}
                  >
                    <div className="h-2.5 w-32 rounded bg-foreground/10 mb-1.5" />
                    {msg.lines > 1 && (
                      <div className="h-2.5 w-24 rounded bg-foreground/5" />
                    )}
                  </div>
                  {msg.side === 'right' && (
                    <div className="h-7 w-7 rounded-full bg-border flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t p-4">
            <div className="flex items-center gap-2 rounded-xl border bg-card px-4 py-2.5">
              <div className="h-2.5 flex-1 rounded bg-foreground/5" />
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded bg-foreground/10" />
                <div className="h-4 w-4 rounded bg-foreground/10" />
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
                  <div className="h-3 w-3 rotate-45 border-l-2 border-t-2 border-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPreview() {
  return (
    <section id="dashboard" className="py-20 md:py-28 bg-muted">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
              A clean dashboard at your fingertips
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Everything you need to manage support tickets in one place.
            </p>
          </div>
        </SectionWrapper>

        <SectionWrapper className="mt-12">
          <DashboardScreenshot />
        </SectionWrapper>
      </div>
    </section>
  );
}
