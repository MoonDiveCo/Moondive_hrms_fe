import React, { useEffect, useRef, useState } from "react";
import HeroCursorRight from "../../public/Homepage/HeroCursorRight.png";
import HeroCursorLeft from "../../public/Homepage/HeroCursorLeft.png";
import Image from "next/image";
import HeroImage from "../../public/Homepage/HeroSectionImg.png";
import { useRouter } from "next/navigation";
import CmsImage from "../../public/Homepage/Document.svg";
import CrmImage from "../../public/Homepage/Chart.svg";
import HrmsImage from "../../public/Homepage/Tick.svg";

const GRID_BG = "/Homepage/bg.png";
export function HeroSection() {
  const names = [
    "Nimble",
    "Herics and Co",
    "Raw Motorsports Inc",
    "Hicks Solutions",
    "Microsoft",
    "Google",
    "Capitol Financial Services",
    "Sigma Digital",
    "Devicq Digital",
    "Tontech Ltd",
    "Sentity",
    "Sony",
    "Macy's",
    "Samsung",
    "Deloitte",
  ];
  const rows = names.length;
  const initialLeftIndex = 8;
  const initialRightIndex = 8;
  const router = useRouter();

  const imgRef = useRef(null);
  const [imgTopDoc, setImgTopDoc] = useState(0);
  const [imgHeight, setImgHeight] = useState(0);
  const [rowHeight, setRowHeight] = useState(0);
  const [imgOffsetInParent, setImgOffsetInParent] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state

  const initialLeftRef = useRef(initialLeftIndex);
  const initialRightRef = useRef(initialRightIndex);
  const [leftRow, setLeftRow] = useState(initialLeftIndex);
  const [rightRow, setRightRow] = useState(initialRightIndex);

  useEffect(() => {
    const measure = () => {
      const el = imgRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollY = window.scrollY || window.pageYOffset;
      setImgTopDoc(rect.top + scrollY);
      setImgHeight(rect.height);
      const rh = rect.height / Math.max(1, rows);
      setRowHeight(rh);
      setImgOffsetInParent(el.offsetTop || 0);
    };

    measure();
    window.addEventListener("resize", measure);
    window.addEventListener("load", measure);

    return () => {
      window.removeEventListener("resize", measure);
      window.removeEventListener("load", measure);
    };
  }, [rows]);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!imgRef.current) return;
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        const viewportHeight = window.innerHeight;
        const imgRect = imgRef.current.getBoundingClientRect();
        const imgTopViewport = imgRect.top;

        const startAt = viewportHeight * 0.9;
        const endAt = viewportHeight * 0.15;
        let progress = (startAt - imgTopViewport) / (startAt - endAt);
        progress = Math.max(0, Math.min(1, isFinite(progress) ? progress : 0));

        const computeTargetRow = (initialIdx) => {
          const moveUp = Math.round(progress * initialIdx);
          return Math.max(0, initialIdx - moveUp);
        };

        setLeftRow(computeTargetRow(initialLeftRef.current));
        setRightRow(computeTargetRow(initialRightRef.current));

        ticking = false;
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const computeCursorTop = (rowIndex) => {
    if (!rowHeight || !imgHeight) return 0;
    const insideY = rowIndex * rowHeight + rowHeight * 0.5;
    const topWithinParent =
      imgOffsetInParent + Math.min(Math.max(0, insideY), imgHeight);
    return topWithinParent;
  };

  const leftCursorLeft = 240;
  const rightCursorRight = 240;
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
    <div className="w-full flex flex-col items-center text-center py-6 bg-[#FFF9F0]">
      <div className="text-8xl font-bold text-[#0A0F1C] leading-[1.02] tracking-tighter mb-8">
        Built For Fast,
        <br />
        Aligned{" "}
        <span className="relative inline-block px-2 ">
          <span className="relative z-20 text-center py-2  inline-block bg-gradient-to-r from-[#3562F1] via-[#A25DE2] to-[#F2326F] text-transparent bg-clip-text px-1 rotate-[-3deg] animate-gradient font-bold ">
            Growth
          </span>

          <svg
            width="346"
            className="pointer-events-none absolute -left-2 -right-2 -top-3 -bottom-3 rotate-[-3deg] z-10"
            height="-20"
            viewBox="0 0 346 -20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <line
              x1="0.000549359"
              y1="12.5003"
              x2="346.001"
              y2="12.5003"
              stroke="black"
              strokeDasharray="12 12"
            />
            <line
              x1="4.28147e-08"
              y1="109.501"
              x2="346"
              y2="109.501"
              stroke="black"
              strokeDasharray="12 12"
            />
            <line
              x1="334.5"
              y1="-20"
              x2="334.5"
              y2="-2.23381e-08"
              stroke="black"
              strokeDasharray="12 12"
            />
            <line
              x1="12.4993"
              y1="-20.001"
              x2="12.4993"
              y2="0.000610329"
              stroke="black"
              strokeDasharray="12 12"
            />
            <rect
              width="313"
              height="88"
              transform="translate(17.-203 16.9831)"
              fill="white"
            />
          </svg>
        </span>
      </div>

      <p className=" text-primaryText max-w-4xl text-2xl mb-8">
        Give your HR team the clarity, automation, and speed they need to
        elevate employee experiences - across every department.
      </p>


      <div className="relative w-full px-6" style={{ minHeight: 420 }}>
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            backgroundImage: `url("${GRID_BG}")`,
            backgroundRepeat: "repeat",
          }}
        />
        <div
          className="w-full rounded overflow-hidden relative container"
          ref={imgRef}
          style={{ zIndex: 10 }}
        >
          <Image
            src={HeroImage}
            alt="hero image"
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>

        <div style={leftStyle} aria-hidden>
          <Image
            src={HeroCursorLeft}
            alt="left cursor"
            width={56}
            height={56}
          />
        </div>

        <div style={rightStyle} aria-hidden>
          <Image
            src={HeroCursorRight}
            alt="right cursor"
            width={56}
            height={56}
          />
        </div>
      </div>
    </div>
  );
}
