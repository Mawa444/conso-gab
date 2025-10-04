/**
 * ============================================
 * LAZY IMAGE COMPONENT
 * ============================================
 * Chargement différé des images avec Intersection Observer
 * Affiche un placeholder pendant le chargement
 */

import { useState, useEffect, useRef, ImgHTMLAttributes } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  skeletonClassName?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyImage({
  src,
  alt,
  fallback = '/placeholder.svg',
  className,
  skeletonClassName,
  threshold = 0.01,
  rootMargin = '50px',
  ...props
}: LazyImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    // Intersection Observer pour détecter quand l'image entre dans le viewport
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(imgRef.current);

    return () => {
      observer.disconnect();
    };
  }, [threshold, rootMargin]);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  const handleError = () => {
    setError(true);
    setIsLoaded(true);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Skeleton pendant le chargement */}
      {!isLoaded && (
        <Skeleton 
          className={cn(
            "absolute inset-0 z-10",
            skeletonClassName
          )} 
        />
      )}

      {/* Image réelle */}
      <img
        ref={imgRef}
        src={isInView ? (error ? fallback : src) : undefined}
        alt={alt}
        className={cn(
          "transition-opacity duration-300",
          isLoaded ? "opacity-100" : "opacity-0",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        {...props}
      />
    </div>
  );
}

/**
 * ============================================
 * BACKGROUND IMAGE LAZY LOADER
 * ============================================
 */

interface LazyBackgroundProps {
  src: string;
  fallback?: string;
  children?: React.ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function LazyBackground({
  src,
  fallback,
  children,
  className,
  threshold = 0.01,
  rootMargin = '50px'
}: LazyBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [error, setError] = useState(false);
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!divRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(divRef.current);

    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  useEffect(() => {
    if (!isInView) return;

    const img = new Image();
    img.src = src;
    
    img.onload = () => setIsLoaded(true);
    img.onerror = () => {
      setError(true);
      setIsLoaded(true);
    };
  }, [isInView, src]);

  const backgroundImage = isLoaded 
    ? (error && fallback ? fallback : src)
    : undefined;

  return (
    <div
      ref={divRef}
      className={cn(
        "transition-opacity duration-300",
        isLoaded ? "opacity-100" : "opacity-0",
        className
      )}
      style={{
        backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined
      }}
    >
      {children}
    </div>
  );
}

/**
 * ============================================
 * IMAGE PRELOADER
 * ============================================
 */

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

export function preloadImages(sources: string[]): Promise<void[]> {
  return Promise.all(sources.map(preloadImage));
}
