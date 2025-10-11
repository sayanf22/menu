import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  onLoad?: () => void;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  onClick, 
  priority = false,
  onLoad 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const shouldLoad = priority || isInView;

  return (
    <div ref={imgRef} className="relative">
      {!isLoaded && (
        <Skeleton className="w-full h-[500px] animate-pulse" />
      )}
      {shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0 absolute'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onClick={onClick}
        />
      )}
    </div>
  );
};