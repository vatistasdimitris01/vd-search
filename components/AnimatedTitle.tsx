import React, { useRef, useEffect } from 'react';

// Declare GSAP as a global variable since it's loaded from a CDN
declare const gsap: any;

interface AnimatedTitleProps {
  text: string;
  className?: string;
}

const lettersAndSymbols = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '!', '@', '#', '$', '%', '^', '&', '*', '-', '_', '+', '=', ';', ':', '<', '>', ','];

const AnimatedTitle: React.FC<AnimatedTitleProps> = ({ text, className }) => {
  const elementRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || typeof gsap === 'undefined') return;

    const words = text.split(' ');
    element.innerHTML = words.map(word => {
      const chars = word.split('').map(char => `<span class="char">${char === ' ' ? '&nbsp;' : char}</span>`).join('');
      return `<span class="word">${chars}</span>`;
    }).join(' ');

    const chars = Array.from(element.querySelectorAll('.char')) as HTMLElement[];
    const originalChars = chars.map(c => c.innerHTML);

    const animate = () => {
      gsap.killTweensOf(chars);
      
      chars.forEach((char, position) => {
        const initialHTML = originalChars[position];
        let repeatCount = 0;

        gsap.fromTo(char, 
          { 
            opacity: 0 
          }, 
          {
            duration: 0.03,
            innerHTML: () => lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)],
            opacity: 1,
            repeat: 3,
            repeatRefresh: true,
            repeatDelay: 0.04,
            delay: (position + 1) * 0.07,
            onStart: () => {
              gsap.set(char, { '--opa': 1 });
            },
            onRepeat: () => {
              repeatCount++;
              if (repeatCount === 1) {
                gsap.set(char, { '--opa': 0 });
              }
            },
            onComplete: () => {
              gsap.set(char, { 
                innerHTML: initialHTML,
                delay: 0.03
              });
            },
          }
        );
      });
    };

    // Animate on initial load
    const timeoutId = setTimeout(animate, 200);
    
    const triggerElement = element;
    triggerElement.addEventListener('mouseenter', animate);

    return () => {
      clearTimeout(timeoutId);
      triggerElement.removeEventListener('mouseenter', animate);
    };
  }, [text]);

  return <h1 ref={elementRef} className={className}>{text}</h1>;
};

export default AnimatedTitle;