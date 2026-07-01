import { ArrowRight, BookOpen, Github } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { scrollToSection } from '@/lib/scroll';

export default function CTA() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.2);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-orange-500/10" />
      
      {/* Animated shapes */}
      <div className="absolute top-1/4 left-10 w-64 h-64 rounded-full bg-orange-500/5 blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-orange-500/5 blur-3xl animate-float" style={{ animationDelay: '3s' }} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`glass rounded-3xl p-8 md:p-12 text-center transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Title */}
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Ready to Transform Your{' '}
            <span className="text-gradient">Surveillance?</span>
          </h2>

          {/* Subtitle */}
          <p
            className={`text-lg text-white/60 mb-10 max-w-2xl mx-auto transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            Experience the power of persistent identity tracking across your camera network. 
            Deploy in minutes, scale to thousands of cameras.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '400ms' }}
          >
            <button
              onClick={() => scrollToSection('#demo')}
              className="group flex items-center gap-2 px-8 py-4 bg-orange-500 text-white font-semibold rounded-xl transition-all duration-300 hover:bg-orange-600 hover:shadow-glow-lg hover:scale-105 active:scale-95"
            >
              View Live Demo
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
            <button className="flex items-center gap-2 px-8 py-4 bg-white/5 text-white font-semibold rounded-xl border border-white/10 transition-all duration-300 hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95">
              <BookOpen className="w-5 h-5" />
              View Documentation
            </button>
          </div>

          {/* GitHub Link */}
          <div
            className={`mt-8 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '500ms' }}
          >
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="text-sm">Star us on GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
