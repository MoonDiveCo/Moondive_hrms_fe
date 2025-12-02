import { useEffect, useRef, useState } from "react";

export default function PlatformSection() {
  const ref = useRef(null);
  const [coloredWords, setColoredWords] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const hasAnimatedRef = useRef(false); // Track if animation has played
  
  const textLines = [
    "One platform. Three powerful systems.",
    "From customer management to content publishing",
    "to employee operations, everything is built to work",
    "together.",
    "No scattered data, no complicated setups just",
    "smooth, connected workflows."
  ];
  
  const words = textLines.join(" ").split(" ");
  const lineBreakIndices = textLines.map((line, index) => {
    const wordsBefore = textLines.slice(0, index).join(" ").split(" ").length;
    return wordsBefore + line.split(" ").length - 1;
  });

  // Scroll lock effect
  // useEffect(() => {
  //   if (isAnimating) {
  //     // Save current scroll position
  //     const scrollY = window.scrollY;
      
  //     // Lock scroll
  //     document.body.style.position = 'fixed';
  //     document.body.style.top = `-${scrollY}px`;
  //     document.body.style.width = '100%';
  //     document.body.style.overflowY = 'scroll';
      
  //     return () => {
  //       // Unlock scroll
  //       document.body.style.position = '';
  //       document.body.style.top = '';
  //       document.body.style.width = '';
  //       document.body.style.overflowY = '';
        
  //       // Restore scroll position
  //       window.scrollTo(0, scrollY);
  //     };
  //   }
  // }, [isAnimating]);

  useEffect(() => {
    let animationTimeouts = [];

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Only trigger if it hasn't animated before
          if (entry.isIntersecting && entry.intersectionRatio >= 0.3 && !hasAnimatedRef.current) {
            // Mark as animated
            hasAnimatedRef.current = true;
            
            // Immediately freeze screen
            setIsAnimating(true);
            
            // Clear any existing timeouts
            animationTimeouts.forEach(timeout => clearTimeout(timeout));
            animationTimeouts = [];
            
            // Reset all words to default color
            setColoredWords(new Array(words.length).fill(false));
            
            // Animate each word
            words.forEach((_, index) => {
              const timeout = setTimeout(() => {
                setColoredWords(prev => {
                  const newArray = [...prev];
                  newArray[index] = true;
                  return newArray;
                });
                
                // Unlock scroll after last word completes
                if (index === words.length - 1) {
                  setTimeout(() => {
                    setIsAnimating(false);
                  }, 700);
                }
              }, (index * 400));
              animationTimeouts.push(timeout);
            });
          }
        });
      },
      { 
        threshold: [0, 0.1, 0.2, 0.3, 0.5, 0.7, 1],
        rootMargin: "0px"
      }
    );

    if (ref.current) observer.observe(ref.current);
    
    return () => {
      observer.disconnect();
      animationTimeouts.forEach(timeout => clearTimeout(timeout));
    };
  }, [words.length]);

  useEffect(() => {
    setColoredWords(new Array(words.length).fill(false));
  }, [words.length]);

  return (
    <section
      ref={ref}
      className="bg-[#FFF9F0] flex items-center justify-center p-4 md:p-8 mb-16 min-h-[60vh]"
    >
      <div className="w-full max-w-6xl mx-auto">
        <div className="text-center px-2 md:px-4">
          <div className="text-5xl font-bold leading-[1.15] tracking-tight">
            {words.map((word, index) => (
              <span key={index}>
                <span
                  className={`inline-block transition-colors duration-700 ease-out ${
                    coloredWords[index] 
                      ? "text-orange-500"
                      : "text-[#0A0F1C]"
                  }`}
                >
                  {word}
                </span>
                
                {index < words.length - 1 && word !== "." && !lineBreakIndices.includes(index) && " "}
                {lineBreakIndices.includes(index) && index < words.length - 1 && (
                  <br className="block h-4" />
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}