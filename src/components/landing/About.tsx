'use client';

import SectionWrapper from './SectionWrapper';

export default function About() {
  return (
    <section id="about" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionWrapper>
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111111]">
              About Coder71 Support
            </h2>
            <div className="mt-8 space-y-5 text-lg leading-relaxed text-[#4A4A4A]">
              <p>
                Coder71 Support helps businesses manage customer support requests efficiently through a
                centralized ticket management system.
              </p>
              <p>
                It simplifies communication between customers and support teams while keeping every
                conversation organized, trackable, and actionable.
              </p>
              <p>
                Built for teams that value clarity and speed, Coder71 Support ensures no request falls
                through the cracks.
              </p>
            </div>
          </div>
        </SectionWrapper>
      </div>
    </section>
  );
}
