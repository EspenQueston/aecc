import { useEffect, useRef } from 'react';

/**
 * Animated world-map dot canvas — inspired by signups.txt DotMap.
 * Routes adapted to Congo → China with project primary (#B7222D) & accent (#0E7C42) colors.
 */
export default function AuthDotMap() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let startTime = Date.now();

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement);

    // ── Generate world-continent dot grid ──────────────────────────────
    const generateDots = () => {
      const dots = [];
      const w = canvas.width;
      const h = canvas.height;
      const gap = 10;
      for (let x = gap / 2; x < w; x += gap) {
        for (let y = gap / 2; y < h; y += gap) {
          const rx = x / w;
          const ry = y / h;
          const inLand =
            // North America
            (rx > .04 && rx < .26 && ry > .1 && ry < .46) ||
            // South America
            (rx > .11 && rx < .27 && ry > .45 && ry < .83) ||
            // Europe
            (rx > .3 && rx < .52 && ry > .1 && ry < .40) ||
            // Africa — Congo is centre-left
            (rx > .32 && rx < .55 && ry > .37 && ry < .74) ||
            // Asia — China is right-centre
            (rx > .55 && rx < .84 && ry > .08 && ry < .56) ||
            // Australia
            (rx > .65 && rx < .83 && ry > .60 && ry < .83);
          if (inLand && Math.random() > 0.3) {
            dots.push({
              x,
              y,
              r: Math.random() * 1.2 + 0.4,
              o: Math.random() * 0.28 + 0.07,
            });
          }
        }
      }
      return dots;
    };

    let dots = generateDots();

    // ── Route definitions (Congo → various China cities) ──────────────
    // Positions expressed as fractions of canvas; converted each frame.
    const ROUTE_DEFS = [
      { sx: .44, sy: .57, ex: .65, ey: .28, color: '#B7222D', delay: 0,   dur: 4.0 },
      { sx: .42, sy: .54, ex: .68, ey: .24, color: '#0E7C42', delay: 1.2, dur: 4.2 },
      { sx: .46, sy: .60, ex: .70, ey: .32, color: '#B7222D', delay: 2.6, dur: 3.8 },
      { sx: .43, sy: .56, ex: .63, ey: .30, color: '#0E7C42', delay: 0.6, dur: 4.5 },
    ];

    // ── Draw ─────────────────────────────────────────────────────────
    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      // Dot field
      dots.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.o})`;
        ctx.fill();
      });

      // Animated routes
      const elapsed = (Date.now() - startTime) / 1000;

      ROUTE_DEFS.forEach(rt => {
        const t = elapsed - rt.delay;
        if (t <= 0) return;
        const prog = Math.min(t / rt.dur, 1);

        const sx = rt.sx * w;
        const sy = rt.sy * h;
        const ex = rt.ex * w;
        const ey = rt.ey * h;

        // Current endpoint of the drawing line
        const cx = sx + (ex - sx) * prog;
        const cy = sy + (ey - sy) * prog;

        // Curved path (slight arc via control point)
        const cpx = (sx + ex) / 2;
        const cpy = Math.min(sy, ey) - h * 0.12;

        // Partial curve via a clipped linear approximation
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.quadraticCurveTo(cpx, cpy, cx, cy);
        ctx.strokeStyle = rt.color;
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = 0.55;
        ctx.stroke();
        ctx.restore();

        // Origin dot
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fillStyle = rt.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();
        ctx.globalAlpha = 1;

        // Moving dot + glow
        ctx.beginPath();
        ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = rt.color;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(cx, cy, 7, 0, Math.PI * 2);
        ctx.fillStyle = rt.color + '38';
        ctx.fill();

        // Destination dot (once arrived)
        if (prog >= 1) {
          ctx.beginPath();
          ctx.arc(ex, ey, 3, 0, Math.PI * 2);
          ctx.fillStyle = rt.color;
          ctx.fill();
          ctx.beginPath();
          ctx.arc(ex, ey, 7, 0, Math.PI * 2);
          ctx.fillStyle = rt.color + '38';
          ctx.fill();
        }
      });

      // Reset after full cycle
      if (elapsed > 15) {
        startTime = Date.now();
        dots = generateDots();
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div className="adm-wrap">
      <canvas ref={canvasRef} className="adm-canvas" />
    </div>
  );
}
