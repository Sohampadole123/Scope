import { lazy, Suspense } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Features from './sections/Features';
import Footer from './sections/Footer';
import './App.css';

// Lazy load heavy sections (Recharts, Google Maps, etc.)
const Pipeline = lazy(() => import('./sections/Pipeline'));
const LiveDemo = lazy(() => import('./sections/LiveDemo'));
const Architecture = lazy(() => import('./sections/Architecture'));
const Results = lazy(() => import('./sections/Results'));
const TechStack = lazy(() => import('./sections/TechStack'));
const CTA = lazy(() => import('./sections/CTA'));

function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-32" role="status">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
        <span className="text-white/40 text-sm">Loading...</span>
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Skip-to-content link for keyboard/screen-reader users */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Navigation />
      <main id="main-content">
        <Hero />
        <ErrorBoundary>
          <About />
        </ErrorBoundary>
        <ErrorBoundary>
          <Features />
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Pipeline />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <LiveDemo />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Architecture />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <Results />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <TechStack />
          </Suspense>
        </ErrorBoundary>
        <ErrorBoundary>
          <Suspense fallback={<SectionLoader />}>
            <CTA />
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
    </div>
  );
}

export default App;
