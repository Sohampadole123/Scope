import { useEffect, useState } from 'react';
import { Eye, Route, Fingerprint, Layers, Search, CheckCircle } from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const pipelineSteps = [
  {
    icon: Eye,
    title: 'Detection',
    description: 'YOLOv8 detects persons in each frame with bounding boxes and confidence scores',
    details: 'State-of-the-art object detection using YOLOv8 architecture optimized with TensorRT for real-time inference on GPU.',
    color: '#ff6b35',
  },
  {
    icon: Route,
    title: 'Tracking',
    description: 'ByteTrack associates detections across frames using motion and appearance cues',
    details: 'Multi-object tracking with Kalman filtering and Hungarian assignment for robust track maintenance.',
    color: '#3b82f6',
  },
  {
    icon: Fingerprint,
    title: 'Embedding',
    description: 'OSNet extracts 128-dimensional appearance embeddings for each tracklet',
    details: 'Lightweight re-identification network that captures discriminative person features invariant to pose and lighting.',
    color: '#8b5cf6',
  },
  {
    icon: Layers,
    title: 'Tracklet Creation',
    description: 'Aggregate embeddings into representative tracklet descriptors',
    details: 'Temporal pooling and quality-weighted aggregation to create robust tracklet signatures.',
    color: '#10b981',
  },
  {
    icon: Search,
    title: 'Global Matching',
    description: 'FAISS indexes enable fast similarity search across all tracklets',
    details: 'GPU-accelerated nearest neighbor search for real-time matching across camera networks.',
    color: '#f59e0b',
  },
  {
    icon: CheckCircle,
    title: 'ID Assignment',
    description: 'Hungarian algorithm assigns global IDs for optimal matching',
    details: 'Combinatorial optimization ensures maximum confidence identity assignments across the entire system.',
    color: '#ec4899',
  },
];

export default function Pipeline() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);
  const [activeStep, setActiveStep] = useState(0);

  // Auto-advance through steps
  useEffect(() => {
    if (!isVisible) return;
    
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % pipelineSteps.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isVisible]);

  return (
    <section
      id="pipeline"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-dark-900/30 to-black" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`section-label transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            System Pipeline
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            How It <span className="text-gradient">Works</span>
          </h2>
        </div>

        {/* Pipeline Visualization */}
        <div
          className={`transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '300ms' }}
        >
          {/* Progress Bar */}
          <div className="relative mb-12">
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${((activeStep + 1) / pipelineSteps.length) * 100}%` }}
              />
            </div>
            
            {/* Step Indicators */}
            <div className="flex justify-between mt-4">
              {pipelineSteps.map((step, index) => (
                <button
                  key={step.title}
                  onClick={() => setActiveStep(index)}
                  className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                    index <= activeStep ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index === activeStep
                        ? 'bg-orange-500 scale-110 shadow-glow'
                        : index < activeStep
                        ? 'bg-orange-500/50'
                        : 'bg-white/10'
                    }`}
                  >
                    <step.icon className="w-5 h-5 text-white" />
                  </div>
                  <span className={`text-xs font-medium hidden sm:block transition-colors duration-300 ${
                    index === activeStep ? 'text-orange-500' : 'text-white/50'
                  }`}>
                    {step.title}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Step Display */}
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Visual Representation */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-dark-900 border border-white/10">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-500 ${
                    index === activeStep ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                  }`}
                >
                  <div className="text-center p-8">
                    <div
                      className="w-24 h-24 rounded-2xl mx-auto mb-6 flex items-center justify-center animate-pulse-glow"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-12 h-12" style={{ color: step.color }} />
                    </div>
                    <div className="text-6xl font-bold text-white/5 absolute inset-0 flex items-center justify-center">
                      0{index + 1}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Animated border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/30 animate-pulse" />
            </div>

            {/* Step Details */}
            <div className="space-y-6">
              {pipelineSteps.map((step, index) => (
                <div
                  key={step.title}
                  className={`transition-all duration-500 ${
                    index === activeStep
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 translate-x-10 absolute pointer-events-none'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${step.color}20` }}
                    >
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </div>
                    <div>
                      <div className="text-sm text-white/50 font-mono">STEP 0{index + 1}</div>
                      <h3 className="text-2xl font-bold text-white">{step.title}</h3>
                    </div>
                  </div>
                  <p className="text-lg text-white/80 mb-4">{step.description}</p>
                  <p className="text-white/50">{step.details}</p>
                </div>
              ))}
            </div>
          </div>

          {/* All Steps Overview */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {pipelineSteps.map((step, index) => (
              <div
                key={step.title}
                onClick={() => setActiveStep(index)}
                className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                  index === activeStep
                    ? 'bg-orange-500/10 border-orange-500/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <step.icon
                  className={`w-6 h-6 mb-2 transition-colors duration-300 ${
                    index === activeStep ? 'text-orange-500' : 'text-white/40'
                  }`}
                />
                <div className="text-sm font-medium text-white">{step.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
