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
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
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
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
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
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
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

      // Adjust these values for better timing
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

    const targetProgress = index / cards.length;
    const scrollTarget =
      containerTop + (containerHeight - windowHeight) * targetProgress;

    window.scrollTo({
      top: scrollTarget,
      behavior: "smooth",
    });
  };

  const getCardTransform = (index) => {
    const cardsCount = cards.length;
    const progressPerCard = 1 / cardsCount;
    const cardProgress =
      (scrollProgress - index * progressPerCard) / progressPerCard;
    const clampedProgress = Math.max(0, Math.min(1, cardProgress));

    // Base offset for overlapping effect
    const baseOffset = index * 30; // Reduced from 40 for less movement

    // Scale: slightly smaller when not active
    const scale = 0.95 + 0.05 * clampedProgress;

    // Rotation: more subtle rotation
    const rotateX = (1 - clampedProgress) * -20; // Reduced from -25

    // Y position calculation
    let translateY;

    if (index === activeCard) {
      // Active card stays at top
      translateY = 0;
    } else if (index < activeCard) {
      // Previous cards move up and fade out
      translateY = -50 * (activeCard - index);
    } else {
      // Future cards stay in overlapping position
      translateY = baseOffset + 20;
    }

    // Opacity handling with smoother transitions
    let opacity;
    if (index === activeCard) {
      opacity = 1;
    } else if (index === activeCard + 1) {
      opacity = 0.7; // Next card slightly visible
    } else if (index < activeCard) {
      opacity = 0; // Previous cards invisible
    } else {
      opacity = 0.3; // Far future cards barely visible
    }

    // Prevent background cards from showing during flip
    const isActive = index === activeCard;
    const isNext = index === activeCard + 1;

    return {
      transform: `translateY(${translateY}px) scale(${scale}) rotateX(${rotateX}deg)`,
      opacity: opacity,
      zIndex: cards.length - index + (isActive ? 100 : 0),
      transition: "all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      transformStyle: "preserve-3d",
      transformOrigin: "center bottom",
      pointerEvents: isActive ? "auto" : "none",
      // Hide backface to prevent seeing through cards
      backfaceVisibility: "hidden",
      WebkitBackfaceVisibility: "hidden",
    };
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-[300vh] bg-gradient-to-b  py-20"
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
      <div className="sticky top-0 z-50  py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-center gap-3">
            {cards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => scrollToCard(index)}
                className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCard === index
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-200"
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
        <div className="relative h-[500px]">
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="absolute inset-0 w-full"
              style={getCardTransform(index)}
            >
              {/* Card */}
              <div className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
                  {/* Left Side - Content */}
                  <div className="p-12 flex flex-col justify-center bg-white">
                    <div
                      className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${card.color} text-white text-sm font-semibold mb-6 w-fit`}
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
                          className={`flex items-center gap-3 transition-all duration-700`}
                          style={{
                            opacity: activeCard === index ? 1 : 0,
                            transform:
                              activeCard === index
                                ? "translateY(0px)"
                                : "translateY(-20px)",
                          }}
                        >
                          <img
                            src={feature.icon}
                            alt="icon"
                            className={`w-6 h-6 transition-all duration-700 ${
                              activeCard === index ? "opacity-100" : "opacity-0"
                            }`}
                          />

                          <span
                            className="font-medium text-lg transition-all duration-700 text-black "
                              
                          >
                            {feature.text}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Side - Image */}
                  <div className="relative bg-white p-8 flex items-center justify-center">
                    <div className="w-full h-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                      <img
                        src={card.image}
                        alt={card.heading}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      {/* Fallback */}
                      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-white hidden items-center justify-center p-12">
                        <div className="text-center">
                          <div
                            className={`w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center`}
                          >
                            <span className="text-4xl text-white">
                              {index === 0 ? "🎯" : index === 1 ? "📊" : "🤝"}
                            </span>
                          </div>
                          <h4 className="text-2xl font-bold text-gray-800 mb-3">
                            {card.heading}
                          </h4>
                          <p className="text-gray-600 text-sm">
                            Add your image
                          </p>
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
