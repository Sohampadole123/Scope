import { useState } from 'react';
import { 
  Cpu, 
  Eye, 
  Route, 
  Fingerprint, 
  Database, 
  Zap,
  Code2,
  Server,
  Box,
  GitBranch,
  Layers,
  Workflow
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const technologies = [
  {
    icon: Eye,
    name: 'YOLOv8',
    category: 'Detection',
    description: 'State-of-the-art object detection with real-time performance',
    why: 'Best accuracy-speed tradeoff, excellent person detection',
    tradeoffs: 'Requires GPU for optimal performance',
  },
  {
    icon: Route,
    name: 'ByteTrack',
    category: 'Tracking',
    description: 'Robust multi-object tracking with motion and appearance cues',
    why: 'Handles occlusions well, low ID switches',
    tradeoffs: 'Computationally intensive for many objects',
  },
  {
    icon: Fingerprint,
    name: 'OSNet',
    category: 'Re-ID',
    description: 'Lightweight person re-identification network',
    why: 'Omni-scale features, small model size',
    tradeoffs: 'Lower accuracy than larger models',
  },
  {
    icon: Database,
    name: 'FAISS',
    category: 'Search',
    description: 'Facebook AI Similarity Search for fast embedding lookup',
    why: 'GPU acceleration, billion-scale search',
    tradeoffs: 'Memory intensive for large indexes',
  },
  {
    icon: Zap,
    name: 'TensorRT',
    category: 'Inference',
    description: 'NVIDIA inference optimizer for production deployment',
    why: '2-5x speedup, FP16/INT8 quantization',
    tradeoffs: 'NVIDIA GPU required, model conversion needed',
  },
  {
    icon: Code2,
    name: 'OpenCV',
    category: 'Vision',
    description: 'Computer vision operations and video processing',
    why: 'Mature, fast, extensive functionality',
    tradeoffs: 'API can be complex, some operations CPU-only',
  },
  {
    icon: Box,
    name: 'PyTorch',
    category: 'ML Framework',
    description: 'Deep learning framework for model development',
    why: 'Dynamic graphs, excellent debugging',
    tradeoffs: 'Slightly slower than TensorFlow in production',
  },
  {
    icon: Server,
    name: 'FastAPI',
    category: 'Backend',
    description: 'High-performance Python web framework',
    why: 'Async support, automatic API documentation',
    tradeoffs: 'Python GIL limitations',
  },
  {
    icon: Cpu,
    name: 'ONNX Runtime',
    category: 'Deployment',
    description: 'Cross-platform inference acceleration',
    why: 'Multi-platform support, graph optimizations',
    tradeoffs: 'Not all operators supported',
  },
  {
    icon: GitBranch,
    name: 'Git LFS',
    category: 'Version Control',
    description: 'Large file storage for model weights',
    why: 'Efficient model versioning',
    tradeoffs: 'Storage costs for large models',
  },
  {
    icon: Layers,
    name: 'Docker',
    category: 'Deployment',
    description: 'Containerization for consistent deployments',
    why: 'Reproducible environments, easy scaling',
    tradeoffs: 'Container overhead, image size',
  },
  {
    icon: Workflow,
    name: 'Kafka',
    category: 'Messaging',
    description: 'Distributed event streaming platform',
    why: 'High throughput, fault tolerance',
    tradeoffs: 'Operational complexity',
  },
];

const categories = ['All', 'Detection', 'Tracking', 'Re-ID', 'Search', 'Inference', 'Deployment'];

export default function TechStack() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [hoveredTech, setHoveredTech] = useState<string | null>(null);

  const filteredTechs = selectedCategory === 'All'
    ? technologies
    : technologies.filter(t => t.category === selectedCategory);

  return (
    <section
      id="techstack"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-900/30 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className={`section-label transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Technology Stack
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Built With <span className="text-gradient">Modern Tools</span>
          </h2>
        </div>

        {/* Category Filter */}
        <div
          className={`flex flex-wrap items-center justify-center gap-2 mb-12 transition-all duration-600 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-orange-500 text-white shadow-glow'
                  : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Tech Grid */}
        <TooltipProvider>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredTechs.map((tech, index) => (
              <Tooltip key={tech.name}>
                <TooltipTrigger asChild>
                  <div
                    onMouseEnter={() => setHoveredTech(tech.name)}
                    onMouseLeave={() => setHoveredTech(null)}
                    className={`group relative glass rounded-xl p-5 cursor-pointer transition-all duration-500 ${
                      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                    } ${hoveredTech === tech.name ? 'scale-105 shadow-glow' : ''}`}
                    style={{ transitionDelay: `${300 + index * 50}ms` }}
                  >
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center mb-4 transition-all duration-300 group-hover:bg-orange-500/20 group-hover:scale-110">
                      <tech.icon className="w-6 h-6 text-orange-500" />
                    </div>

                    {/* Content */}
                    <h3 className="text-lg font-semibold text-white mb-1">{tech.name}</h3>
                    <span className="text-xs text-white/40 uppercase tracking-wider">{tech.category}</span>

                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-xl bg-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="max-w-xs bg-dark-900/95 backdrop-blur-xl border-white/10 p-4"
                >
                  <div className="space-y-2">
                    <p className="text-white font-medium">{tech.description}</p>
                    <div className="pt-2 border-t border-white/10">
                      <p className="text-sm text-green-400">✓ {tech.why}</p>
                      <p className="text-sm text-orange-400 mt-1">⚠ {tech.tradeoffs}</p>
                    </div>
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>

        {/* Central Hub Visualization */}
        <div
          className={`mt-16 relative transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '800ms' }}
        >
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Central Hub */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-glow-lg animate-pulse-glow">
                <span className="text-2xl font-bold text-white">Re-ID</span>
              </div>

              {/* Orbiting dots */}
              <div className="absolute inset-0 -m-8">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-green-500 animate-bounce" style={{ animationDelay: '1s' }} />
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '1.5s' }} />
              </div>
            </div>
          </div>

          <p className="text-center text-white/40 text-sm mt-8 max-w-xl mx-auto">
            Each technology was carefully selected based on performance benchmarks, 
            community support, and production readiness. Hover over any tool to learn more.
          </p>
        </div>
      </div>
    </section>
  );
}
