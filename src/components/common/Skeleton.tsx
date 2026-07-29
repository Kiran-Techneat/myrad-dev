import type { CSSProperties } from 'react';

interface Props {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  /** Render as a block element (adds bottom margin spacing when stacked). */
  block?: boolean;
  style?: CSSProperties;
  className?: string;
}

/** Lightweight shimmer placeholder used while data is loading. */
export function Skeleton({ width, height = 14, radius = 6, block, style, className }: Props) {
  return (
    <span
      className={`skel${block ? ' skel-block' : ''}${className ? ` ${className}` : ''}`}
      style={{ width, height, borderRadius: radius, ...style }}
    />
  );
}
