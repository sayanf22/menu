import { useState, useRef, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  onClick?: () => void;
  priority?: boolean;
  onLoad?: () => void;
  onError?: () => void;
}

export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  onClick, 
  priority = false,
  onLoad,
  onError 
}: OptimizedImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
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

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const shouldLoad = priority || isInView;

  return (
    <div ref={imgRef} className="relative">
      {!isLoaded && !hasError && (
        <Skeleton className="w-full h-[500px] animate-pulse" />
      )}
      {hasError ? (
        <div className="w-full h-[500px] flex items-center justify-center bg-muted/20 text-muted-foreground">
          <div className="text-center">
            <p className="text-lg font-medium">Failed to load image</p>
            <p className="text-sm">Please try refreshing</p>
          </div>
        </div>
      ) : shouldLoad && (
        <img
          src={src}
          alt={alt}
          className={`transition-all duration-500 ${
            isLoaded ? 'opacity-100' : 'opacity-0 absolute'
          } ${className}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          onClick={onClick}
        />
      )}
    </div>
  );
};