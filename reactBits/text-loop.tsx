'use client'
import type {CSSProperties} from 'react'
import React from 'react'


type TextLoopProps = {
  text: string
  speed?: number // seconds
  className?: string
}

export function TextLoop({
  text,
  speed = 12,
  className = '',
}: TextLoopProps) {
  const trackStyle = {'--text-loop-duration': `${speed}s`} as CSSProperties

  return (
    <div
      className={[
        'relative w-full overflow-hidden',
        '[mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]',
        className,
      ].join(' ')}
    >
      <div
        className="text-loop-track flex w-max whitespace-nowrap [backface-visibility:hidden] [transform:translate3d(0,0,0)]"
        style={trackStyle}
      >
        {/* First copy */}
        <span className="pe-2 text-sm font-medium tracking-wide">
          {text}
        </span>

        {/* Second copy (required for seamless loop) */}
        <span
          className="pe-2 text-sm font-medium tracking-wide"
          aria-hidden
        >
          {text}
        </span>
      </div>
    </div>
  )
}
