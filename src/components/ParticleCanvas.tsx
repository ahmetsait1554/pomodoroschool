import { useEffect, useRef } from 'react';
import type { ParticleEffectType } from '@/lib/constants';

type Props = {
  effect: ParticleEffectType;
  intensity: number;
};

type Particle = {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
  color: string;
};

export default function ParticleCanvas({ effect, intensity }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const baseCount = effect === 'rain' ? 120 : effect === 'snow' ? 80 : 40;
    const count = Math.max(5, Math.round(baseCount * intensity));

    function createParticle(): Particle {
      const w = canvas!.width;
      const h = canvas!.height;
      if (effect === 'rain') {
        return {
          x: Math.random() * w,
          y: Math.random() * h - h,
          size: 1 + Math.random() * 2,
          speedX: -0.5,
          speedY: 8 + Math.random() * 10,
          rotation: 0,
          rotationSpeed: 0,
          opacity: 0.2 + Math.random() * 0.3,
          color: 'rgba(180, 200, 230, 1)',
        };
      }
      if (effect === 'snow') {
        return {
          x: Math.random() * w,
          y: Math.random() * h - h,
          size: 1.5 + Math.random() * 3,
          speedX: (Math.random() - 0.5) * 0.5,
          speedY: 0.5 + Math.random() * 1.5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.02,
          opacity: 0.3 + Math.random() * 0.5,
          color: 'rgba(255, 255, 255, 1)',
        };
      }
      // leaves
      const leafColors = ['#d97706', '#b45309', '#92400e', '#dc2626', '#a16207'];
      return {
        x: Math.random() * w,
        y: Math.random() * h - h,
        size: 6 + Math.random() * 8,
        speedX: -1 + Math.random() * 2,
        speedY: 0.5 + Math.random() * 1.5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
        opacity: 0.4 + Math.random() * 0.4,
        color: leafColors[Math.floor(Math.random() * leafColors.length)],
      };
    }

    particlesRef.current = Array.from({ length: count }, createParticle);

    function drawRain(p: Particle) {
      if (!ctx) return;
      ctx.strokeStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.lineWidth = p.size;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + p.speedX * 2, p.y + p.speedY * 2);
      ctx.stroke();
    }

    function drawSnow(p: Particle) {
      if (!ctx) return;
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    function drawLeaf(p: Particle) {
      if (!ctx) return;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rotation);
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-p.size, 0);
      ctx.lineTo(p.size, 0);
      ctx.stroke();
      ctx.restore();
    }

    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;

      for (const p of particlesRef.current) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        if (effect === 'leaves') {
          p.speedX += Math.sin(p.y * 0.01) * 0.05;
          p.speedX = Math.max(-2, Math.min(2, p.speedX));
        }

        if (p.y > h + 20) {
          p.y = -20;
          p.x = Math.random() * w;
        }
        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;

        if (effect === 'rain') drawRain(p);
        else if (effect === 'snow') drawSnow(p);
        else drawLeaf(p);
      }
      ctx.globalAlpha = 1;
      animationRef.current = requestAnimationFrame(animate);
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [effect, intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
