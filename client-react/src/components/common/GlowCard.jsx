import { useEffect, useRef } from 'react';

// Hue bases for glow colors
const glowColorMap = {
  red:    { base: 0,   spread: 200 },
  green:  { base: 120, spread: 200 },
  blue:   { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  orange: { base: 30,  spread: 200 },
  gold:   { base: 45,  spread: 180 },
};

export default function GlowCard({ children, className = '', glowColor = 'red' }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e;
      if (cardRef.current) {
        cardRef.current.style.setProperty('--x', x.toFixed(2));
        cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
        cardRef.current.style.setProperty('--y', y.toFixed(2));
        cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
      }
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor] || glowColorMap.red;

  const glowStyle = {
    '--base': base,
    '--spread': spread,
    '--radius': '14',
    '--border': '2',
    '--backdrop': 'rgba(10,10,26,0.72)',
    '--backup-border': 'rgba(255,255,255,0.07)',
    '--size': '220',
    '--outer': '1',
    '--border-size': 'calc(var(--border, 2) * 1px)',
    '--spotlight-size': 'calc(var(--size, 150) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.08)),
      transparent
    )`,
    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
    borderRadius: 'calc(var(--radius) * 1px)',
  };

  return (
    <div
      ref={cardRef}
      data-glow
      style={glowStyle}
      className={`glow-card ${className}`}
    >
      <div data-glow className="glow-card-inner"></div>
      {children}
    </div>
  );
}
