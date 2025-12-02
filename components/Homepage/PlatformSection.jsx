import { useEffect, useRef, useState } from "react";

export default function PlatformSection() {
  const ref = useRef(null);
  const [coloredWordCount, setColoredWordCount] = useState(0);
  
  const textLines = [
    "One platform Three powerful systems.",
    "From customer management to content publishing",
    "to employee operations, everything is built to work",
    "together",
    "No scattered data, no complicated setups just",
    "smooth, connected workflows"
  ];

  const linesWithWords = textLines.map(line => line.split(' '));
  const totalWords = linesWithWords.flat().length;


  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ref.current || ticking) return;

      ticking = true;
      
      requestAnimationFrame(() => {
        const rect = ref.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const isVisible = rect.top < viewportHeight && rect.bottom > 0;
        
        if (isVisible) {
          const sectionHeight = rect.height;
          const visibleTop = Math.max(0, viewportHeight - rect.top);
          

          const scrollMultiplier = 0.9; 
          const progress = Math.min(1, visibleTop / ((viewportHeight + sectionHeight) * scrollMultiplier));
          
         
          const wordIndex = Math.floor(progress * totalWords);
          const clampedWordIndex = Math.max(0, Math.min(totalWords, wordIndex));
          
          setColoredWordCount(clampedWordIndex);
        } else if (rect.top > viewportHeight) {
          
          setColoredWordCount(0);
        } else {
          
          setColoredWordCount(totalWords);
        }
        
        ticking = false;
      });
    };

    
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [totalWords]);

  return (
    <section
      ref={ref}
      className="flex items-center justify-center p-4 md:p-8 mb-15"
    >
      <div className="w-full max-w-6xl mx-auto sticky top-1/3">
        <div className="text-center px-2 md:px-4">
          <div className="text-5xl font-bold leading-[1.15] tracking-tight">
            {linesWithWords.map((words, lineIndex) => {
              const wordsBeforeLine = linesWithWords
                .slice(0, lineIndex)
                .flat()
                .length;
              
              return (
                <div key={lineIndex} className="mb-2">
                  {words.map((word, wordIdx) => {
                    const globalWordIndex = wordsBeforeLine + wordIdx;
                    const isColored = globalWordIndex < coloredWordCount;
                    
                    const transitionDelay = `${globalWordIndex * 10}ms`;
                    
                    return (
                      <span
                        key={wordIdx}
                        className={`inline-block transition-colors duration-500 ease-out mr-2 ${
                          isColored 
                            ? "text-orange-500" 
                            : "text-gray-400"
                        }`}
                        style={{ 
                          transitionDelay: isColored ? transitionDelay : '0ms'
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                  {lineIndex < linesWithWords.length - 1 && <br />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}