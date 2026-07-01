import { useEffect, useRef, useState } from 'react';
import { TrendingUp, Users, Zap, Camera } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';

const performanceData = [
  { frame: 0, idf1: 85, switches: 45 },
  { frame: 100, idf1: 88, switches: 38 },
  { frame: 200, idf1: 90, switches: 32 },
  { frame: 300, idf1: 91, switches: 28 },
  { frame: 400, idf1: 92, switches: 25 },
  { frame: 500, idf1: 93, switches: 24 },
  { frame: 600, idf1: 94, switches: 23 },
  { frame: 700, idf1: 94.5, switches: 23 },
];

const fpsData = [
  { cameras: 1, fps: 60 },
  { cameras: 4, fps: 58 },
  { cameras: 8, fps: 55 },
  { cameras: 16, fps: 52 },
  { cameras: 32, fps: 48 },
  { cameras: 64, fps: 45 },
  { cameras: 128, fps: 42 },
];

const datasetData = {
  duke: [
    { metric: 'IDF1', value: 94.5 },
    { metric: 'IDP', value: 95.2 },
    { metric: 'IDR', value: 93.8 },
    { metric: 'MOTA', value: 91.3 },
  ],
  mot17: [
    { metric: 'IDF1', value: 88.2 },
    { metric: 'IDP', value: 89.5 },
    { metric: 'IDR', value: 86.9 },
    { metric: 'MOTA', value: 84.7 },
  ],
  market1501: [
    { metric: 'Rank-1', value: 96.8 },
    { metric: 'Rank-5', value: 98.5 },
    { metric: 'mAP', value: 89.2 },
    { metric: 'mINP', value: 76.4 },
  ],
};

const metrics = [
  {
    icon: TrendingUp,
    label: 'IDF1 Score',
    value: 94.5,
    suffix: '%',
    description: 'Identity F1 score on DukeMTMC',
    color: '#ff6b35',
  },
  {
    icon: Users,
    label: 'ID Switches',
    value: 23,
    suffix: '',
    description: 'Per sequence average',
    color: '#3b82f6',
  },
  {
    icon: Zap,
    label: 'Processing Speed',
    value: 45,
    suffix: ' FPS',
    description: 'Real-time inference',
    color: '#10b981',
  },
  {
    icon: Camera,
    label: 'Camera Support',
    value: Infinity,
    suffix: '',
    display: 'Unlimited',
    description: 'Horizontal scaling',
    color: '#8b5cf6',
  },
];

function AnimatedNumber({ value, suffix, duration = 1500 }: { value: number; suffix: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            setDisplayValue(value * easeOut);
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return (
    <span ref={ref}>
      {value % 1 === 0 ? Math.round(displayValue) : displayValue.toFixed(1)}
      {suffix}
    </span>
  );
}

export default function Results() {
  const { ref: sectionRef, isVisible } = useScrollReveal(0.1);

  return (
    <section
      id="results"
      ref={sectionRef}
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-black" />
      <div className="absolute inset-0 bg-gradient-radial opacity-20" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div
            className={`section-label transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            Results & Evaluation
          </div>
          <h2
            className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 transition-all duration-600 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            Proven <span className="text-gradient">Performance</span>
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`glass rounded-2xl p-6 transition-all duration-600 hover:-translate-y-2 hover:shadow-glow ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`}
              style={{ transitionDelay: `${200 + index * 100}ms` }}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: `${metric.color}20` }}
              >
                <metric.icon className="w-6 h-6" style={{ color: metric.color }} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-1">
                {metric.display ? (
                  metric.display
                ) : (
                  <AnimatedNumber value={metric.value} suffix={metric.suffix} />
                )}
              </div>
              <div className="text-sm text-white/60 mb-1">{metric.label}</div>
              <div className="text-xs text-white/40">{metric.description}</div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div
          className={`transition-all duration-800 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
          style={{ transitionDelay: '600ms' }}
        >
          <Tabs defaultValue="performance" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3 mb-8">
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="scalability">Scalability</TabsTrigger>
              <TabsTrigger value="datasets">Datasets</TabsTrigger>
            </TabsList>

            <TabsContent value="performance">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Performance Over Time</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id="colorIdf1" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff6b35" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ff6b35" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="frame" stroke="#666" tickFormatter={(v) => `${v}f`} />
                      <YAxis stroke="#666" domain={[80, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="idf1"
                        stroke="#ff6b35"
                        fillOpacity={1}
                        fill="url(#colorIdf1)"
                        name="IDF1 Score"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scalability">
              <div className="glass rounded-2xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">FPS vs Camera Count</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={fpsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="cameras" stroke="#666" tickFormatter={(v) => `${v}`} />
                      <YAxis stroke="#666" domain={[30, 70]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a0a0a',
                          border: '1px solid #333',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#fff' }}
                        formatter={(value: number) => [`${value} FPS`, 'Processing Speed']}
                        labelFormatter={(label: number) => `${label} Cameras`}
                      />
                      <Line
                        type="monotone"
                        dataKey="fps"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ fill: '#10b981', strokeWidth: 2 }}
                        name="FPS"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="datasets">
              <div className="grid md:grid-cols-3 gap-4">
                {Object.entries(datasetData).map(([dataset, data]) => (
                  <div key={dataset} className="glass rounded-2xl p-6">
                    <h3 className="text-lg font-semibold text-white mb-4 capitalize">
                      {dataset === 'duke' ? 'DukeMTMC' : dataset === 'mot17' ? 'MOT17' : 'Market1501'}
                    </h3>
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} stroke="#666" />
                          <YAxis dataKey="metric" type="category" stroke="#666" width={60} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#0a0a0a',
                              border: '1px solid #333',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [`${value}%`]}
                          />
                          <Bar
                            dataKey="value"
                            fill="#8b5cf6"
                            radius={[0, 4, 4, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </section>
  );
}
