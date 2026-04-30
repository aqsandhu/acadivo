"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "./skeleton";

interface LazyImageProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  quality?: "high" | "low" | "none";
}

export function LazyImage({
  src,
  alt,
  className,
  placeholderClassName,
  quality = "high",
}: LazyImageProps) {
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
      { rootMargin: "100px" }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const imageSrc = quality === "low" ? `${src}?q=low` : quality === "none" ? "" : src;

  return (
    <div className={cn("relative overflow-hidden", placeholderClassName)}>
      {!isLoaded && <Skeleton className={cn("absolute inset-0", className)} />}
      {isInView ? (
        <img
          ref={imgRef}
          src={imageSrc}
          alt={alt}
          className={cn(className, !isLoaded && "opacity-0")}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      ) : (
        <div ref={imgRef} className={cn(className)} />
      )}
    </div>
  );
}
