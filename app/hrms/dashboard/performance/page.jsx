'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ComingSoon() {
  const router = useRouter();
  const [isDark, setIsDark] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleNotifyClick = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Spline+Sans:wght@300;400;500;600;700&family=Noto+Sans:wght@300;400;500;600;700&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200');

        @keyframes fall {
          0% { transform: translateY(-10px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(50px); opacity: 0; }
        }

        @keyframes tap {
          0%, 80%, 100% { transform: rotate(-12deg) translateX(0) scale(1); }
          85% { transform: rotate(-12deg) translateX(0) scale(1); }
          90% { transform: rotate(-5deg) translateX(-8px) scale(0.95); }
          95% { transform: rotate(-12deg) translateX(0) scale(1); }
        }

        @keyframes pulseGlow {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 123, 48, 0.4); }
          50% { transform: scale(1.02); box-shadow: 0 0 0 10px rgba(255, 123, 48, 0); }
        }

        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes bottleFlip {
          0% { transform: rotate(0deg) translateY(0); }
          25% { transform: rotate(180deg) translateY(-30px); }
          50% { transform: rotate(360deg) translateY(0); }
          75% { transform: rotate(540deg) translateY(-30px); }
          100% { transform: rotate(720deg) translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes bounceSubtle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes wiggle {
          0%, 100% { transform: rotate(-3deg); }
          50% { transform: rotate(3deg); }
        }

        @keyframes ripple {
          0% { transform: scale(0.8); opacity: 1; }
          100% { transform: scale(2.4); opacity: 0; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .animate-sand-fall { animation: fall 1.5s linear infinite; }
        .animate-tap-gesture { animation: tap 4s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulseGlow 2s infinite; }
        .animate-shimmer { animation: shimmer 2s linear infinite; }
        .animate-bottle-flip { animation: bottleFlip 3s ease-in-out infinite; }
        .animate-float { animation: float 3s ease-in-out infinite; }
        .animate-bounce-subtle { animation: bounceSubtle 2s ease-in-out infinite; }
        .animate-rotate-slow { animation: rotateSlow 20s linear infinite; }
        .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
        .animate-ripple { animation: ripple 1s ease-out; }
        .animate-slide-up { animation: slideUp 0.5s ease-out forwards; }

        .digital-sand {
          text-shadow: 0 0 4px rgba(255, 123, 48, 0.6);
        }

        .material-symbols-outlined {
          font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }

        .cursor-glow {
          pointer-events: none;
          position: fixed;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 123, 48, 0.3) 0%, transparent 70%);
          transform: translate(-50%, -50%);
          transition: all 0.1s ease;
          z-index: 9999;
        }

        .floating-particles {
          position: absolute;
          width: 100%;
          height: 100%;
          overflow: hidden;
          pointer-events: none;
        }

        .particle {
          position: absolute;
          background: rgba(255, 123, 48, 0.3);
          border-radius: 50%;
          animation: floatParticle 15s infinite ease-in-out;
        }

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
          25% { transform: translateY(-100px) translateX(50px); opacity: 0.6; }
          50% { transform: translateY(-200px) translateX(-30px); opacity: 0.4; }
          75% { transform: translateY(-150px) translateX(80px); opacity: 0.5; }
        }
      `}</style>

      <div className={`${isDark ? 'dark' : ''}  flex flex-col font-[Spline_Sans,Noto_Sans,sans-serif] transition-colors duration-300`}>
        {/* Cursor Glow Effect */}
        <div 
          className="cursor-glow"
          style={{ left: `${mousePosition.x}px`, top: `${mousePosition.y}px` }}
        />

  
        {/* Main Content */}
        <main className="relative flex flex-1 w-full flex-col items-center mt-18 ">
          
          {/* Hourglass with Interactive Elements */}
          <div className="relative z-10 mb-12 transform scale-110 lg:scale-125 animate-float">
            
            {/* Animated Hand/Tap Gesture */}
            <div className="absolute -right-10 top-[45%] z-20 animate-tap-gesture origin-bottom-left">
              <span className="material-symbols-outlined text-5xl text-gray-900  drop-shadow-lg rotate-[-10deg]" style={{fontVariationSettings: "'FILL' 1"}}>
                touch_app
              </span>
              <span className="absolute top-2 left-2 w-8 h-8 rounded-full border-2 border-[#FF7B30]/60 animate-ping opacity-0" style={{animationDelay: '5.6s', animationDuration: '0.8s'}}></span>
            </div>

       

       

            {/* Hourglass */}
            <div className="relative w-40 h-60">
              <svg className="w-full h-full drop-shadow-2xl" viewBox="0 0 100 160">
                <defs>
                  <linearGradient id="glassGradient" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="white" stopOpacity="0.2"></stop>
                    <stop offset="50%" stopColor="white" stopOpacity="0.05"></stop>
                    <stop offset="100%" stopColor="white" stopOpacity="0.1"></stop>
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Top frame */}
                <path className="fill-gray-800 " d="M10 10 L90 10 L90 20 L10 20 Z"></path>
                
                {/* Bottom frame */}
                <path className="fill-gray-800 " d="M10 140 L90 140 L90 150 L10 150 Z"></path>
                
                {/* Top glass */}
                <path className="text-gray-200 " d="M20 20 Q 20 60 50 80 Q 80 60 80 20 Z" fill="url(#glassGradient)" stroke="currentColor" strokeWidth="2"></path>
                
                {/* Bottom glass */}
                <path className="text-gray-200 " d="M20 140 Q 20 100 50 80 Q 80 100 80 140 Z" fill="url(#glassGradient)" stroke="currentColor" strokeWidth="2"></path>
              </svg>

              {/* Top sand with binary digits */}
              <div className="absolute top-[28px] left-[25%] right-[25%] h-[40px] flex flex-wrap content-end justify-center gap-0.5 overflow-hidden opacity-90">
                <div className="w-full h-full bg-[#FF7B30]/20 absolute bottom-0 left-0 rounded-b-[2rem] animate-pulse"></div>
                <span className="text-[8px] font-mono font-bold text-[#FF7B30] digital-sand">1</span>
                <span className="text-[8px] font-mono font-bold text-[#FF7B30] digital-sand">0</span>
                <span className="text-[8px] font-mono font-bold text-[#FF7B30] digital-sand">1</span>
              </div>

              {/* Falling sand animation */}
              <div className="absolute top-[50%] left-1/2 -translate-x-1/2 w-6 h-20 overflow-hidden flex flex-col items-center z-0">
                {[0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2].map((delay, i) => (
                  <div 
                    key={i}
                    className="animate-sand-fall text-[10px] font-bold text-[#FF7B30] leading-none" 
                    style={{animationDelay: `${delay}s`}}
                  >
                    {i % 2 === 0 ? '1' : '0'}
                  </div>
                ))}
              </div>

              {/* Bottom sand accumulation */}
              <div className="absolute bottom-[28px] left-[25%] right-[25%] h-[35px] flex items-end justify-center overflow-hidden">
                <div className="w-full h-3 bg-[#FF7B30]/30 rounded-t-full shadow-[0_0_15px_rgba(255,123,48,0.5)] animate-pulse" style={{filter: 'url(#glow)'}}>
                  <div className="w-full flex justify-center text-[6px] text-[#FF7B30] font-mono pt-1 opacity-80">10110</div>
                </div>
              </div>

   
            </div>
          </div>
          {/* Text Content */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-[960px] px-6 animate-slide-up">
            <h1 className="mb-6 text-4xl font-black leading-tight tracking-[-0.033em] text-gray-900  lg:text-6xl drop-shadow-sm">
              Time Flies When You're <br className="hidden md:block"/>
              Building <span className="text-[#FF7B30] relative inline-block animate-bounce-subtle">
                Awesome HR Software!
                <svg className="absolute -top-8 -right-8 w-12 h-12 text-[#FF7B30] animate-rotate-slow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
              </span>
            </h1>
            <div className="mb-10 max-w-2xl">
              <p className="text-lg font-medium leading-relaxed text-gray-600  md:text-xl">
                We're diligently stacking pixels and polishing features. Almost there! (No, really, almost).
              </p>
            </div>
            {/* Notification Button */}
            <div className="relative">
              <button 
                onClick={handleNotifyClick}
                className="flex items-center gap-2 text-sm font-semibold text-gray-600  hover:text-[#FF7B30] ] transition-all group/link hover:scale-110"
              >
                <span className="material-symbols-outlined !text-lg group-hover/link:animate-bounce">notifications_active</span>
                Notify me when it's ready
              </button>

              {/* Notification Toast */}
              {showNotification && (
                <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-3 rounded-lg shadow-lg animate-slide-up whitespace-nowrap">
                  ✓ You'll be notified soon!
                </div>
              )}
            </div>
            {/* Fun Facts Section */}
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div className="animate-bounce-subtle" style={{animationDelay: '0s'}}>
                <div className="text-3xl font-bold text-[#FF7B30]">2,847</div>
                <div className="text-xs text-gray-500  mt-1">Cups of Coffee</div>
              </div>
              <div className="animate-bounce-subtle" style={{animationDelay: '0.2s'}}>
                <div className="text-3xl font-bold text-[#FF7B30]">10,000+</div>
                <div className="text-xs text-gray-500  mt-1">Lines of Code</div>
              </div>
              <div className="animate-bounce-subtle" style={{animationDelay: '0.4s'}}>
                <div className="text-3xl font-bold text-[#FF7B30]">∞</div>
                <div className="text-xs text-gray-500  mt-1">Awesome Ideas</div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}