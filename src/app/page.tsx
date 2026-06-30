import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifySession } from '@/lib/guards/auth.guard';
import Navbar from '@/components/landing/Navbar';
import Hero from '@/components/landing/Hero';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import About from '@/components/landing/About';
import DashboardPreview from '@/components/landing/DashboardPreview';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export default async function Home() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (sessionCookie) {
    try {
      const user = await verifySession(sessionCookie);
      if (user.role === 'client') {
        redirect('/portal');
      }
      redirect('/admin');
    } catch {
      // Session invalid — show landing page
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <About />
        <DashboardPreview />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
