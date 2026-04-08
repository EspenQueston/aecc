import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

export default function HeroBanner3D() {
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [counts, setCounts] = useState({ students: 0, universities: 0, provinces: 0 });
  const animFrameRef = useRef(null);

  // Animated counters
  useEffect(() => {
    const targets = { students: 500, universities: 50, provinces: 31 };
    const duration = 2000;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - t, 3);
      setCounts({
        students: Math.round(targets.students * ease),
        universities: Math.round(targets.universities * ease),
        provinces: Math.round(targets.provinces * ease),
      });
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, []);

  // Mouse parallax
  const handleMouseMove = useCallback((e) => {
    if (!heroRef.current) return;
    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setMousePos({ x, y });
  }, []);

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, particles;

    function resize() {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    }

    function initParticles() {
      particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: (Math.random() - 0.5) * 0.4,
        opacity: Math.random() * 0.5 + 0.2,
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx.fill();
      }
      // Draw connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(255,255,255,${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animFrameRef.current = requestAnimationFrame(draw);
    }

    resize();
    initParticles();
    draw();
    window.addEventListener('resize', () => { resize(); initParticles(); });

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <section className="hero-3d" ref={heroRef} onMouseMove={handleMouseMove}>
      <canvas ref={canvasRef} className="hero-3d-canvas" />
      <div className="hero-3d-bg-shapes">
        <div className="hero-shape hero-shape-1" style={{ transform: `translate(${mousePos.x * -15}px, ${mousePos.y * -15}px)` }} />
        <div className="hero-shape hero-shape-2" style={{ transform: `translate(${mousePos.x * 10}px, ${mousePos.y * 10}px)` }} />
        <div className="hero-shape hero-shape-3" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * 12}px)` }} />
      </div>

      <div className="container hero-3d-container">
        <div className="hero-3d-content">
          <div className="hero-3d-badge">
            <span className="hero-3d-badge-dot" />
            <span>Depuis l'an 2000 — Pékin, Chine</span>
          </div>
          <h1 className="hero-3d-title">
            <span className="hero-3d-title-line">Association des</span>
            <span className="hero-3d-title-line hero-3d-title-accent">Étudiants Congolais</span>
            <span className="hero-3d-title-line">en Chine</span>
          </h1>
          <p className="hero-3d-desc">
            Une communauté unie pour connecter, soutenir et accompagner les étudiants congolais de la République du Congo à travers toute la Chine
          </p>
          <div className="hero-3d-buttons">
            <Link to="/register" className="btn btn-hero-primary">
              <i className="fas fa-user-plus" /> Rejoignez-nous
            </Link>
            <Link to="/about" className="btn btn-hero-glass">
              <i className="fas fa-play-circle" /> Découvrir l'AECC
            </Link>
          </div>
          <div className="hero-3d-trust">
            <div className="hero-trust-pill"><i className="fas fa-shield-alt" /> Gratuit</div>
            <div className="hero-trust-pill"><i className="fas fa-lock" /> Sécurisé</div>
            <div className="hero-trust-pill"><i className="fas fa-users" /> Communautaire</div>
          </div>

          {/* Mobile-only mini stats strip */}
          <div className="hero-mobile-stats">
            <div className="hero-mobile-stat">
              <i className="fas fa-users" style={{ color: '#0E7C42' }} />
              <strong>{counts.students}+</strong>
              <span>Étudiants</span>
            </div>
            <div className="hero-mobile-stat">
              <i className="fas fa-university" style={{ color: '#FBDE44' }} />
              <strong>{counts.universities}+</strong>
              <span>Universités</span>
            </div>
            <div className="hero-mobile-stat">
              <i className="fas fa-map-marked-alt" style={{ color: '#B7222D' }} />
              <strong>{counts.provinces}</strong>
              <span>Provinces</span>
            </div>
          </div>
        </div>

        <div className="hero-3d-visual" style={{ transform: `perspective(1000px) rotateY(${mousePos.x * 5}deg) rotateX(${mousePos.y * -5}deg)` }}>
          <div className="hero-3d-globe">
            <div className="globe-ring globe-ring-1" />
            <div className="globe-ring globe-ring-2" />
            <div className="globe-ring globe-ring-3" />
            <div className="globe-core">
              <i className="fas fa-globe-africa" />
            </div>
            {/* Floating icons */}
            <div className="globe-float globe-float-1" style={{ transform: `translate(${mousePos.x * 8}px, ${mousePos.y * 8}px)` }}>
              <i className="fas fa-graduation-cap" />
            </div>
            <div className="globe-float globe-float-2" style={{ transform: `translate(${mousePos.x * -6}px, ${mousePos.y * 6}px)` }}>
              <i className="fas fa-book-open" />
            </div>
            <div className="globe-float globe-float-3" style={{ transform: `translate(${mousePos.x * 5}px, ${mousePos.y * -7}px)` }}>
              <i className="fas fa-handshake" />
            </div>
          </div>

          {/* Mini stat cards floating around */}
          <div className="hero-float-card hero-float-card-1">
            <div className="hfc-icon" style={{ color: '#0E7C42' }}><i className="fas fa-users" /></div>
            <div><strong>{counts.students}+</strong><small>Étudiants</small></div>
          </div>
          <div className="hero-float-card hero-float-card-2">
            <div className="hfc-icon" style={{ color: '#FBDE44' }}><i className="fas fa-university" /></div>
            <div><strong>{counts.universities}+</strong><small>Universités</small></div>
          </div>
          <div className="hero-float-card hero-float-card-3">
            <div className="hfc-icon" style={{ color: '#B7222D' }}><i className="fas fa-map-marked-alt" /></div>
            <div><strong>{counts.provinces}</strong><small>Provinces</small></div>
          </div>
        </div>
      </div>
    </section>
  );
}
