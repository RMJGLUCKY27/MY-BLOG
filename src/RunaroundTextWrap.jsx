import { useEffect, useRef, useState } from "react";
import "./RunaroundTextWrap.css";

const HIGHLIGHT_PATTERN = /(gimnasio|avanzado|cuidarme|mirar|tiempo|cambiando|conservar)/gi;

function getImagePlacements(width, images, positionOverrides = {}) {
  const compact = width < 560;
  const fractions = compact ? [0.44, 0.34, 0.48] : [0.34, 0.2, 0.34];
  const maxWidths = compact ? [180, 132, 190] : [285, 170, 285];
  const yPositions = compact ? [58, 470, 930] : [60, 520, 1050];

  return images.map((image, index) => {
    const imageWidth = Math.min(maxWidths[index] ?? 240, width * (fractions[index] ?? 0.3));
    const naturalWidth = image.element?.naturalWidth || 1;
    const naturalHeight = image.element?.naturalHeight || 1;
    const imageHeight = imageWidth * (naturalHeight / naturalWidth);
    let x = width / 2 - imageWidth / 2;

    if (index === 1) x = width - imageWidth - (compact ? 5 : 12);
    if (index === 2) x = compact ? 18 : 28;
    const override = positionOverrides[image.src];
    if (override) x = override.x;
    const y = override?.y ?? yPositions[index] ?? 60 + index * 480;

    return {
      ...image,
      x: Math.max(0, Math.min(width - imageWidth, x)),
      y: Math.max(0, y),
      width: imageWidth,
      height: imageHeight,
    };
  });
}

function mergeSpans(spans) {
  const sorted = spans
    .filter((span) => span.right > span.left)
    .sort((a, b) => a.left - b.left);
  const merged = [];

  for (const span of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && span.left <= previous.right) {
      previous.right = Math.max(previous.right, span.right);
    } else {
      merged.push({ ...span });
    }
  }

  return merged;
}

function getBlockedSpans(maskData, width, y, lineHeight, images, padding) {
  const spans = [];
  const firstRow = Math.max(0, Math.floor(y));
  const lastRow = Math.min(maskData.height, Math.ceil(y + lineHeight));

  for (const image of images) {
    const start = Math.max(firstRow, Math.floor(image.y));
    const end = Math.min(lastRow, Math.ceil(image.y + image.height));
    if (end <= start) continue;

    for (let row = start; row < end; row += 3) {
      const rowOffset = row * width * 4;
      let inSpan = false;
      let spanStart = 0;

      for (let x = Math.max(0, Math.floor(image.x)); x < Math.min(width, Math.ceil(image.x + image.width)); x += 2) {
        const occupied = maskData.data[rowOffset + x * 4 + 3] > 16;
        if (occupied && !inSpan) {
          inSpan = true;
          spanStart = x;
        } else if (!occupied && inSpan) {
          spans.push({ left: spanStart - padding, right: x + padding });
          inSpan = false;
        }
      }

      if (inSpan) {
        spans.push({ left: spanStart - padding, right: image.x + image.width + padding });
      }
    }
  }

  return mergeSpans(spans.map((span) => ({
    left: Math.max(0, span.left),
    right: Math.min(width, span.right),
  })));
}

function getAvailableRuns(width, blockedSpans, inset) {
  let runs = [{ left: inset, right: width - inset }];

  for (const block of blockedSpans) {
    runs = runs.flatMap((run) => {
      if (block.right <= run.left || block.left >= run.right) return [run];
      const next = [];
      if (block.left > run.left) next.push({ left: run.left, right: block.left });
      if (block.right < run.right) next.push({ left: block.right, right: run.right });
      return next;
    });
  }

  return runs.filter((run) => run.right - run.left >= 18);
}

