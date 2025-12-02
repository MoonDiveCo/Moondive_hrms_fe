
'use client'
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import DhlLogo from "../../public/Homepage/DHL.png";
import CocaColaLogo from "../../public/Homepage/CocaColaLogo.png";
import ErgoLogo from "../../public/Homepage/ErgoLogo.png";
import TalentMagnetLogo from "../../public/Homepage/TalentMagnetLogo.png";
import MercedesLogo from "../../public/Homepage/MercedesLogo.png";
import SamavaLogo from "../../public/Homepage/SamavaLogo.png";

export default function TrustedBySlider({ interval = 2500, visible = 6 }) {
  const containerRef = useRef(null);
  const itemRef = useRef(null);
  const autoplayRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);
  const [isClient, setIsClient] = useState(false);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const baseLogos = [
    { id: "dhl", src: DhlLogo, alt: "DHL" },
    { id: "coca", src: CocaColaLogo, alt: "Coca-Cola" },
    { id: "ergo", src: ErgoLogo, alt: "ERGO" },
    { id: "talent", src: TalentMagnetLogo, alt: "TalentMagnet" },
    { id: "merc", src: MercedesLogo, alt: "Mercedes-Benz" },
    { id: "samava", src: SamavaLogo, alt: "Smava" },
  ];

  const logos = Array.from({ length: 12 }).map((_, i) => {
    const item = baseLogos[i % baseLogos.length];
    return { ...item, id: `${item.id}-${i}` };
  });

  useEffect(() => {
    if (!isClient) return; 
    
    const container = containerRef.current;
    if (!container) return;

    let itemWidth = 0;

    const measure = () => {
      const first = itemRef.current;
      if (first) {
        const rect = first.getBoundingClientRect();
        itemWidth = rect.width + 24;
      }
    };

    measure();
    window.addEventListener("resize", measure);

    function tick() {
      if (!container || isPaused) return;
      measure();

      const maxScroll = container.scrollWidth - container.clientWidth;
      const next = Math.round(container.scrollLeft + itemWidth);

      if (next >= maxScroll - 1) {
        container.scrollTo({ left: maxScroll, behavior: "smooth" });
        setTimeout(() => container.scrollTo({ left: 0 }), 400);
      } else {
        container.scrollBy({ left: itemWidth, behavior: "smooth" });
      }
    }

    autoplayRef.current = setInterval(tick, interval);

    return () => {
      window.removeEventListener("resize", measure);
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [interval, isPaused, isClient]);

  
  const scrollbarHideStyle = `
    .scrollbar-hide-inline::-webkit-scrollbar {
      display: none;
    }
  `;

  return (
    <section className="py-8" aria-label="Trusted by section">
      <style dangerouslySetInnerHTML={{ __html: scrollbarHideStyle }} />
      
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-center text-[40px] font-bold text-[#0A0F1C] mb-6">
          Trusted by
        </h2>

        <div className="relative">
          <div
            ref={containerRef}
            className="overflow-x-auto scrollbar-hide-inline" 
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            style={{
              WebkitOverflowScrolling: "touch",
              paddingBottom: 6,
              scrollbarWidth: "none",
              msOverflowStyle: "none", 
            }}
          >
            <div className="flex items-center gap-6 py-6 px-2">
              {logos.map((logo, idx) => (
                <div
                  key={logo.id}
                  ref={idx === 0 ? itemRef : null}
                  className="shrink-0 w-[120px] sm:w-[140px] md:w-40 lg:w-[180px] p-2"
                  role="img"
                  aria-label={logo.alt}
                >
                  <div className="bg-transparent rounded-sm flex items-center justify-center h-full">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      width={160}
                      height={56}
                      className="object-contain opacity-80"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


