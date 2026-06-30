'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'Contact', href: '#contact' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <nav
        className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8"
        aria-label="Global"
      >
        <Link href="/" className="flex items-center gap-2" aria-label="Coder71 Support Home">
          <span className="text-xl font-bold tracking-tight text-[#111111]">
            Coder<span className="text-[#ED1C24]">71</span>
          </span>
          <span className="hidden sm:inline text-sm font-medium text-[#4A4A4A] ml-1">Support</span>
        </Link>

        <div className="hidden lg:flex lg:items-center lg:gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-[#4A4A4A] hover:text-[#111111] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex lg:items-center lg:gap-3">
          <Button variant="outline" asChild className="rounded-full border-[#E5E5E5] text-sm font-medium">
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild className="rounded-full bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white text-sm font-medium shadow-sm">
            <Link href="/auth/register">Register</Link>
          </Button>
        </div>

        <button
          type="button"
          className="lg:hidden inline-flex items-center justify-center rounded-md p-2 text-[#4A4A4A] hover:text-[#111111]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out',
          mobileOpen ? 'max-h-80' : 'max-h-0'
        )}
      >
        <div className="space-y-2 px-6 pb-6 pt-2 border-t">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block text-sm font-medium text-[#4A4A4A] hover:text-[#111111] transition-colors py-2"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex flex-col gap-3 pt-4">
            <Button variant="outline" asChild className="w-full rounded-full border-[#E5E5E5]">
              <Link href="/auth/login" onClick={() => setMobileOpen(false)}>
                Login
              </Link>
            </Button>
            <Button asChild className="w-full rounded-full bg-[#ED1C24] hover:bg-[#ED1C24]/90 text-white shadow-sm">
              <Link href="/auth/register" onClick={() => setMobileOpen(false)}>
                Register
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
