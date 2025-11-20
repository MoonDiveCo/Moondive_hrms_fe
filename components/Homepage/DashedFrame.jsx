import React, { useRef, useLayoutEffect, useState } from "react";

/**
 * DashedFrame
 *
 * Props:
 * - padding: px gap around text (default 18)
 * - rotation: overall rotation in degrees (default 2)
 * - hExtra: additional px to add to the computed horizontal length (default 40)
 * - vExtra: additional px to add to the computed vertical length (default 40)
 * - stroke: stroke color (default "#000")
 * - dash/gap are baked into the SVG as "12 12" (you can change if needed)
 *
 * Behavior:
 * - By default horizontal length = child width + padding*2 + hExtra
 * - vertical length = child height + padding*2 + vExtra
 * - Top & bottom use the same horizontal SVG scaled to that length
 * - Left & right use the same vertical SVG scaled to that length
 */
export default function DashedFrame({
  children,
  padding = 18,
  rotation = -2,
  hExtra = 40,
  vExtra = 40,
  stroke = "#111827",
}) {
  const wrapperRef = useRef(null);
  const childRef = useRef(null);
  const [box, setBox] = useState(null);

  useLayoutEffect(() => {
    function measure() {
      if (!wrapperRef.current || !childRef.current) return;
      const wRect = wrapperRef.current.getBoundingClientRect();
      const cRect = childRef.current.getBoundingClientRect();

      setBox({
        wrapW: wRect.width,
        wrapH: wRect.height,
        childW: cRect.width,
        childH: cRect.height,
        childX: cRect.left - wRect.left,
        childY: cRect.top - wRect.top,
      });
    }

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [children]);

  if (!box) {
    return (
      <span ref={wrapperRef} className="relative inline-block">
        <span ref={childRef} className="relative z-10 inline-block">
          {children}
        </span>
      </span>
    );
  }

  const { childW, childH, childX, childY, wrapW, wrapH } = box;

  // Desired scaled lengths (you can override these by passing different props)
  const Hlen = Math.round(childW + padding * 2 + hExtra); // horizontal line length
  const Vlen = Math.round(childH + padding * 2 + vExtra); // vertical line length

  // positions (center lines on the child)
  const topX = childX + childW / 2 - Hlen / 2;
  const topY = childY - padding;

  const bottomX = topX;
  const bottomY = childY + childH + padding - 14; // offset to align bottom svg height (14) visually

  const leftX = childX - padding;
  const leftY = childY + childH / 2 - Vlen / 2;

  const rightX = childX + childW + padding - 6; // 6 is approximate width of your vertical svg
  const rightY = leftY;

  // For rotation center use the center of the box around the child
  const cx = childX + childW / 2;
  const cy = childY + childH / 2;

  return (
    <span ref={wrapperRef} className="relative inline-block">
      {/* SVG group that holds scaled Figma line svgs */}
      <svg
        className="pointer-events-none absolute top-0 left-0 z-0"
        width={wrapW}
        height={wrapH}
        style={{ overflow: "visible" }}
      >
        <g transform={`rotate(${rotation} ${cx} ${cy})`}>
          {/* Top horizontal (uses your Figma horizontal SVG scaled to Hlen).
              We set width=Hlen so the internal line coordinates scale accordingly. */}
          <svg
            x={topX}
            y={topY}
            width={Hlen}
            height={14}
            viewBox="0 0 346 14"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="0.0174624"
              y1="12.5749"
              x2="345.807"
              y2="0.499694"
              stroke={stroke}
              strokeDasharray="12 12"
              strokeWidth="2"
            />
          </svg>
          <svg
            x={bottomX}
            y={bottomY}
            width={Hlen}
            height={14}
            viewBox="0 0 346 14"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="0.0174624"
              y1="12.5749"
              x2="345.807"
              y2="0.499694"
              stroke={stroke}
              strokeDasharray="12 12"
              strokeWidth="2"
            />
          </svg>

          {/* Left vertical (scaled to Vlen) */}
          <svg
            x={leftX}
            y={leftY}
            width={6}
            height={Vlen}
            viewBox="0 0 6 122"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="4.75745"
              y1="121.943"
              x2="0.499713"
              y2="0.0174264"
              stroke={stroke}
              strokeDasharray="12 12"
              strokeWidth="2"
            />
          </svg>

          {/* Right vertical */}
          <svg
            x={rightX}
            y={rightY}
            width={6}
            height={Vlen}
            viewBox="0 0 6 122"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
          >
            <line
              x1="4.75745"
              y1="121.943"
              x2="0.499713"
              y2="0.0174264"
              stroke={stroke}
              strokeDasharray="12 12"
              strokeWidth="2"
            />
          </svg>
        </g>
      </svg>

      {/* white background panel so text sits on white (optional, uncomment if needed) */}
      {/* 
      <span
        style={{
          position: "absolute",
          left: childX - padding + "px",
          top: childY - padding + "px",
          width: childW + padding * 2 + "px",
          height: childH + padding * 2 + "px",
          background: "#fff",
          zIndex: 5,
          transform: `rotate(${rotation}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />
      */}

      {/* The text */}
      <span ref={childRef} className="relative z-10 inline-block">
        {children}
      </span>
    </span>
  );
}
