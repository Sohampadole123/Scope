import { ScanEye, Github, Twitter, Linkedin, Mail } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { scrollToSection } from '@/lib/scroll';

const footerLinks = {
  product: [
    { label: 'Features', href: '#features' },
    { label: 'Demo', href: '#demo' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Results', href: '#results' },
  ],
  resources: [
    { label: 'Documentation', href: '#features' },
    { label: 'API Reference', href: '#architecture' },
    { label: 'GitHub', href: 'https://github.com' },
    { label: 'Tech Stack', href: '#techstack' },
  ],
  company: [
    { label: 'About', href: '#about' },
    { label: 'Results', href: '#results' },
    { label: 'Demo', href: '#demo' },
  ],
  legal: [
    { label: 'Privacy Policy', href: '#' },
    { label: 'Terms of Use', href: '#' },
  ],
};

const socialLinks = [
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: Mail, href: 'mailto:contact@reid.ai', label: 'Email' },
];

export default function Footer() {
  const { ref: footerRef, isVisible } = useScrollReveal(0.1);

  return (
    <footer
      ref={footerRef}
      className="relative py-16 overflow-hidden border-t border-white/5"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Section */}
        <div
          className={`grid grid-cols-2 md:grid-cols-6 gap-8 mb-12 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Brand */}
          <div className="col-span-2">
            <a href="#hero" onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }} className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                <ScanEye className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">
                Re-<span className="text-orange-500">ID</span>
              </span>
            </a>
            <p className="text-white/50 text-sm max-w-xs mb-6">
              Advanced multi-camera person re-identification system for intelligent surveillance networks.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-orange-500/20 hover:text-orange-500 transition-all duration-300"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => { e.preventDefault(); scrollToSection(link.href); }}
                    className="text-sm text-white/50 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Resources</h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    target={link.href.startsWith('http') ? '_blank' : undefined}
                    rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-sm text-white/50 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={link.href.startsWith('#') ? (e) => { e.preventDefault(); scrollToSection(link.href); } : undefined}
                    className="text-sm text-white/50 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/50 hover:text-orange-500 transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div
          className={`pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          <p className="text-sm text-white/40">
            © {new Date().getFullYear()} Re-ID System. All rights reserved.
          </p>
          <p className="text-sm text-white/40">
            Built with precision for production deployments.
          </p>
        </div>
      </div>
    </footer>
  );
}