function buildLines({ paragraphs, context, width, lineHeight, images, maskData, wrapPadding, inset }) {
  const lines = [];
  const paragraphGap = Math.round(lineHeight * 0.48);
  let y = 0;

  for (const paragraph of paragraphs) {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);
    let wordIndex = 0;

    while (wordIndex < words.length) {
      const blocked = maskData
        ? getBlockedSpans(maskData, width, y, lineHeight, images, wrapPadding)
        : [];
      const runs = getAvailableRuns(width, blocked, inset);
      const lineRuns = [];
      let placed = false;

      for (const run of runs) {
        if (wordIndex >= words.length) break;
        let lineText = "";

        while (wordIndex < words.length) {
          const candidate = lineText ? `${lineText} ${words[wordIndex]}` : words[wordIndex];
          if (context.measureText(candidate).width > run.right - run.left) break;
          lineText = candidate;
          wordIndex += 1;
        }

        if (lineText) {
          lineRuns.push({ text: lineText, x: run.left });
          placed = true;
        }
      }

      if (placed) lines.push({ y, runs: lineRuns });
      y += lineHeight;
    }

    y += paragraphGap;
  }

  return { lines, textHeight: y };
}

function renderLine(text) {
  return text.split(HIGHLIGHT_PATTERN).map((part, index) => {
    if (/^(gimnasio|avanzado|cuidarme|mirar|tiempo|cambiando|conservar)$/i.test(part)) {
      return <span className="runaround-highlight" key={index}>{part}</span>;
    }
    return part;
  });
}

