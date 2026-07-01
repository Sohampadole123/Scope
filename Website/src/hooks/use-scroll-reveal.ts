import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook that triggers a one-time visibility state change
 * when an element enters the viewport via IntersectionObserver.
 * Replaces ~15 lines of boilerplate per section.
 */
export function useScrollReveal(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
