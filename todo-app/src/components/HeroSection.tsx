import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HeroSectionProps {
  onDismiss: () => void;
}

export function HeroSection({ onDismiss }: HeroSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const taglineRef = useRef<HTMLSpanElement[]>([]);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const meshRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(meshRef.current, { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1.2 });
      tl.fromTo(badgeRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 0.4);
      tl.fromTo(taglineRef.current, { y: 30, opacity: 0, rotateX: 15 }, { y: 0, opacity: 1, rotateX: 0, stagger: 0.08, duration: 0.6 }, 0.5);
      tl.fromTo(subtitleRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, 1.0);
      tl.fromTo(ctaRef.current, { y: 12, opacity: 0, scale: 0.95 }, { y: 0, opacity: 1, scale: 1, duration: 0.4 }, 1.2);

      gsap.to(meshRef.current, { rotation: 360, duration: 60, repeat: -1, ease: 'none' });

      taglineRef.current.forEach((el) => {
        if (!el) return;
        el.addEventListener('mouseenter', () => {
          gsap.to(el, { y: -2, color: '#38bdf8', duration: 0.2, ease: 'power2.out' });
        });
        el.addEventListener('mouseleave', () => {
          gsap.to(el, { y: 0, color: '#fafafa', duration: 0.3, ease: 'power2.inOut' });
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const words = ['Build.', 'Ship.', 'Conquer.'];

  return (
    <div ref={sectionRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      <div ref={meshRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0 }}>
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px] opacity-30" style={{ background: 'radial-gradient(circle, #0070f3, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[100px] opacity-25" style={{ background: 'radial-gradient(circle, #7928ca, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px] opacity-20" style={{ background: 'radial-gradient(circle, #50e3c2, transparent)' }} />
      </div>

      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div ref={badgeRef} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 text-xs text-gray-400 font-medium opacity-0">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Focus Board &mdash; Ship your goals
        </div>

        <h1 className="text-6xl sm:text-7xl md:text-8xl font-bold tracking-tighter leading-none mb-6" style={{ perspective: '600px' }}>
          {words.map((word, i) => (
            <span
              key={word}
              ref={(el) => { taglineRef.current[i] = el; }}
              className="inline-block mr-4 sm:mr-6 text-[#fafafa] cursor-default"
              style={{
                textShadow: '0 0 80px rgba(0,112,243,0.3)',
              }}
            >
              {word}
            </span>
          ))}
        </h1>

        <p ref={subtitleRef} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-xl mx-auto leading-relaxed opacity-0">
          Organize your workflow, crush deadlines, and ship faster with a task management system built for builders.
        </p>

        <button
          ref={ctaRef}
          onClick={onDismiss}
          className="group relative px-8 py-3.5 text-sm font-medium text-white bg-blue-600 rounded-full hover:bg-blue-500 transition-all vercel-shadow-lg opacity-0"
        >
          <span className="relative z-10 flex items-center gap-2">
            Get Started
            <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </button>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-float">
        <span className="text-[10px] uppercase tracking-widest text-gray-600 font-mono">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-gray-600 to-transparent" />
      </div>
    </div>
  );
}
