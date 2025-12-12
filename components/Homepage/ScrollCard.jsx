"use client";

import React, { useState, useEffect, useRef } from "react";
import Lead1 from "../../public/Homepage/Leads1.png";
import Lead2 from "../../public/Homepage/Leads1.png";
import Lead3 from "../../public/Homepage/Leads1.png";

const OverlappingCards = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeCard, setActiveCard] = useState(0);
  const containerRef = useRef(null);

  const cards = [
    {
      id: 1,
      title: "Connect With leads",
      heading: "Connect with leads",
      description:
        "Capture leads from multiple channels and consolidate them in one place. Engage prospects with personalized outreach and smart automation.",
      features: [
        { text: "Lead Capture & Routing", icon: "/Homepage/Star1.svg" },
        { text: "Email & SMS Integration", icon: "/Homepage/Star1.svg" },
        { text: "Smart Lead Scoring", icon: "/Homepage/Star1.svg" },
      ],
      image: Lead1.src,
    },
    {
      id: 2,
      title: "Close More Deals",
      heading: "Close more deals",
      description:
        "Track every stage of your pipeline with clarity. Move deals forward, automate follow-ups, and identify high-value opportunities with real-time visibility.",
      features: [
        { text: "Lead Capture & Routing", icon: "/Homepage/Star1.svg" },
        { text: "Email & SMS Integration", icon: "/Homepage/Star1.svg" },
        { text: "Smart Lead Scoring", icon: "/Homepage/Star1.svg" },
      ],

      image: Lead2.src,
    },
    {
      id: 3,
      title: "Grow Customer Relationships",
      heading: "Grow customer relationships",
      description:
        "Build lasting connections with your customers. Track interactions, automate touchpoints, and deliver exceptional experiences at scale.",
      features: [
        { text: "Lead Capture & Routing", icon: "/Homepage/Star1.svg" },
        { text: "Email & SMS Integration", icon: "/Homepage/Star1.svg" },
        { text: "Smart Lead Scoring", icon: "/Homepage/Star1.svg" },
      ],

      image: Lead3.src,
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerTop = rect.top;
      const containerHeight = rect.height;
      const windowHeight = window.innerHeight;

      const startScroll = windowHeight * 0.1;
      const endScroll = containerHeight - windowHeight * 0.7;
      const scrollRange = endScroll - startScroll;

      if (scrollRange <= 0) return;

      const currentScroll = -containerTop + startScroll;
      const progress = Math.max(0, Math.min(1, currentScroll / scrollRange));
      setScrollProgress(progress);

      const activeIndex = Math.floor(progress * cards.length);
      setActiveCard(Math.min(activeIndex, cards.length - 1));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [cards.length]);

 const scrollToCard = (index) => {
  if (!containerRef.current) return;

  const container = containerRef.current;
  const containerTop = container.offsetTop;
  const windowHeight = window.innerHeight;
  const containerHeight = container.offsetHeight;
  const startScroll = windowHeight * 0.1;
  const endScroll = containerHeight - windowHeight * 0.7;
  const scrollRange = endScroll - startScroll;
  const targetProgress = index / cards.length;
  const targetScroll = containerTop + startScroll + (scrollRange * targetProgress);

  window.scrollTo({
    top: targetScroll,
    behavior: "smooth",
  });
};

  const getCardTransform = (index) => {
    const cardsCount = cards.length;
    const progressPerCard = 1 / cardsCount;
    const cardProgress =
      (scrollProgress - index * progressPerCard) / progressPerCard;
    const clampedProgress = Math.max(0, Math.min(1, cardProgress));

    const isActive = index === activeCard;
    const isPrevious = index < activeCard;
    const isFuture = index > activeCard;

    const cardPeek = 30;
    const stackSpacing = 20;

    let scale;
    if (isActive) {
      scale = 1;
    } else if (isPrevious) {
      scale = 0.97 - (activeCard - index) * 0.01;
    } else {
      scale = 0.98;
    }

    let rotateX;
    if (isActive) {
      rotateX = 0;
    } else if (isPrevious) {
      rotateX = -5;
    } else {
      rotateX = 2 * (1 - clampedProgress);
    }

    let translateY;
    if (isPrevious) {
      const distanceFromActive = activeCard - index;
      translateY = -14 - (distanceFromActive - 1) * 6;
    } else if (isActive) {
      translateY = 0;
    } else {
      const distanceFromActive = index - activeCard;
      translateY = 480 - cardPeek + (distanceFromActive - 1) * stackSpacing;
    }

    let opacity;

    if (isActive) {
      opacity = 1;
    } else if (isPrevious) {
      opacity = 1;
    } else if (index === activeCard + 1) {
      opacity = 1;
    } else {
      opacity = 0;
    }

    let zIndex;
    if (isActive) {
      zIndex = 100;
    } else if (isPrevious) {
      zIndex = 99 - (activeCard - index);
    } else {
      zIndex = 90 - (index - activeCard);
    }

    let boxShadow;

    if (isActive) {
      boxShadow = "0 10px 24px rgba(0,0,0,0.08)";
    } else if (isPrevious) {
      boxShadow = "0 4px 12px rgba(0,0,0,0.06)";
    } else {
      boxShadow = "none";
    }

    return {
      transform: `translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`,
      opacity: opacity,
      zIndex: zIndex,
      boxShadow: boxShadow,
      transition: "all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
      transformStyle: "preserve-3d",
      transformOrigin: "center top",
      pointerEvents: isActive ? "auto" : "none",
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    };
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[300vh] bg-gradient-to-b py-10"
    >
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 mb-8 text-center mt-12">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Your complete customer journey
        </h2>
        <h2 className="text-5xl font-bold text-gray-900">
          Everything you need in one connected platform
        </h2>
      </div>

      {/* Sticky Navigation Tabs */}
      <div className="sticky top-0 z-50 py-4 bg-gradient-to-b from-white to-transparent">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-3">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => scrollToCard(index)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCard === index
                    ? "bg-gradient-to-r from-orange-400 to-orange-400 text-white shadow-lg shadow-orange-200"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-600 hover:shadow-md"
                }`}
              >
                {card.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cards Container */}
      <div className="sticky top-24 max-w-7xl mx-auto px-6 py-8">
        <div
          className="relative h-[520px]"
          style={{
            perspective: "1500px",
            perspectiveOrigin: "center center",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="absolute inset-0 w-full"
              style={getCardTransform(index)}
            >
              {/* Card */}
              <div className="w-full h-full bg-white rounded-2xl overflow-hidden border border-gray-200">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Left Side - Content */}
                  <div className="p-12 flex flex-col justify-center bg-white">
                    <div
                      className={`inline-block px-4 py-2 rounded-full  text-white text-sm font-semibold mb-6 w-fit`}
                    >
                      Step {card.id} of 3
                    </div>

                    <h3 className="text-4xl font-bold text-gray-900 mb-4">
                      {card.heading}
                    </h3>

                    <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                      {card.description}
                    </p>

                    <div className="space-y-4">
                      {card.features.map((feature, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3"
                          style={{
                            opacity: activeCard === index ? 1 : 0,
                            transform:
                              activeCard === index
                                ? "translateX(0px)"
                                : "translateX(-20px)",
                            transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${
                              idx * 100
                            }ms`,
                          }}
                        >
                          <img
                            src={feature.icon}
                            alt="icon"
                            className="w-6 h-6"
                          />
                          <span className="font-medium text-lg text-black">
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Image */}
                  <div className="relative bg-white p-8 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-xl shadow-inner overflow-hidden border border-gray-100">
                      <img
                        src={card.image}
                        alt={card.heading}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const imgEl = e.currentTarget;
                          imgEl.style.display = "none";

                          const fallback = imgEl.nextElementSibling;
                          if (fallback) {
                            fallback.style.display = "flex";
                          }
                        }}
                      />

                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white hidden items-center justify-center p-12">
                        <div className="text-center">
                          <div
                            className={`w-24 h-24 mx-auto mb-6 rounded-2xl  flex items-center justify-center`}
                          >
                            <span className="text-4xl text-white">
                              {index === 0 ? "🎯" : index === 1 ? "📊" : "🤝"}
                            </span>
                          </div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-3">
                            {card.heading}
                          </h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OverlappingCards;
