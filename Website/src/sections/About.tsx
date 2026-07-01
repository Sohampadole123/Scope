import { Check, Link2, Zap, Infinity, Shield } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const features = [
  {
    icon: Link2,
    text: 'Cross-camera identity linking with 99%+ accuracy',
  },
  {
    icon: Zap,
    text: 'Real-time processing on edge devices',
  },
  {
    icon: Infinity,
    text: 'Scalable to unlimited camera networks',
  },
  {
    icon: Shield,
    text: 'Privacy-preserving embedding technology',
  },
];

export default function About() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.2);

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-900/50 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            {/* Section Label */}
            <div
              className={`section-label transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              About The System
            </div>

            {/* Title */}
            <h2
              className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              What Does This <span className="text-gradient">System Do?</span>
            </h2>

            {/* Description */}
            <p
              className={`text-lg text-white/70 mb-8 leading-relaxed transition-all duration-600 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
              style={{ transitionDelay: '200ms' }}
            >
              Our Re-ID system solves the critical challenge of maintaining person identity 
              across multiple camera feeds. Using advanced deep learning embeddings and 
              similarity search, it tracks individuals seamlessly as they move through 
              different camera zones, enabling comprehensive surveillance and behavioral analysis.
            </p>

            {/* Features List */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 group transition-all duration-600 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'
                  }`}
                  style={{ transitionDelay: `${400 + index * 100}ms` }}
                >
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center transition-all duration-300 group-hover:bg-orange-500/20 group-hover:scale-110">
                    <feature.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <span className="text-white/80 group-hover:text-white transition-colors">
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Image */}
          <div
            className={`order-1 lg:order-2 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-x-0 rotate-0' : 'opacity-0 translate-x-20 rotate-3'
            }`}
            style={{ transitionDelay: '300ms' }}
          >
            <div className="relative perspective-1000">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02]">
                <img
                  src="/about-dashboard.jpg"
                  alt="Re-ID System Dashboard"
                  className="w-full h-auto"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-orange-500/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-orange-500/10 blur-2xl" />

              {/* Floating badge */}
              <div
                className={`absolute -bottom-6 -left-6 glass rounded-xl p-4 transition-all duration-700 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{ transitionDelay: '800ms' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">System Status</div>
                    <div className="text-xs text-white/50">Operational</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
