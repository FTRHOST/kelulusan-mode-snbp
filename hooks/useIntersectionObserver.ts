import { useState, useEffect, useRef, RefObject } from 'react';

interface IntersectionObserverOptions {
  threshold?: number | number[];
  root?: Element | null;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useIntersectionObserver(
  options: IntersectionObserverOptions = {}
): [RefObject<HTMLDivElement>, boolean] {
  const { threshold = 0.1, root = null, rootMargin = '0px', triggerOnce = true } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);
  const targetRef = useRef<HTMLDivElement>(null); // Renamed ref to targetRef for clarity

  useEffect(() => {
    const currentRef = targetRef.current; // Capture ref.current
    if (!currentRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(currentRef);
          }
        } else {
          if (!triggerOnce) {
            setIsIntersecting(false);
          }
        }
      },
      { threshold, root, rootMargin }
    );

    observer.observe(currentRef);

    return () => {
      observer.unobserve(currentRef);
    };
  }, [targetRef, threshold, root, rootMargin, triggerOnce]); // Added targetRef to dependency array

  return [targetRef, isIntersecting];
}
