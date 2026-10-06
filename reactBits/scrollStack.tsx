'use client';

import React, { useLayoutEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';

export interface ScrollStackItemProps {
  itemClassName?: string;
  children: ReactNode;
}

export const ScrollStackItem: React.FC<ScrollStackItemProps> = ({ children, itemClassName = '' }) => (
  <div
    className={`scroll-stack-card relative w-full h-80 my-8 p-12 rounded-[40px] shadow-[0_0_30px_rgba(0,0,0,0.1)] box-border origin-top will-change-transform ${itemClassName}`.trim()}
    style={{
      backfaceVisibility: 'hidden',
      transformStyle: 'preserve-3d'
    }}
  >
    {children}
  </div>
);

interface ScrollStackProps {
  className?: string;
  children: ReactNode;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  grayscaleAmount?: number;
  useWindowScroll?: boolean;
  smoothness?: number;
  onStackComplete?: () => void;
}

interface CardTransform {
  translateY: number;
  scale: number;
  rotation: number;
  blur: number;
  grayscale: number;
}

const ScrollStack: React.FC<ScrollStackProps> = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  grayscaleAmount = 0,
  useWindowScroll = false,
  smoothness = 0.12,
  onStackComplete
}) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  const targetTransformsRef = useRef(new Map<number, CardTransform>());
  const currentTransformsRef = useRef(new Map<number, CardTransform>());
  const isLoopingRef = useRef(false);

  const cardCount = React.Children.count(children);
  const releaseSpace = Math.max(34, Math.round(cardCount * (itemStackDistance + 120)));

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  const getScrollData = useCallback(() => {
    if (useWindowScroll) {
      return {
        scrollTop: window.scrollY,
        containerHeight: window.innerHeight
      };
    }

    const scroller = scrollerRef.current;
    return {
      scrollTop: scroller ? scroller.scrollTop : 0,
      containerHeight: scroller ? scroller.clientHeight : 0
    };
  }, [useWindowScroll]);

  const getPageOffsetTop = useCallback((element: HTMLElement) => {
    let top = 0;
    let current: HTMLElement | null = element;

    while (current) {
      top += current.offsetTop;
      current = current.offsetParent as HTMLElement | null;
    }

    return top;
  }, []);

  const getElementOffset = useCallback(
    (element: HTMLElement) => {
      if (useWindowScroll) {
        return getPageOffsetTop(element);
      }
      return element.offsetTop;
    },
    [getPageOffsetTop, useWindowScroll]
  );

  const calculateTargets = useCallback(() => {
    if (!cardsRef.current.length) return;

    const { scrollTop, containerHeight } = getScrollData();
    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);

    const endElement = scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement | null;
    const endElementTop = endElement ? getElementOffset(endElement) : 0;
    const cardTops = cardsRef.current.map((card) => getElementOffset(card));

    let topCardIndex = 0;
    for (let j = 0; j < cardsRef.current.length; j++) {
      const jCardTop = cardTops[j];
      const jTriggerStart = jCardTop - stackPositionPx - itemStackDistance * j;
      if (scrollTop >= jTriggerStart) {
        topCardIndex = j;
      }
    }

    cardsRef.current.forEach((_, i) => {
      const cardTop = cardTops[i];
      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd = cardTop - scaleEndPositionPx;
      const pinStart = cardTop - stackPositionPx - itemStackDistance * i;
      const pinEnd = Math.max(pinStart + 1, endElementTop - stackPositionPx - itemStackDistance * i);

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale = baseScale + i * itemScale;
      const scale = 1 - scaleProgress * (1 - targetScale);
      const rotation = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount && i < topCardIndex) {
        const depthInStack = topCardIndex - i;
        blur = Math.max(0, depthInStack * blurAmount);
      }

      let grayscale = 0;
      if (grayscaleAmount && i < topCardIndex) {
        const depthInStack = topCardIndex - i;
        grayscale = Math.min(100, depthInStack * grayscaleAmount);
      }

      let translateY = 0;
      if (scrollTop >= pinStart) {
        const effectiveScrollTop = Math.min(scrollTop, pinEnd);
        translateY = effectiveScrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      }

      targetTransformsRef.current.set(i, {
        translateY: Math.round(translateY * 100) / 100,
        scale: Math.round(scale * 1000) / 1000,
        rotation: Math.round(rotation * 100) / 100,
        blur: Math.round(blur * 100) / 100,
        grayscale: Math.round(grayscale * 100) / 100
      });

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    rotationAmount,
    blurAmount,
    grayscaleAmount,
    onStackComplete,
    calculateProgress,
    parsePercentage,
    getScrollData,
    getElementOffset
  ]);

  const animationLoop = useCallback(() => {
    let needsNextFrame = false;

    cardsRef.current.forEach((card, i) => {
      const target = targetTransformsRef.current.get(i);
      const cur = currentTransformsRef.current.get(i) ?? { translateY: 0, scale: 1, rotation: 0, blur: 0, grayscale: 0 };
      if (!target) return;

      const next: CardTransform = {
        translateY: cur.translateY + (target.translateY - cur.translateY) * smoothness,
        scale:      cur.scale      + (target.scale      - cur.scale)      * smoothness,
        rotation:   cur.rotation   + (target.rotation   - cur.rotation)   * smoothness,
        blur:       cur.blur       + (target.blur        - cur.blur)       * smoothness,
        grayscale:  cur.grayscale  + (target.grayscale  - cur.grayscale)  * smoothness,
      };

      const settling =
        Math.abs(next.translateY - target.translateY) > 0.05 ||
        Math.abs(next.scale - target.scale) > 0.0005;

      if (settling) needsNextFrame = true;

      const transform = `translate3d(0, ${next.translateY}px, 0) scale(${next.scale}) rotate(${next.rotation}deg)`;
      const filterParts: string[] = [];
      if (next.blur > 0) filterParts.push(`blur(${next.blur}px)`);
      if (next.grayscale > 0) filterParts.push(`grayscale(${next.grayscale}%)`);

      card.style.transform = transform;
      card.style.filter = filterParts.join(' ');
      currentTransformsRef.current.set(i, next);
    });

    if (needsNextFrame) {
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    } else {
      isLoopingRef.current = false;
      animationFrameRef.current = null;
    }
  }, [smoothness]);

  const scheduleUpdate = useCallback(() => {
    calculateTargets();
    if (!isLoopingRef.current) {
      isLoopingRef.current = true;
      animationFrameRef.current = requestAnimationFrame(animationLoop);
    }
  }, [calculateTargets, animationLoop]);

  useLayoutEffect(() => {
    if (!scrollerRef.current) return;

    const cards = Array.from(scrollerRef.current.querySelectorAll('.scroll-stack-card')) as HTMLElement[];
    cardsRef.current = cards;
    const targetCache = targetTransformsRef.current;
    const currentCache = currentTransformsRef.current;

    cards.forEach((card, i) => {
      if (i < cards.length - 1) {
        card.style.marginBottom = `${itemDistance}px`;
      }
      card.style.willChange = 'transform, filter';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
      card.style.perspective = '1000px';
      card.style.webkitPerspective = '1000px';
    });

    const scrollTarget: Window | HTMLDivElement = useWindowScroll ? window : scrollerRef.current;
    scrollTarget.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);

    scheduleUpdate();

    return () => {
      scrollTarget.removeEventListener('scroll', scheduleUpdate as EventListener);
      window.removeEventListener('resize', scheduleUpdate);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      targetCache.clear();
      currentCache.clear();
      isLoopingRef.current = false;
    };
  }, [
    itemDistance,
    itemScale,
    itemStackDistance,
    stackPosition,
    scaleEndPosition,
    baseScale,
    scaleDuration,
    rotationAmount,
    blurAmount,
    grayscaleAmount,
    useWindowScroll,
    onStackComplete,
    scheduleUpdate
  ]);

  return (
    <div
      className={
        useWindowScroll
          ? `relative w-full overflow-visible ${className}`.trim()
          : `relative w-full h-full overflow-y-auto overflow-x-visible ${className}`.trim()
      }
      ref={scrollerRef}
      style={
        useWindowScroll
          ? undefined
          : {
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch',
              scrollBehavior: 'smooth',
              WebkitTransform: 'translateZ(0)',
              transform: 'translateZ(0)',
              willChange: 'scroll-position'
            }
      }
    >
      <div
        className="scroll-stack-inner min-h-screen px-4 pt-20"
        style={{ paddingBottom: `${releaseSpace}px` }}
      >
        {children}
        <div className="scroll-stack-end w-full h-px" />
      </div>
    </div>
  );
};

export default ScrollStack;
