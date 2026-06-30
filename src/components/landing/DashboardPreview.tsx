'use client';

import SectionWrapper from './SectionWrapper';

function DashboardScreenshot() {
  return (
    <div className="rounded-2xl border border-[#E5E5E5] bg-white shadow-xl overflow-hidden" aria-hidden="true">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#E5E5E5] bg-[#F5F5F5]">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
          <div className="h-3 w-3 rounded-full bg-[#E5E5E5]" />
        </div>
        <div className="mx-auto flex items-center gap-2 rounded-lg bg-white px-4 py-1.5 border border-[#E5E5E5]">
          <div className="h-3 w-3 rounded bg-[#ED1C24]" />
          <span className="text-xs text-[#4A4A4A]">app.coder71.com</span>
        </div>
      </div>

      <div className="flex h-[420px]">
        <div className="w-64 border-r border-[#E5E5E5] bg-white p-4 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <div className="h-4 w-24 rounded bg-[#111111]/10" />
            <div className="h-6 w-6 rounded bg-[#ED1C24]/10" />
          </div>
          {[
            { label: 'Login page not loading', status: 'Open', color: '#ED1C24' },
            { label: 'Invoice #1234', status: 'In Progress', color: '#d97706' },
            { label: 'Account setup help', status: 'Resolved', color: '#16a34a' },
            { label: 'Feature request', status: 'Open', color: '#ED1C24' },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#E5E5E5] p-3 transition-colors hover:bg-[#F5F5F5] cursor-pointer"
            >
              <div className="h-3 w-full rounded bg-[#111111]/10 mb-2" />
              <div className="flex items-center justify-between">
                <div className="h-2.5 w-16 rounded bg-[#111111]/5" />
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
                <div className="h-5 w-48 rounded bg-[#111111]/10" />
                <div className="mt-1.5 h-3 w-32 rounded bg-[#111111]/5" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-7 w-7 rounded-full border-2 border-white bg-[#E5E5E5]"
                    />
                  ))}
                </div>
                <span className="text-xs text-[#4A4A4A]">3 agents</span>
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
                    <div className="h-7 w-7 rounded-full bg-[#E5E5E5] flex-shrink-0 mt-1" />
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2.5 max-w-[70%] ${
                      msg.side === 'right'
                        ? 'bg-[#ED1C24]/5 rounded-tr-sm'
                        : 'bg-[#F5F5F5] rounded-tl-sm'
                    }`}
                  >
                    <div className="h-2.5 w-32 rounded bg-[#111111]/10 mb-1.5" />
                    {msg.lines > 1 && (
                      <div className="h-2.5 w-24 rounded bg-[#111111]/5" />
                    )}
                  </div>
                  {msg.side === 'right' && (
                    <div className="h-7 w-7 rounded-full bg-[#E5E5E5] flex-shrink-0 mt-1" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#E5E5E5] p-4">
            <div className="flex items-center gap-2 rounded-xl border border-[#E5E5E5] bg-white px-4 py-2.5">
              <div className="h-2.5 flex-1 rounded bg-[#111111]/5" />
              <div className="flex items-center gap-1.5">
                <div className="h-4 w-4 rounded bg-[#111111]/10" />
                <div className="h-4 w-4 rounded bg-[#111111]/10" />
                <div className="h-7 w-7 rounded-lg bg-[#ED1C24] flex items-center justify-center">
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
    <section id="dashboard" className="py-20 md:py-28 bg-[#F5F5F5]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              A clean dashboard at your fingertips
            </h2>
            <p className="mt-4 text-lg text-[#4A4A4A]">
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
