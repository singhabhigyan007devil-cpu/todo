import { useEffect, useRef } from 'react';

const COLORS = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];

interface Particle {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  rotationSpeed: number;
  scale: number;
  opacity: number;
}

export function Confetti({ active }: { active: boolean }) {
  const particlesRef = useRef<Particle[]>([]);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const container = document.body;
    const particleCount = 40;
    const particles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.backgroundColor = COLORS[Math.floor(Math.random() * COLORS.length)];
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
      el.style.width = `${6 + Math.random() * 8}px`;
      el.style.height = `${6 + Math.random() * 8}px`;
      el.style.left = `${window.innerWidth / 2}px`;
      el.style.top = `${window.innerHeight / 2}px`;
      container.appendChild(el);

      particles.push({
        el,
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        vx: (Math.random() - 0.5) * 20,
        vy: -Math.random() * 18 - 5,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10,
        scale: 0.5 + Math.random() * 0.8,
        opacity: 1,
      });
    }

    particlesRef.current = particles;

    const animate = () => {
      let allDone = true;
      particles.forEach((p) => {
        p.x += p.vx;
        p.vy += 0.35;
        p.y += p.vy;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          allDone = false;
          p.el.style.transform = `translate(${p.x - window.innerWidth / 2}px, ${p.y - window.innerHeight / 2}px) rotate(${p.rotation}deg) scale(${p.scale})`;
          p.el.style.opacity = String(p.opacity);
        } else {
          p.el.style.opacity = '0';
        }
      });

      if (!allDone) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        particles.forEach((p) => p.el.remove());
        particlesRef.current = [];
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      particles.forEach((p) => p.el.remove());
      particlesRef.current = [];
    };
  }, [active]);

  return null;
}