export default function RunaroundTextWrap({ paragraphs, images, label = "Texto con imágenes alrededor" }) {
  const containerRef = useRef(null);
  const positionOverridesRef = useRef({});
  const dragStateRef = useRef(null);
  const computeLayoutRef = useRef(null);
  const reflowTimerRef = useRef(0);
  const [loadedImages, setLoadedImages] = useState([]);
  const [layout, setLayout] = useState({ lines: [], images: [], height: 0, fontSize: 17, lineHeight: 31 });

  useEffect(() => {
    let active = true;
    Promise.all(images.map((image) => new Promise((resolve) => {
      const element = new Image();
      element.onload = () => resolve({ ...image, element });
      element.onerror = () => resolve({ ...image, element: null });
      element.src = image.src;
      if (element.complete && element.naturalWidth) resolve({ ...image, element });
    }))).then((result) => {
      if (active) setLoadedImages(result);
    });

    return () => { active = false; };
  }, [images]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || loadedImages.length !== images.length) return undefined;

    let frame = 0;
    const compute = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = Math.max(1, Math.floor(container.clientWidth));
        const compact = width < 560;
        const fontSize = compact ? 15.5 : 17;
        const lineHeight = compact ? 27 : 31;
        const inset = compact ? 3 : 2;
        const placements = getImagePlacements(width, loadedImages, positionOverridesRef.current);
        const characterCount = paragraphs.reduce((count, paragraph) => count + paragraph.length, 0);
        const estimatedLines = Math.ceil(characterCount / Math.max(16, width / (fontSize * 0.53))) + paragraphs.length * 2 + 24;
        const maskHeight = Math.max(
          estimatedLines * lineHeight + 80,
          ...placements.map((image) => image.y + image.height + 80),
        );
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = width;
        maskCanvas.height = Math.ceil(maskHeight);
        const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
        let maskData = null;

        if (maskContext) {
          placements.forEach((image) => {
            if (image.element) maskContext.drawImage(image.element, image.x, image.y, image.width, image.height);
          });
          try {
            maskData = { data: maskContext.getImageData(0, 0, width, maskCanvas.height).data, height: maskCanvas.height };
          } catch {
            maskData = null;
          }
        }

        const measureCanvas = document.createElement("canvas");
        const context = measureCanvas.getContext("2d");
        if (!context) return;
        context.font = `400 ${fontSize}px Montserrat, sans-serif`;
        const { lines, textHeight } = buildLines({
          paragraphs,
          context,
          width,
          lineHeight,
          images: placements,
          maskData,
          wrapPadding: compact ? 10 : 14,
          inset,
        });
        const imageBottom = Math.max(0, ...placements.map((image) => image.y + image.height));
        setLayout({
          lines,
          images: placements,
          fontSize,
          lineHeight,
          height: Math.max(textHeight, imageBottom) + lineHeight * 0.8,
        });
      });
    };

    computeLayoutRef.current = compute;
    const observer = new ResizeObserver(compute);
    observer.observe(container);
    document.fonts?.ready.then(compute);
    compute();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      if (computeLayoutRef.current === compute) computeLayoutRef.current = null;
    };
  }, [images, loadedImages, paragraphs]);

  const scheduleReflow = () => {
    if (reflowTimerRef.current) return;
    reflowTimerRef.current = window.setTimeout(() => {
      reflowTimerRef.current = 0;
      computeLayoutRef.current?.();
    }, 70);
  };

  const setPhotoPosition = (image, x, y, reflow = true) => {
    const width = containerRef.current?.clientWidth ?? 0;
    const position = {
      x: Math.max(0, Math.min(Math.max(0, width - image.width), x)),
      y: Math.max(0, y),
    };
    positionOverridesRef.current = { ...positionOverridesRef.current, [image.src]: position };
    setLayout((current) => ({
      ...current,
      images: current.images.map((entry) => entry.src === image.src ? { ...entry, ...position } : entry),
      height: Math.max(current.height, position.y + image.height + 40),
    }));
    if (reflow) scheduleReflow();
  };

  const onPhotoPointerDown = (event, image) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStateRef.current = {
      pointerId: event.pointerId,
      image,
      startX: event.clientX,
      startY: event.clientY,
      imageX: image.x,
      imageY: image.y,
    };
  };

  const onPhotoPointerMove = (event) => {
    const drag = dragStateRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setPhotoPosition(
      drag.image,
      drag.imageX + event.clientX - drag.startX,
      drag.imageY + event.clientY - drag.startY,
    );
  };

  const finishPhotoDrag = (event) => {
    if (!dragStateRef.current || dragStateRef.current.pointerId !== event.pointerId) return;
    dragStateRef.current = null;
    if (reflowTimerRef.current) {
      window.clearTimeout(reflowTimerRef.current);
      reflowTimerRef.current = 0;
    }
    computeLayoutRef.current?.();
  };

  const onPhotoKeyDown = (event, image) => {
    const step = event.shiftKey ? 30 : 10;
    const current = positionOverridesRef.current[image.src] ?? { x: image.x, y: image.y };
    const directions = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    const delta = directions[event.key];
    if (!delta) return;
    event.preventDefault();
    setPhotoPosition(image, current.x + delta[0], current.y + delta[1], false);
    computeLayoutRef.current?.();
  };

  return (
    <div
      ref={containerRef}
      className="runaround-wrap"
      style={{ height: layout.height, fontSize: layout.fontSize, lineHeight: `${layout.lineHeight}px` }}
      role="region"
      aria-label={label}
    >
      <div className="runaround-sr-only">
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
      </div>

      <div aria-hidden="true" className="runaround-lines">
        {layout.lines.map((line, lineIndex) => (
          <div className="runaround-line" key={lineIndex} style={{ top: line.y }}>
            {line.runs.map((run, runIndex) => (
              <span className="runaround-line-run" key={runIndex} style={{ left: run.x }}>
                {renderLine(run.text)}
              </span>
            ))}
          </div>
        ))}
      </div>

      {layout.images.map((image) => image.element && (
        <figure
          className="runaround-photo"
          key={image.src}
          style={{ left: image.x, top: image.y, width: image.width, height: image.height }}
          tabIndex={0}
          role="group"
          aria-label={`${image.title}. Arrastra para mover; también puedes usar las flechas del teclado.`}
          onPointerDown={(event) => onPhotoPointerDown(event, image)}
          onPointerMove={onPhotoPointerMove}
          onPointerUp={finishPhotoDrag}
          onPointerCancel={finishPhotoDrag}
          onKeyDown={(event) => onPhotoKeyDown(event, image)}
        >
          <img src={image.src} alt={image.alt} draggable="false" />
          <figcaption className="runaround-photo-caption">
            <span className="runaround-photo-title">{image.title}</span>
            {image.subtitle && <span className="runaround-photo-subtitle">{image.subtitle}</span>}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
