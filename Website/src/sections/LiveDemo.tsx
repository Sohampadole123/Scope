import { useEffect, useState, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Eye, EyeOff, User, Activity } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import TrackingMap from '../components/Map';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

interface Detection {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  color: string;
}

const cameras = [
  { id: 'cam1', name: 'SAC', video: '/vid1.mp4' },
  { id: 'cam2', name: 'Cafeteria', video: '/vid2.mp4' },
  { id: 'cam3', name: 'LHC', video: '/vid3.mp4' },
  { id: 'cam4', name: 'Chenab entrance', video: '/vid4.mp4' },
];

const mockDetections: Record<string, Detection[]> = {
  cam1: [
    { id: 'P001', x: 25, y: 35, width: 12, height: 25, confidence: 0.97, color: '#ff6b35' },
    { id: 'P002', x: 55, y: 40, width: 10, height: 22, confidence: 0.94, color: '#3b82f6' },
    { id: 'P003', x: 70, y: 38, width: 11, height: 24, confidence: 0.91, color: '#10b981' },
    { id: 'P002', x: 55, y: 40, width: 10, height: 22, confidence: 0.94, color: '#3b82f6' },

  ],
  cam2: [
    { id: 'P001', x: 30, y: 45, width: 8, height: 20, confidence: 0.89, color: '#ff6b35' },
    { id: 'P004', x: 60, y: 50, width: 9, height: 21, confidence: 0.93, color: '#8b5cf6' },
  ],
  cam3: [
    { id: 'P002', x: 40, y: 35, width: 10, height: 23, confidence: 0.90, color: '#3b82f6' },
    { id: 'P005', x: 65, y: 40, width: 11, height: 25, confidence: 0.88, color: '#f59e0b' },
    { id: 'P00', x: 70, y: 38, width: 11, height: 24, confidence: 0.91, color: '#10b981' },
    { id: 'P006', x: 40, y: 35, width: 10, height: 23, confidence: 0.96, color: '#3b82f6' },
    { id: 'P007', x: 65, y: 40, width: 11, height: 25, confidence: 0.88, color: '#f59e0b' },
    { id: 'P008', x: 70, y: 38, width: 11, height: 24, confidence: 0.84, color: '#10b981' },
    { id: 'P009', x: 55, y: 40, width: 10, height: 22, confidence: 0.94, color: '#3b82f6' },
    { id: 'P005', x: 70, y: 38, width: 11, height: 24, confidence: 0.91, color: '#10b981' },
    { id: 'P003', x: 55, y: 40, width: 10, height: 22, confidence: 0.93, color: '#3b82f6' },
    { id: 'P002', x: 55, y: 40, width: 10, height: 22, confidence: 0.96, color: '#3b82f6' },
    { id: 'P007', x: 70, y: 38, width: 11, height: 24, confidence: 0.91, color: '#10b981' },
    { id: 'P001', x: 55, y: 40, width: 10, height: 22, confidence: 0.94, color: '#3b82f6' },
  ],
  cam4: [
    { id: 'P003', x: 35, y: 42, width: 9, height: 19, confidence: 0.92, color: '#10b981' },
    { id: 'P006', x: 55, y: 45, width: 10, height: 21, confidence: 0.85, color: '#ec4899' },
    { id: 'P003', x: 55, y: 40, width: 10, height: 22, confidence: 0.93, color: '#3b82f6' },
    { id: 'P002', x: 55, y: 40, width: 10, height: 22, confidence: 0.96, color: '#3b82f6' },
    { id: 'P007', x: 70, y: 38, width: 11, height: 24, confidence: 0.91, color: '#10b981' },
    { id: 'P001', x: 55, y: 40, width: 10, height: 22, confidence: 0.94, color: '#3b82f6' },
  ],
};

const eventLog = [
  { time: '14:32:15', event: 'Person P001 entered Camera 1', type: 'entry' },
  { time: '14:32:28', event: 'Person P001 matched across cameras', type: 'match' },
  { time: '14:33:02', event: 'Person P002 entered Camera 3', type: 'entry' },
  { time: '14:33:45', event: 'New person detected: P007', type: 'new' },
  { time: '14:34:12', event: 'Person P001 exited Camera 2', type: 'exit' },
];

