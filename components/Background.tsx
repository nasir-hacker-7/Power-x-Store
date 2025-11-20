import React, { useEffect, useRef } from 'react';

export const Background: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    
    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', resize);
    resize();

    // 3D/Network effect configuration
    const particles: Array<{x: number, y: number, dx: number, dy: number, size: number}> = [];
    // Adjust particle density based on screen size
    const particleCount = Math.min(100, Math.floor((width * height) / 15000));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        dx: (Math.random() - 0.5) * 0.5,
        dy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }

    let frameId: number;
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Draw particles
      ctx.fillStyle = '#f59e0b'; // gold-500
      
      particles.forEach((p, i) => {
        p.x += p.dx;
        p.y += p.dy;

        // Bounce off walls
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;

        // Draw particle
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw connections (The "3D" Network look)
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            ctx.beginPath();
            ctx.strokeStyle = '#f59e0b';
            ctx.globalAlpha = 0.15 * (1 - dist / 150);
            ctx.lineWidth = 1;
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      });

      frameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none -z-10 bg-dark-900" 
      style={{ opacity: 0.8 }}
    />
  );
};