"use client";

/**
 * SwipeNav – touch swipe navigation for image galleries on mobile.
 *
 * Usage:
 *   <SwipeNav count={images.length} index={current} onSwipe={setCurrent}>
 *     {images.map((img, i) => <img key={i} src={img} />)}
 *   </SwipeNav>
 */

import React, { useCallback, useRef, useState } from "react";

interface SwipeNavProps {
  count: number;
  index: number;
  onSwipe: (next: number) => void;
  children: React.ReactNode;
  className?: string;
  /** Minimum horizontal swipe distance to trigger navigation (px) */
  threshold?: number;
}

export function SwipeNav({
  count,
  index,
  onSwipe,
  children,
  className = "",
  threshold = 50,
}: SwipeNavProps) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const [swiping, setSwiping] = useState(false);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    setSwiping(true);
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!swiping || startX.current === null || startY.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      const dy = e.changedTouches[0].clientY - startY.current;

      // Only fire if horizontal movement dominates
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) >= threshold) {
        if (dx < 0 && index < count - 1) {
          onSwipe(index + 1); // swipe left → next
        } else if (dx > 0 && index > 0) {
          onSwipe(index - 1); // swipe right → prev
        }
      }

      startX.current = null;
      startY.current = null;
      setSwiping(false);
    },
    [swiping, index, count, onSwipe, threshold]
  );

  return (
    <div
      className={`relative overflow-hidden touch-pan-y ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Swipeable gallery"
    >
      {children}
      {/* Dot indicator */}
      {count > 1 && (
        <div
          className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none"
          aria-label={`Slide ${index + 1} of ${count}`}
        >
          {Array.from({ length: count }).map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-5 bg-attention-500"
                  : "w-1.5 bg-white/30"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