export default function LiveDemo() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState([1]);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [stats, setStats] = useState({ activeIDs: 7, fps: 45, processingTime: 12 });

  // Live clock for CCTV timestamp
  const [clock, setClock] = useState(new Date());



  // Per-camera detection count (fluctuating)
  const [camCounts, setCamCounts] = useState<Record<string, number>>({});

  // Update clock every second
  useEffect(() => {
    const iv = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Fluctuate per-cam detection counts
  useEffect(() => {
    if (!isVisible) return;
    const iv = setInterval(() => {
      setCamCounts(() => {
        const c: Record<string, number> = {};
        cameras.forEach(cam => {
          const base = mockDetections[cam.id]?.length || 0;
          c[cam.id] = base + Math.floor(Math.random() * 3) - 1;
        });
        return c;
      });
    }, 800);
    return () => clearInterval(iv);
  }, [isVisible]);


  // Simulate stats updates
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setStats(prev => ({
        activeIDs: Math.max(5, Math.min(12, prev.activeIDs + Math.floor(Math.random() * 3) - 1)),
        fps: Math.max(40, Math.min(50, prev.fps + Math.floor(Math.random() * 5) - 2)),
        processingTime: Math.max(8, Math.min(16, prev.processingTime + Math.floor(Math.random() * 3) - 1)),
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <section
      id="demo"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div
            className={`section-label transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
          >
            Live Demo
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
              }`}
            style={{ transitionDelay: '100ms' }}
          >
            See It <span className="text-gradient">In Action</span>
          </h2>
        </div>

        {/* Demo Container */}
        <div
          className={`transition-all duration-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          style={{ transitionDelay: '200ms' }}
        >
          {/* Stats Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 glass rounded-xl">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-orange-500" />
                <span className="text-white/60 text-sm">Active IDs:</span>
                <span className="text-white font-bold">{stats.activeIDs}</span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-500" />
                <span className="text-white/60 text-sm">FPS:</span>
                <span className="text-white font-bold">{stats.fps}</span>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-white/60 text-sm">Processing:</span>
                <span className="text-white font-bold">{stats.processingTime}ms</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-500 text-sm font-medium">LIVE</span>
            </div>
          </div>

          {/* Split View: Cameras & Map */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

            {/* Camera Grid (Left Side) */}
            <div className="grid grid-cols-2 gap-2 h-full">
              {cameras.map((camera, index) => (
                <div
                  key={camera.id}
                  className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${activeCamera === camera.id
                      ? 'border-orange-500 scale-[1.02] shadow-glow'
                      : 'border-white/10 hover:border-white/30'
                    }`}
                  onClick={() => setActiveCamera(activeCamera === camera.id ? null : camera.id)}
                  style={{
                    animationDelay: `${200 + index * 100}ms`,
                  }}
                >
                  {/* Video Loading Skeleton */}
                  <div className="absolute inset-0 bg-white/5 animate-pulse flex items-center justify-center z-0">
                    <div className="w-8 h-8 rounded-full border-2 border-white/10 border-t-orange-500/60 animate-spin" />
                  </div>
                  <video
                    src={camera.video}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="auto"
                    aria-label={`Live surveillance feed from ${camera.name}`}
                    className="w-full h-full object-cover relative z-[1] transition-opacity duration-300"
                    style={{ opacity: 0 }}
                    onCanPlay={(e) => { (e.target as HTMLVideoElement).style.opacity = '1'; }}
                  />

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  {/* Camera Label */}
                  <div className="absolute top-3 left-3 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white/80 z-[3]">
                    {camera.name}
                  </div>

                  {/* Live CCTV Timestamp */}
                  <div className="absolute bottom-3 left-3 z-[3] font-mono text-[10px] text-white/60 bg-black/50 px-1.5 py-0.5 rounded">
                    {clock.toLocaleDateString('en-GB')} {clock.toLocaleTimeString('en-GB')}
                  </div>

                  {/* Per-camera detection count */}
                  <div className="absolute bottom-3 right-3 z-[3] font-mono text-[10px] bg-black/60 backdrop-blur-sm px-2 py-1 rounded flex items-center gap-1.5">
                    <User className="w-3 h-3 text-orange-400" />
                    <span className="text-white/80">{camCounts[camera.id] ?? mockDetections[camera.id]?.length ?? 0} detected</span>
                  </div>


                  {/* Recording Indicator */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 z-[3]">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-xs text-white/60 font-mono">REC</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Tracking Map (Right side on large screens) */}
            <div className="h-full min-h-[400px] lg:min-h-full rounded-xl overflow-hidden border-2 border-white/10 relative">
              <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm rounded text-xs text-white/80 border border-white/10 shadow-lg">
                Live Tracking Map (Simulated)
              </div>
              <div className="absolute inset-0 z-0">
                <TrackingMap active={isVisible} />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="glass rounded-xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Playback Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${isPlaying
                      ? 'bg-orange-500 hover:bg-orange-600 shadow-glow'
                      : 'bg-white/10 hover:bg-white/20'
                    }`}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 text-white" />
                  ) : (
                    <Play className="w-5 h-5 text-white ml-0.5" />
                  )}
                </button>
                <button
                  onClick={() => setIsPlaying(false)}
                  className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors"
                >
                  <RotateCcw className="w-4 h-4 text-white/60" />
                </button>
              </div>

              {/* Speed Control */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/60">Speed:</span>
                <Slider
                  value={playbackSpeed}
                  onValueChange={setPlaybackSpeed}
                  max={4}
                  min={0.5}
                  step={0.5}
                  className="w-24"
                />
                <span className="text-sm text-white font-mono w-8">{playbackSpeed[0]}x</span>
              </div>


            </div>
          </div>

          {/* Event Log */}
          <div className="mt-6 glass rounded-xl p-4">
            <h4 className="text-sm font-semibold text-white mb-3">Recent Events</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-hide">
              {eventLog.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="text-white/40 font-mono text-xs">{event.time}</span>
                  <span
                    className={`w-2 h-2 rounded-full ${event.type === 'entry'
                        ? 'bg-green-500'
                        : event.type === 'exit'
                          ? 'bg-red-500'
                          : event.type === 'match'
                            ? 'bg-blue-500'
                            : 'bg-orange-500'
                      }`}
                  />
                  <span className="text-white/70">{event.event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
