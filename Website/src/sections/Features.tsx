import { useState } from 'react';
import { 
  Link2, 
  GitMerge, 
  Search, 
  Calculator, 
  Clock, 
  SlidersHorizontal
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const features = [
  {
    icon: Link2,
    title: 'Cross-Camera Identity Linking',
    description: 'Link the same person across multiple cameras with persistent global IDs that remain consistent throughout the entire surveillance network.',
    details: 'Our system uses deep metric learning to extract unique appearance features from each detected person. These embeddings are compared across all cameras in real-time, ensuring that the same individual receives the same global ID regardless of which camera they appear in. The system handles challenging scenarios including pose variations, lighting changes, and partial occlusions.',
    color: 'from-orange-500 to-orange-600',
  },
  {
    icon: GitMerge,
    title: 'Tracklet Aggregation',
    description: 'Combine short tracklets into complete trajectories using temporal coherence and appearance consistency.',
    details: 'Short-term tracklets from individual cameras are intelligently merged based on temporal proximity and appearance similarity. The system analyzes motion patterns and uses Kalman filtering to predict and connect fragmented tracks, creating complete person trajectories even through temporary occlusions or detection gaps.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    icon: Search,
    title: 'FAISS Similarity Search',
    description: 'Lightning-fast embedding search with GPU-accelerated FAISS index for millions of identities.',
    details: 'Facebook AI Similarity Search (FAISS) enables sub-millisecond nearest neighbor searches across millions of embeddings. Our GPU-accelerated implementation supports both exact and approximate search methods, allowing the system to scale from hundreds to millions of identities without sacrificing real-time performance.',
    color: 'from-purple-500 to-purple-600',
  },
  {
    icon: Calculator,
    title: 'Hungarian Global Assignment',
    description: 'Optimal ID assignment using the Hungarian algorithm for maximum accuracy in identity matching.',
    details: 'The Hungarian algorithm solves the assignment problem optimally, ensuring that global IDs are assigned to maximize overall matching confidence. This combinatorial optimization approach guarantees the best possible identity associations across all cameras and timeframes, minimizing ID switches and fragmentation.',
    color: 'from-green-500 to-green-600',
  },
  {
    icon: Clock,
    title: 'Time & Topology Gating',
    description: 'Smart filtering based on temporal and spatial constraints to eliminate impossible matches.',
    details: 'The system leverages camera topology and travel time constraints to filter out impossible identity matches. If a person is seen at Camera A at time T, they cannot appear at a distant Camera B at time T+1 second. These spatiotemporal gates dramatically reduce the search space and improve matching accuracy.',
    color: 'from-pink-500 to-pink-600',
  },
  {
    icon: SlidersHorizontal,
    title: 'Confidence Control & Memory',
    description: 'Dynamic threshold management with memory-based identity recovery for uncertain detections.',
    details: 'Adaptive confidence thresholds adjust based on scene complexity and detection quality. The system maintains a memory bank of past appearances, allowing it to recover identities after extended occlusions or when persons re-enter the camera network. Uncertain matches are flagged for human review rather than forced assignment.',
    color: 'from-yellow-500 to-yellow-600',
  },
];

export default function Features() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);
  const [selectedFeature, setSelectedFeature] = useState<typeof features[0] | null>(null);

  return (
    <section
      id="features"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`section-label transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Key Capabilities
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Powerful Features for <span className="text-gradient">Real-World Deployment</span>
          </h2>
          <p
            className={`text-lg text-white/60 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            Built with production-ready algorithms and optimized for performance at scale.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              onClick={() => setSelectedFeature(feature)}
              className={`group relative glass rounded-2xl p-6 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-glow ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ 
                transitionDelay: `${400 + index * 100}ms`,
                transform: isVisible ? `rotate(${index % 2 === 0 ? -1 : 1}deg)` : undefined,
              }}
            >
              {/* Gradient border on hover */}
              <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
              
              {/* Icon */}
              <div className={`relative w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-orange-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-white/60 text-sm leading-relaxed">
                {feature.description}
              </p>

              {/* Learn more link */}
              <div className="mt-4 flex items-center gap-2 text-orange-500 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span>Learn more</span>
                <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Detail Modal */}
      <Dialog open={!!selectedFeature} onOpenChange={() => setSelectedFeature(null)}>
        <DialogContent className="max-w-2xl bg-dark-900/95 backdrop-blur-xl border-white/10">
          <DialogHeader>
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${selectedFeature?.color} flex items-center justify-center mb-4`}>
              {selectedFeature && <selectedFeature.icon className="w-7 h-7 text-white" />}
            </div>
            <DialogTitle className="text-2xl font-bold text-white">
              {selectedFeature?.title}
            </DialogTitle>
            <DialogDescription className="text-white/60 text-base leading-relaxed">
              {selectedFeature?.details}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
