import { useEffect, useRef, type CSSProperties } from 'react';

export interface HalftoneRevealProps {
  src: string;
  fit?: 'contain' | 'cover';
  mode?: 'mono' | 'duotone' | 'color';
  shape?: 'dot' | 'ellipse' | 'square' | 'diamond' | 'line' | 'cross';
  cellSize?: number;
  angle?: number;
  dotScale?: number;
  inkColor?: string;
  paperColor?: string;
  contrast?: number;
  brightness?: number;
  invert?: boolean;
  roughness?: number;
  revealRadius?: number;
  softness?: number;
  linger?: number;
  reverse?: boolean;
  wander?: boolean;
  clickBurst?: boolean;
  intro?: boolean;
  className?: string;
  style?: CSSProperties;
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const lumaCache = new Map<string, number>();

function colorLuma(color: string) {
  const cached = lumaCache.get(color);
  if (cached !== undefined) return cached;
  const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!probe) return 0;
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  const luma = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 255;
  lumaCache.set(color, luma);
  return luma;
}

const HalftoneReveal = ({
  src,
  fit = 'contain',
  cellSize = 6,
  angle = 45,
  dotScale = 1,
  inkColor = '#f4f1ea',
  paperColor = '#120f17',
  contrast = 1.1,
  brightness = 0,
  invert = false,
  roughness = 0,
  revealRadius = 160,
  linger = 1.2,
  reverse = false,
  intro = true,
  className = '',
  style
}: HalftoneRevealProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const settingsRef = useRef({ fit, cellSize, angle, dotScale, inkColor, paperColor, contrast, brightness, invert, roughness, revealRadius, linger, reverse, intro });
  settingsRef.current = { fit, cellSize, angle, dotScale, inkColor, paperColor, contrast, brightness, invert, roughness, revealRadius, linger, reverse, intro };

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d', { alpha: true });
    if (!container || !canvas || !context) return undefined;
    canvas.style.opacity = '0';

    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });
    const printCanvas = document.createElement('canvas');
    const printContext = printCanvas.getContext('2d', { alpha: true });
    const image = new Image();
    image.decoding = 'async';
    image.crossOrigin = 'anonymous';

    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, inside: false, lastActive: 0, burstAt: 0 };
    let sampleData: Uint8ClampedArray | null = null;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let imageRect = { x: 0, y: 0, width: 0, height: 0 };
    let loadedAt = 0;
    let printCacheKey = '';
    let raf = 0;
    let alive = true;
    let lastFrame = 0;

    const updateDimensions = () => {
      const bounds = container.getBoundingClientRect();
      width = bounds.width;
      height = bounds.height;
      if (width <= 0 || height <= 0) return;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const pixelWidth = Math.max(1, Math.round(width * dpr));
      const pixelHeight = Math.max(1, Math.round(height * dpr));
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
      sampleCanvas.width = pixelWidth;
      sampleCanvas.height = pixelHeight;
      printCanvas.width = pixelWidth;
      printCanvas.height = pixelHeight;
      printCacheKey = '';

      if (image.naturalWidth > 0 && sampleContext) {
        const scale = (settingsRef.current.fit === 'cover' ? Math.max : Math.min)(width / image.naturalWidth, height / image.naturalHeight);
        imageRect = {
          x: (width - image.naturalWidth * scale) / 2,
          y: (height - image.naturalHeight * scale) / 2,
          width: image.naturalWidth * scale,
          height: image.naturalHeight * scale
        };
        sampleContext.setTransform(dpr, 0, 0, dpr, 0, 0);
        sampleContext.fillStyle = settingsRef.current.paperColor;
        sampleContext.fillRect(0, 0, width, height);
        sampleContext.drawImage(image, imageRect.x, imageRect.y, imageRect.width, imageRect.height);
        try {
          sampleData = sampleContext.getImageData(0, 0, pixelWidth, pixelHeight).data;
        } catch {
          sampleData = null;
        }
      }
      if (!pointer.lastActive) {
        pointer.x = pointer.targetX = width / 2;
        pointer.y = pointer.targetY = height / 2;
      }
      wake();
    };

    const drawImageFallback = () => {
      if (!context || !image.naturalWidth) return;
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
      canvas.style.opacity = '1';
    };

    const drawHalftone = (now: number) => {
      if (!sampleData || !image.naturalWidth || !context) {
        drawImageFallback();
        return;
      }

      const settings = settingsRef.current;
      const cell = clamp(settings.cellSize, 2, 80);
      const radians = (settings.angle * Math.PI) / 180;
      const cosine = Math.cos(radians);
      const sine = Math.sin(radians);
      const pixelWidth = canvas.width;
      const pixelHeight = canvas.height;
      const paperLuma = colorLuma(settings.paperColor);
      const inkLuma = colorLuma(settings.inkColor);
      const span = inkLuma - paperLuma;
      const introProgress = settings.intro && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? clamp((now - loadedAt) / 1500, 0, 1)
        : 1;
      const extent = Math.hypot(width, height) / 2 + cell;
      const cacheKey = [canvas.width, canvas.height, cell, settings.angle, settings.dotScale, settings.inkColor, settings.paperColor, settings.contrast, settings.brightness, settings.invert, settings.roughness].join(':');

      if (introProgress >= 1 && printCacheKey === cacheKey) {
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(printCanvas, 0, 0);
        return;
      }

      const targetContext = introProgress >= 1 ? printContext : context;
      if (!targetContext) return;
      targetContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      targetContext.clearRect(0, 0, width, height);
      targetContext.save();
      targetContext.translate(width / 2, height / 2);
      targetContext.rotate(radians);
      targetContext.fillStyle = settings.paperColor;

      for (let v = -extent; v < extent; v += cell) {
        for (let u = -extent; u < extent; u += cell) {
          const localX = u + cell / 2;
          const localY = v + cell / 2;
          const x = width / 2 + localX * cosine - localY * sine;
          const y = height / 2 + localX * sine + localY * cosine;
          const sampleX = Math.round(x * dpr);
          const sampleY = Math.round(y * dpr);
          if (sampleX < 0 || sampleY < 0 || sampleX >= pixelWidth || sampleY >= pixelHeight) continue;

          const pixel = (sampleY * pixelWidth + sampleX) * 4;
          if (sampleData[pixel + 3] < 8) continue;
          const luma = (sampleData[pixel] * 0.2126 + sampleData[pixel + 1] * 0.7152 + sampleData[pixel + 2] * 0.0722) / 255;
          let coverage = Math.abs(span) < 0.02 ? 1 - luma : (luma - paperLuma) / span;
          coverage = clamp((coverage - 0.5) * settings.contrast + 0.5 + settings.brightness, 0, 1);
          if (settings.invert) coverage = 1 - coverage;

          const seed = Math.sin(sampleX * 12.9898 + sampleY * 78.233) * 43758.5453;
          const variation = 1 + (seed - Math.floor(seed) - 0.5) * settings.roughness * 0.22;
          let radius = Math.min(cell * 0.42, Math.sqrt(coverage) * cell * 0.32 * settings.dotScale * variation);
          const distance = Math.hypot((x - width / 2) / Math.max(width, height), (y - height / 2) / Math.max(width, height));
          const delay = distance * 2.3 + ((seed - Math.floor(seed)) * 0.08);
          const grow = smoothstep(clamp((introProgress * 1.65 - delay) / 0.45, 0, 1));
          radius *= grow;
          if (radius < 0.2) continue;
          targetContext.globalAlpha = (0.06 + coverage * 0.12) * grow;
          targetContext.beginPath();
          targetContext.arc(localX, localY, radius, 0, Math.PI * 2);
          targetContext.fill();
        }
      }
      targetContext.restore();
      if (introProgress >= 1) {
        printCacheKey = cacheKey;
        context.setTransform(1, 0, 0, 1, 0, 0);
        context.drawImage(printCanvas, 0, 0);
      }
      canvas.style.opacity = '1';
    };

    const drawReveal = (presence: number, revealX: number, revealY: number, revealSize: number) => {
      if (!context || presence <= 0) return;
      const radius = Math.max(1, revealSize * dpr);
      const gradient = context.createRadialGradient(revealX * dpr, revealY * dpr, 0, revealX * dpr, revealY * dpr, radius);
      const alpha = settingsRef.current.reverse ? 1 - presence : presence;
      gradient.addColorStop(0, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(0.78, `rgba(255,255,255,${alpha})`);
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      context.save();
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.globalCompositeOperation = 'destination-out';
      context.fillStyle = gradient;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.restore();
    };

    const render = (now: number) => {
      raf = 0;
      if (!alive || document.hidden || width <= 0 || height <= 0) return;

      const settings = settingsRef.current;
      const dt = lastFrame ? Math.min(0.05, (now - lastFrame) / 1000) : 1 / 60;
      lastFrame = now;
      const follow = 1 - Math.exp(-dt / 0.035);
      pointer.x += (pointer.targetX - pointer.x) * follow;
      pointer.y += (pointer.targetY - pointer.y) * follow;

      const lingerMs = Math.max(0, settings.linger * 1000);
      const age = now - pointer.lastActive;
      let presence = pointer.inside ? 1 : lingerMs > 0 ? clamp(1 - age / lingerMs, 0, 1) : 0;
      let revealSize = Math.max(0, settings.revealRadius);
      if (pointer.burstAt) {
        const burstProgress = clamp((now - pointer.burstAt) / 900, 0, 1);
        revealSize += Math.hypot(width, height) * burstProgress;
        presence *= 1 - burstProgress;
        if (burstProgress >= 1) pointer.burstAt = 0;
      }

      drawHalftone(now);
      drawReveal(presence, pointer.x, pointer.y, revealSize);

      const introRunning = settings.intro && now - loadedAt < 1500 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (pointer.inside || presence > 0.01 || pointer.burstAt || introRunning) raf = requestAnimationFrame(render);
      else lastFrame = 0;
    };

    function wake() {
      if (alive && !raf && !document.hidden) raf = requestAnimationFrame(render);
    }

    const onPointerMove = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      pointer.targetX = event.clientX - bounds.left;
      pointer.targetY = event.clientY - bounds.top;
      pointer.inside = true;
      pointer.lastActive = performance.now();
      wake();
    };
    const onPointerLeave = () => {
      pointer.inside = false;
      pointer.lastActive = performance.now();
      wake();
    };
    const onPointerDown = (event: PointerEvent) => {
      onPointerMove(event);
      pointer.burstAt = performance.now();
      wake();
    };
    const onVisibility = () => {
      lastFrame = 0;
      wake();
    };
    const onImageLoad = () => {
      loadedAt = performance.now();
      updateDimensions();
      wake();
    };

    const resizeObserver = new ResizeObserver(updateDimensions);
    resizeObserver.observe(container);
    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerenter', onPointerMove, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });
    container.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    image.addEventListener('load', onImageLoad);
    image.src = src;
    if (image.complete && image.naturalWidth) onImageLoad();
    updateDimensions();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerenter', onPointerMove);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('visibilitychange', onVisibility);
      image.removeEventListener('load', onImageLoad);
    };
  }, [src]);

  return (
    <div
      ref={containerRef}
      className={['relative h-full w-full overflow-hidden', className].filter(Boolean).join(' ')}
      style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', ...style }}
    >
      <img
        className={['absolute inset-0 block h-full w-full', fit === 'cover' ? 'object-cover' : 'object-contain'].join(' ')}
        src={src}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', objectFit: fit }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full opacity-0 transition-opacity duration-300"
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0, display: 'block', width: '100%', height: '100%', opacity: 0, pointerEvents: 'none' }}
      />
    </div>
  );
};

export default HalftoneReveal;
