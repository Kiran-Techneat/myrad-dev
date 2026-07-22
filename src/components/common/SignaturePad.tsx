import { useEffect, useRef } from 'react';

interface Props {
  onDrawn: () => void;
  /** Bumping this key clears the canvas. */
  clearKey: number;
}

/** Canvas signature pad ported from the original pointer/touch handlers. */
export function SignaturePad({ onDrawn, clearKey }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const drawing = useRef(false);
  const drawnRef = useRef(false);

  useEffect(() => {
    const node = canvasRef.current;
    if (!node) return;
    const rect = node.getBoundingClientRect();
    if (!rect.width) return;
    const dpr = window.devicePixelRatio || 1;
    node.width = Math.max(1, Math.round(rect.width * dpr));
    node.height = Math.max(1, Math.round(rect.height * dpr));
    const ctx = node.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#26433D';
    ctxRef.current = ctx;
  }, []);

  // Clear when the parent bumps clearKey (skip the initial mount).
  const firstClear = useRef(true);
  useEffect(() => {
    if (firstClear.current) {
      firstClear.current = false;
      return;
    }
    const node = canvasRef.current;
    const ctx = ctxRef.current;
    if (node && ctx) {
      const rect = node.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);
    }
    drawnRef.current = false;
  }, [clearKey]);

  const pos = (clientX: number, clientY: number) => {
    const node = canvasRef.current!;
    const r = node.getBoundingClientRect();
    return { x: clientX - r.left, y: clientY - r.top };
  };

  const start = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    drawing.current = true;
    ctx.beginPath();
    const p = pos(x, y);
    ctx.moveTo(p.x, p.y);
  };
  const move = (x: number, y: number) => {
    const ctx = ctxRef.current;
    if (!drawing.current || !ctx) return;
    const p = pos(x, y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (!drawnRef.current) {
      drawnRef.current = true;
      onDrawn();
    }
  };

  return (
    <canvas
      ref={canvasRef}
      className="sigpad"
      onPointerDown={(e) => {
        e.preventDefault();
        (e.target as HTMLCanvasElement).setPointerCapture?.(e.pointerId);
        start(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (!drawing.current) return;
        e.preventDefault();
        move(e.clientX, e.clientY);
      }}
      onPointerUp={end}
      onPointerCancel={end}
    />
  );
}
