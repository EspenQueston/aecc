import { useState } from 'react';

export default function ExpandableText({ text, className = '' }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <p className={`${className} ${expanded ? 'expanded' : ''}`}>{text}</p>
      <button
        className={`card-expand-btn ${expanded ? 'expanded' : ''}`}
        onClick={e => { e.preventDefault(); e.stopPropagation(); setExpanded(!expanded); }}
      >
        {expanded ? 'Moins' : 'Plus'} <i className="fas fa-chevron-down"></i>
      </button>
    </>
  );
}
