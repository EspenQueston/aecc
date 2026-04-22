import { useState } from 'react';
import { Link } from 'react-router-dom';

const TABS = [
  {
    id: 'bourses',
    icon: 'fas fa-graduation-cap',
    label: "Bourses d'Études",
    badge: 'Financement',
    title: "Décrochez votre bourse pour étudier en Chine",
    description:
      "L'AECC vous guide dans vos candidatures aux bourses CSC, provinciales et universitaires. Des centaines d'étudiants congolais ont bénéficié de ces opportunités pour financer leurs études en République Populaire de Chine.",
    cta: 'Explorer les bourses',
    ctaLink: '/bourses',
    accentColor: '#B7222D',
    visual: {
      icon: 'fas fa-graduation-cap',
      items: [
        { icon: '🇨🇳', label: 'Bourse CSC', sub: 'Gouvernement Chinois' },
        { icon: '🏛️', label: 'Bourse Provinciale', sub: 'Gouvernements Locaux' },
        { icon: '🎓', label: 'Bourse Universitaire', sub: 'Mérite Académique' },
        { icon: '🇨🇬', label: 'Bourse Congo', sub: 'Gouvernement Congolais' },
      ],
    },
  },
  {
    id: 'activites',
    icon: 'fas fa-users',
    label: 'Activités Culturelles',
    badge: 'Communauté',
    title: "Restez connecté à la communauté congolaise",
    description:
      "Participez à nos activités culturelles, sportives et sociales organisées à travers toute la Chine. L'AECC crée des espaces de rencontre pour que chaque étudiant se sente chez lui, loin de chez lui.",
    cta: 'Voir les activités',
    ctaLink: '/activites',
    accentColor: '#0E7C42',
    visual: {
      icon: 'fas fa-star',
      items: [
        { icon: '🎭', label: 'Événements Culturels', sub: 'Musique, danse, art' },
        { icon: '⚽', label: 'Sports & Loisirs', sub: 'Tournois inter-villes' },
        { icon: '🎓', label: 'Ateliers Académiques', sub: 'Partage de savoirs' },
        { icon: '🤝', label: 'Entraide Sociale', sub: 'Accueil des nouveaux' },
      ],
    },
  },
  {
    id: 'relations',
    icon: 'fas fa-handshake',
    label: 'Relations Sino-Congolaises',
    badge: 'Diplomatie',
    title: "Renforcez les liens entre le Congo et la Chine",
    description:
      "Découvrez l'histoire des relations diplomatiques, économiques et culturelles entre la République du Congo et la Chine. Une coopération solide qui ouvre des portes pour les étudiants et professionnels congolais.",
    cta: 'En savoir plus',
    ctaLink: '/relations',
    accentColor: '#2563eb',
    visual: {
      icon: 'fas fa-globe-africa',
      items: [
        { icon: '🤝', label: 'Diplomatie', sub: 'Relations depuis 1964' },
        { icon: '💼', label: 'Commerce', sub: 'Partenariats économiques' },
        { icon: '🎓', label: 'Éducation', sub: 'Programmes d\'échange' },
        { icon: '🏗️', label: 'Infrastructures', sub: 'Projets de développement' },
      ],
    },
  },
];

export default function CardFeatureTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active);

  return (
    <section className="cft-section">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <span className="section-badge">Tout en un</span>
          <h2>Ce que l'AECC vous offre</h2>
          <p>Bourses, activités communautaires et ressources diplomatiques — tout pour réussir votre parcours en Chine</p>
        </div>

        {/* Tab triggers */}
        <div className="cft-tabs">
          {TABS.map((t) => (
            <button
              key={t.id}
              className={`cft-tab${active === t.id ? ' cft-tab-active' : ''}`}
              onClick={() => setActive(t.id)}
              style={active === t.id ? { '--tab-accent': t.accentColor } : {}}
            >
              <i className={t.icon} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panel */}
        <div className="cft-panel" key={tab.id}>
          {/* Left: text content */}
          <div className="cft-text">
            <span className="cft-badge" style={{ color: tab.accentColor, borderColor: `${tab.accentColor}30`, background: `${tab.accentColor}0d` }}>
              {tab.badge}
            </span>
            <h3 className="cft-title">{tab.title}</h3>
            <p className="cft-desc">{tab.description}</p>
            <Link to={tab.ctaLink} className="btn btn-primary cft-cta">
              {tab.cta} <i className="fas fa-arrow-right" />
            </Link>
          </div>

          {/* Right: visual illustration */}
          <div className="cft-visual" style={{ '--vis-accent': tab.accentColor }}>
            <div className="cft-visual-inner">
              <div className="cft-vis-icon">
                <i className={tab.visual.icon} style={{ color: tab.accentColor }} />
              </div>
              <div className="cft-vis-grid">
                {tab.visual.items.map((item, i) => (
                  <div key={i} className="cft-vis-card">
                    <span className="cft-vis-emoji">{item.icon}</span>
                    <div>
                      <strong>{item.label}</strong>
                      <small>{item.sub}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
