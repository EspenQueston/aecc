import { useState, useEffect } from 'react';

export default function ScrollWidget() {
  const [show, setShow] = useState(false);
  const [atBottom, setAtBottom] = useState(false);

  useEffect(() => {
    function onScroll() {
      const scrollY = window.scrollY;
      const windowH = window.innerHeight;
      const docH = document.documentElement.scrollHeight;

      setShow(scrollY > 300);
      setAtBottom(scrollY + windowH >= docH - 100);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function scrollTo(direction) {
    if (direction === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  }

  if (!show) return null;

  return (
    <div className="scroll-widget">
      {atBottom ? (
        <button className="scroll-widget-btn" onClick={() => scrollTo('top')} title="Remonter en haut">
          <i className="fas fa-chevron-up"></i>
        </button>
      ) : (
        <>
          <button className="scroll-widget-btn" onClick={() => scrollTo('top')} title="Remonter en haut">
            <i className="fas fa-chevron-up"></i>
          </button>
          <button className="scroll-widget-btn" onClick={() => scrollTo('bottom')} title="Aller en bas">
            <i className="fas fa-chevron-down"></i>
          </button>
        </>
      )}
    </div>
  );
}
