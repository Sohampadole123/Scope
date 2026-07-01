import { useState, useEffect, useCallback } from 'react';
import { Menu, X, ScanEye } from 'lucide-react';
import { scrollToSection } from '@/lib/scroll';

const navItems = [
  { label: 'Home', href: '#hero' },
  { label: 'About', href: '#about' },
  { label: 'Features', href: '#features' },
  { label: 'Demo', href: '#demo' },
  { label: 'Architecture', href: '#architecture' },
  { label: 'Results', href: '#results' },
  { label: 'Tech Stack', href: '#techstack' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      // Determine active section
      const sections = navItems.map(item => item.href.slice(1));
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on ESC key
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsMobileMenuOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isMobileMenuOpen]);

  const handleNav = useCallback((href: string) => {
    scrollToSection(href);
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-xl border-b border-white/5'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <a
              href="#hero"
              onClick={(e) => {
                e.preventDefault();
                handleNav('#hero');
              }}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                <ScanEye className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white">
                Re-<span className="text-orange-500">ID</span>
              </span>
            </a>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNav(item.href);
                  }}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    activeSection === item.href.slice(1)
                      ? 'text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {item.label}
                  {activeSection === item.href.slice(1) && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                  )}
                </a>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:block">
              <button
                onClick={() => handleNav('#demo')}
                className="px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-lg transition-all duration-300 hover:bg-orange-600 hover:shadow-glow hover:scale-105 active:scale-95"
              >
                View Demo
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white transition-colors"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
      >
        <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setIsMobileMenuOpen(false)} />
        <div className="absolute top-20 left-0 right-0 p-6">
          <div className="flex flex-col gap-2">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  handleNav(item.href);
                }}
                className={`px-4 py-3 text-lg font-medium rounded-lg transition-all duration-300 ${
                  activeSection === item.href.slice(1)
                    ? 'bg-orange-500/20 text-orange-500'
                    : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                {item.label}
              </a>
            ))}
            <button
              onClick={() => handleNav('#demo')}
              className="mt-4 px-5 py-3 bg-orange-500 text-white font-medium rounded-lg transition-all duration-300 hover:bg-orange-600"
            >
              View Demo
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
