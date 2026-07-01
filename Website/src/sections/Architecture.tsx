import { useState } from 'react';
import { 
  Video, 
  Scan, 
  Route, 
  Fingerprint, 
  Database, 
  Monitor,
  ArrowRight,
  Check
} from 'lucide-react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const architectureModules = [
  {
    id: 'ingestion',
    icon: Video,
    title: 'Video Ingestion',
    description: 'RTSP/HTTP stream ingestion with buffering and frame preprocessing',
    details: [
      'Multi-protocol stream support (RTSP, RTMP, HTTP)',
      'Adaptive buffering for network jitter handling',
      'Hardware-accelerated decoding (NVDEC, VAAPI)',
      'Frame normalization and format conversion',
    ],
    position: { x: 10, y: 50 },
    color: '#3b82f6',
  },
  {
    id: 'detection',
    icon: Scan,
    title: 'Detection Engine',
    description: 'YOLOv8 with TensorRT optimization for real-time inference',
    details: [
      'YOLOv8 architecture with custom training',
      'TensorRT FP16/INT8 quantization',
      'Batch inference for multiple cameras',
      'NMS optimization with CUDA kernels',
    ],
    position: { x: 30, y: 25 },
    color: '#ff6b35',
  },
  {
    id: 'tracking',
    icon: Route,
    title: 'Tracking Core',
    description: 'ByteTrack with Kalman filtering for robust multi-object tracking',
    details: [
      'ByteTrack association algorithm',
      'Kalman filter for motion prediction',
      'Re-identification for track recovery',
      'Occlusion handling and track merging',
    ],
    position: { x: 30, y: 75 },
    color: '#10b981',
  },
  {
    id: 'embedding',
    icon: Fingerprint,
    title: 'Embedding Network',
    description: 'OSNet for lightweight appearance feature extraction',
    details: [
      'OSNet-AIN with omni-scale features',
      '128-dimensional embedding vectors',
      'Domain adaptation for camera networks',
      'Batch processing for efficiency',
    ],
    position: { x: 55, y: 50 },
    color: '#8b5cf6',
  },
  {
    id: 'matcher',
    icon: Database,
    title: 'Global Matcher',
    description: 'FAISS + Hungarian algorithm for optimal identity assignment',
    details: [
      'FAISS GPU index for similarity search',
      'Hungarian algorithm for assignment',
      'Temporal and spatial gating',
      'Confidence threshold management',
    ],
    position: { x: 75, y: 35 },
    color: '#f59e0b',
  },
  {
    id: 'visualization',
    icon: Monitor,
    title: 'Visualization',
    description: 'Real-time dashboard and alert system',
    details: [
      'WebSocket streaming for live updates',
      'Interactive camera grid interface',
      'Event logging and search',
      'RESTful API for integrations',
    ],
    position: { x: 75, y: 65 },
    color: '#ec4899',
  },
];

const connections = [
  { from: 'ingestion', to: 'detection' },
  { from: 'ingestion', to: 'tracking' },
  { from: 'detection', to: 'tracking' },
  { from: 'tracking', to: 'embedding' },
  { from: 'embedding', to: 'matcher' },
  { from: 'matcher', to: 'visualization' },
];

export default function Architecture() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [hoveredModule, setHoveredModule] = useState<string | null>(null);

  const getModuleById = (id: string) => architectureModules.find(m => m.id === id);

  return (
    <section
      id="architecture"
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
            System Architecture
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Built for <span className="text-gradient">Scale</span>
          </h2>
        </div>

        {/* Architecture Diagram */}
        <div
          className={`relative transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* SVG Connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {connections.map((conn, index) => {
              const from = getModuleById(conn.from);
              const to = getModuleById(conn.to);
              if (!from || !to) return null;

              const isActive = hoveredModule === conn.from || hoveredModule === conn.to ||
                               selectedModule === conn.from || selectedModule === conn.to;

              return (
                <line
                  key={index}
                  x1={from.position.x}
                  y1={from.position.y}
                  x2={to.position.x}
                  y2={to.position.y}
                  stroke={isActive ? '#ff6b35' : '#333'}
                  strokeWidth={isActive ? 0.5 : 0.3}
                  strokeDasharray={isActive ? undefined : '2,2'}
                  className="transition-all duration-300"
                />
              );
            })}
          </svg>

          {/* Module Cards */}
          <div className="relative aspect-[16/10] md:aspect-[2/1]">
            {architectureModules.map((module, index) => (
              <div
                key={module.id}
                className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                  isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
                }`}
                style={{
                  left: `${module.position.x}%`,
                  top: `${module.position.y}%`,
                  transitionDelay: `${400 + index * 100}ms`,
                }}
              >
                <button
                  onClick={() => setSelectedModule(selectedModule === module.id ? null : module.id)}
                  onMouseEnter={() => setHoveredModule(module.id)}
                  onMouseLeave={() => setHoveredModule(null)}
                  className={`group relative p-4 md:p-6 rounded-xl border transition-all duration-300 ${
                    selectedModule === module.id
                      ? 'bg-dark-900/90 border-orange-500 shadow-glow scale-110'
                      : hoveredModule === module.id
                      ? 'bg-dark-900/80 border-white/30 scale-105'
                      : 'bg-dark-900/50 border-white/10 hover:border-white/20'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center mb-2 md:mb-3 transition-all duration-300"
                    style={{
                      backgroundColor: `${module.color}20`,
                      boxShadow: hoveredModule === module.id || selectedModule === module.id
                        ? `0 0 20px ${module.color}40`
                        : undefined,
                    }}
                  >
                    <module.icon
                      className="w-5 h-5 md:w-6 md:h-6"
                      style={{ color: module.color }}
                    />
                  </div>

                  {/* Title */}
                  <h3 className="text-xs md:text-sm font-semibold text-white whitespace-nowrap">
                    {module.title}
                  </h3>

                  {/* Selection indicator */}
                  {selectedModule === module.id && (
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-orange-500" />
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {selectedModule && (
            <div className="mt-8 glass rounded-2xl p-6 animate-scale-in">
              {(() => {
                const module = getModuleById(selectedModule);
                if (!module) return null;
                return (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${module.color}20` }}
                        >
                          <module.icon className="w-6 h-6" style={{ color: module.color }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{module.title}</h3>
                          <p className="text-white/50 text-sm">{module.description}</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white/60 mb-3">Key Features</h4>
                      <ul className="space-y-2">
                        {module.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                            <Check className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Legend */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 rounded-full bg-orange-500" />
              <span>Per-Camera Processing</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span>Global Identity Engine</span>
            </div>
            <ArrowRight className="w-4 h-4 text-white/30" />
            <div className="flex items-center gap-2 text-sm text-white/50">
              <div className="w-3 h-3 rounded-full bg-pink-500" />
              <span>Visualization Layer</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
