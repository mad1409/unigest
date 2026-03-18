import { useEffect, useRef } from "react";

export default function ParticlesBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", resize);

    // Particules
    const particles = Array.from({ length: 60 }, () => ({
      x:    Math.random() * canvas.width,
      y:    Math.random() * canvas.height,
      r:    Math.random() * 2 + 1,
      vx:   (Math.random() - 0.5) * 0.4,
      vy:   (Math.random() - 0.5) * 0.4,
      alpha:Math.random() * 0.5 + 0.2,
    }));

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Fond gradient
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0,   "#061812");
      grad.addColorStop(0.5, "#0d2a1a");
      grad.addColorStop(1,   "#061812");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Lignes entre particules proches
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(52,211,153,${0.15 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Points
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(52,211,153,${p.alpha})`;
        ctx.fill();

        // Mouvement
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas ref={canvasRef} style={{
      position: "fixed", inset: 0, zIndex: 0,
      pointerEvents: "none",
    }}/>
  );
}
