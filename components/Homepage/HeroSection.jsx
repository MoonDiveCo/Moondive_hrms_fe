import React, { useEffect, useRef, useState } from "react";
import HeroCursorRight from "../../public/Homepage/HeroCursorRight.png";
import HeroCursorLeft from "../../public/Homepage/HeroCursorLeft.png";
import Image from "next/image";

/**
 * Uses your uploaded hero image file path:
 * /mnt/data/60c846e8-00f3-481c-8065-b790d43e5f61.png
 *
 * If you move the hero image to public/, change heroImageUrl accordingly (e.g. "/HeroSectionImg.png")
 */
const heroImageUrl = "/mnt/data/60c846e8-00f3-481c-8065-b790d43e5f61.png";

export function HeroSection() {
  // --- CONFIG: change these to fit your dataset / initial positions ---
  const names = [
    "Nimble",
    "Herics and Co",
    "Raw Motorsports Inc",
    "Hicks Solutions",
    "Microsoft",
    "Google",
    "Capitol Financial Services", // <-- index 6 (7th)
    "Sigma Digital",
    "Devicq Digital",
    "Tontech Ltd",
    "Sentity",
    "Sony",
    "Macy's",
    "Samsung",
    "Deloitte",
  ];
  const rows = names.length; // number of discrete rows the cursors will traverse
  const initialLeftIndex = 6; // left cursor starts at 7th item (0-based)
  const initialRightIndex = 4; // right cursor starts at 5th item (0-based)
  // --------------------------------------------------------------------

  const imgRef = useRef(null);
  const [imgTopDoc, setImgTopDoc] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);

  // current row indices (0-based). Initialized to configured initial positions.
  const initialLeftRef = useRef(initialLeftIndex);
  const initialRightRef = useRef(initialRightIndex);
  const [leftRow, setLeftRow] = useState(initialLeftIndex);
  const [rightRow, setRightRow] = useState(initialRightIndex);

  // Measure image and compute per-row height
  useEffect(() => {
    const measure = () => {
      const el = imgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      setImgTopDoc(rect.top + scrollY);
      setImgHeight(rect.height);
      // rowHeight is image height divided by number of rows (discrete steps)
      const rh = rect.height / Math.max(1, rows);
      setRowHeight(rh);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [rows]);

  // Scroll handler: compute progress and update cursor rows independently based on their own initial indexes
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!imgRef.current) return;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight;
        const imgRect = imgRef.current.getBoundingClientRect();
        const imgTopViewport = imgRect.top; // px from viewport top

        // define start & end thresholds (tweak to taste)
        // startAt: image top enters this position (below it) => no movement
        // endAt: image top reaches this position => movement complete (cursors at top rows)
        const startAt = viewportHeight * 0.9;
        const endAt = viewportHeight * 0.15;

        // normalized progress in [0,1]
        let progress = (startAt - imgTopViewport) / (startAt - endAt);
        progress = Math.max(0, Math.min(1, isFinite(progress) ? progress : 0));

        // compute target row for a cursor that started at `initialIdx`
        const computeTargetRow = (initialIdx) => {
          // move up by progress * initialIdx (rounded)
          const moveUp = Math.round(progress * initialIdx);
          return Math.max(0, initialIdx - moveUp);
        };

        setLeftRow(computeTargetRow(initialLeftRef.current));
        setRightRow(computeTargetRow(initialRightRef.current));

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // call once to initialize
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // compute pixel top for a cursor based on row index (relative to image top)
  const computeCursorTop = (rowIndex) => {
    // if rowHeight is 0 (not yet measured), return 0
    if (!rowHeight || !imgHeight) return 0;
    // we want to point vertically to the center of the row
    const insideY = rowIndex * rowHeight + rowHeight * 0.5;
    // clamp within image bounds
    return Math.min(Math.max(0, insideY), imgHeight);
  };

  // cursor horizontal offsets (tweak these to line up visually)
  // left cursor will be placed to the left of image; right cursor to the right.
  const leftCursorLeft = -64; // px offset from image left
  const rightCursorRight = -64; // px offset from image right

  // styles for cursor containers
  const leftStyle = {
    position: "absolute",
    left: `${leftCursorLeft}px`,
    top: imgHeight ? `${computeCursorTop(leftRow)}px` : "0px",
    transform: "translateY(-50%)",
    transition: "top 280ms ease-out",
    zIndex: 40,
  };
  const rightStyle = {
    position: "absolute",
    right: `${rightCursorRight}px`,
    top: imgHeight ? `${computeCursorTop(rightRow)}px` : "0px",
    transform: "translateY(-50%)",
    transition: "top 280ms ease-out",
    zIndex: 40,
  };

  return (
    <div className="w-full flex flex-col items-center text-center py-16 bg-[#FFF9F0]">
      <div className="text-8xl font-semibold text-[#0A0F1C] leading-[1.02] tracking-tighter mb-8">
        Built For Fast,
        <br />
        Aligned{" "}
        <span className="relative inline-block px-2">
          <span className="relative z-20 inline-block bg-gradient-to-r from-[#3562F1] via-[#A25DE2] to-[#F2326F] text-transparent bg-clip-text px-3 rotate-[-3deg]">
            Growth
          </span>

          {/* dashed svg box behind the word (keeps previous solution) */}
          <svg
            className="pointer-events-none absolute -left-2 -right-2 -top-3 -bottom-3 rotate-[-3deg] z-10"
            viewBox="0 0 351 134"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            aria-hidden="true"
            role="img"
          >
            <rect x="6" y="6" width="339" height="122" rx="6" fill="white" />
            <line x1="0.436835" y1="24.5679" x2="346.226" y2="12.4927" stroke="#111827" strokeDasharray="12 12" strokeWidth="2" />
            <line x1="3.82154" y1="121.509" x2="349.611" y2="109.434" stroke="#111827" strokeDasharray="12 12" strokeWidth="2" />
            <line x1="338.554" y1="122.327" x2="334.296" y2="0.401389" stroke="#111827" strokeDasharray="12 12" strokeWidth="2" />
            <line x1="16.7495" y1="133.565" x2="12.4917" y2="11.6397" stroke="#111827" strokeDasharray="12 12" strokeWidth="2" />
          </svg>
        </span>
      </div>

      <p className="mt-6 text-primaryText max-w-2xl text-2xl mb-8">
        Give your HR team the clarity, automation, and speed they need to elevate employee experiences - across every department.
      </p>

      {/* HERO image container */}
      <div className="relative w-full max-w-6xl px-6" style={{ minHeight: 420 }}>
        <div className="w-full rounded overflow-hidden shadow" ref={imgRef}>
          {/* using a plain <img> so we can load local path uploaded in session */}
          <img src="/Homepage/HeroSectionImg.png" alt="hero image" style={{ width: "100%", height: "auto", display: "block" }} />
        </div>

        {/* left cursor: "You" */}
        <div style={leftStyle} aria-hidden>
          <Image src={HeroCursorLeft} alt="left cursor" width={56} height={56} />
        </div>

        {/* right cursor: "Jake" */}
        <div style={rightStyle} aria-hidden>
          <Image src={HeroCursorRight} alt="right cursor" width={56} height={56} />
        </div>
      </div>

      {/* small debug area (optional): show current row indices */}
      <div className="mt-6 text-sm text-gray-500">
        <div>Left cursor row: {leftRow + 1} / {rows}</div>
        <div>Right cursor row: {rightRow + 1} / {rows}</div>
      </div>
    </div>
  );
}
