import Link from 'next/link';

const quickLinks = [
  { label: 'Home', href: '#hero' },
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#contact' },
];

const legalLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
];

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-2" aria-label="Coder71 Support Home">
              <span className="text-xl font-bold tracking-tight">
                Coder<span className="text-[#ED1C24]">71</span>
              </span>
              <span className="text-sm font-medium text-white/60">Support</span>
            </Link>
            <p className="mt-4 text-sm text-white/50 leading-relaxed max-w-xs">
              A simple and powerful ticket management system for modern support teams.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/40 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold tracking-wider uppercase text-white/40 mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} Coder71. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <span className="text-white/20">|</span>
            <Link href="#" className="text-xs text-white/40 hover:text-white/60 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
