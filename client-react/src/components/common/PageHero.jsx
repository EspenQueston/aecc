import { useEffect, useRef } from 'react';

/**
 * Reusable animated page hero banner.
 * Props:
 *   badge     — short label above the title (e.g. "À Propos")
 *   title     — main h1 heading
 *   subtitle  — descriptive paragraph
 *   icon      — Font Awesome class for the decorative icon (e.g. "fas fa-info-circle")
 *   back      — optional back-button handler (function) — renders a back button when provided
 *   accent    — optional override hex color for the decorative ring (defaults to primary)
 *   size      — "sm" for compact variant
 */
export default function PageHero({ badge, title, subtitle, icon = 'fas fa-star', back, accent, size }) {
  const canvasRef = useRef(null);

  // Lightweight dot-field animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let raf;
    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;
    canvas.width = W;
    canvas.height = H;

    const dots = Array.from({ length: 38 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.6 + 0.4,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.35 + 0.08,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      dots.forEach(d => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0) d.x = W;
        if (d.x > W) d.x = 0;
        if (d.y < 0) d.y = H;
        if (d.y > H) d.y = 0;
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${d.o})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };

    draw();

    const resize = () => {
      W = canvas.offsetWidth;
      H = canvas.offsetHeight;
      canvas.width = W;
      canvas.height = H;
    };
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  const accentColor = accent || 'var(--primary)';

  return (
    <section className={`ph-hero${size === 'sm' ? ' ph-hero-sm' : ''}`}>
      {/* Canvas dot field */}
      <canvas className="ph-canvas" ref={canvasRef} aria-hidden="true" />

      {/* Decorative rings */}
      <div className="ph-ring ph-ring-1" style={{ borderColor: `${accentColor}22` }} aria-hidden="true" />
      <div className="ph-ring ph-ring-2" style={{ borderColor: `${accentColor}14` }} aria-hidden="true" />

      {/* Diagonal accent bar */}
      <div className="ph-diagonal" aria-hidden="true" />

      {/* Content */}
      <div className="container ph-inner">
        <div className="ph-left">
          {back && (
            <button className="ph-back" onClick={back}>
              <i className="fas fa-arrow-left"></i> Retour
            </button>
          )}
          <span className="ph-badge">{badge}</span>
          <h1 className="ph-title">{title}</h1>
          {subtitle && <p className="ph-sub">{subtitle}</p>}
          <div className="ph-divider" style={{ background: accentColor }} />
        </div>

        {/* Decorative icon orb */}
        <div className="ph-orb" aria-hidden="true">
          <div className="ph-orb-ring" style={{ borderColor: `${accentColor}40` }} />
          <div className="ph-orb-core" style={{ background: `${accentColor}18`, boxShadow: `0 0 48px 0 ${accentColor}30` }}>
            <i className={icon} style={{ color: accentColor }}></i>
          </div>
        </div>
      </div>

      {/* Bottom wave clip */}
      <div className="ph-wave" aria-hidden="true" />
    </section>
  );
}
