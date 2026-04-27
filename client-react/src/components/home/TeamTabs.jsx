import { useState } from 'react';
import { Link } from 'react-router-dom';

const BUREAU_MEMBERS = [
  { slug: 'rinel', name: 'Rinel', role: 'Président', desc: "Chargé de la coordination et de l'orientation de l'association. Représente l'AECC auprès des autorités et partenaires.", icon: 'fas fa-crown', color: '#B7222D', initials: 'RI' },
  { slug: 'cleve', name: 'Cleve', role: 'Secrétaire Général', desc: "Chargé de l'administration, de la rédaction des procès-verbaux et de la tenue des archives de l'association.", icon: 'fas fa-file-alt', color: '#2563eb', initials: 'CL' },
  { slug: 'mabiala', name: 'Mabiala', role: 'Secrétaire Socio-culturel', desc: "Assure la mobilisation, la communication, l'accueil et le suivi des étudiants congolais.", icon: 'fas fa-bullhorn', color: '#7c3aed', initials: 'MA' },
  { slug: 'exauce', name: 'Exauce', role: 'Trésorier Général', desc: 'Gestionnaire des ressources financières et du patrimoine. Cosignataire des sorties de fonds avec le Président.', icon: 'fas fa-wallet', color: '#d97706', initials: 'EX' },
  { slug: 'cluivert', name: 'Cluivert', role: 'Responsable Technique', desc: "Gère le site web, les réseaux sociaux, les outils numériques et l'infrastructure technique de l'AECC.", icon: 'fas fa-cogs', color: '#059669', initials: 'CV' },
];

const COMMISSION_MEMBERS = [
  { slug: 'gloire', name: 'Gloire', role: 'Commissaire', desc: "Veille à la bonne gestion des finances, au bon fonctionnement des instances et à l'exécution des activités de l'association.", icon: 'fas fa-gavel', color: '#dc2626', initials: 'GL' },
  { slug: 'diba-grace', name: 'Diba Grace', role: 'Rapporteur', desc: "Rédige les rapports de la commission, assiste le Commissaire et présente les conclusions à l'Assemblée Générale.", icon: 'fas fa-pen-fancy', color: '#0891b2', initials: 'DG' },
];

const TABS = [
  {
    id: 'bureau',
    icon: 'fas fa-users-cog',
    label: 'Bureau Exécutif',
    sublabel: '5 membres',
    badge: 'Direction',
    title: "Bureau Exécutif",
    tagline: "La direction opérationnelle de l'AECC",
    desc: "Les membres dévoués qui dirigent et coordonnent toutes les activités de l'association. Ils représentent officiellement la communauté et veillent à l'accomplissement de la mission de l'AECC en Chine.",
    missions: [
      { icon: 'fas fa-landmark', text: 'Représentation officielle auprès des autorités' },
      { icon: 'fas fa-tasks', text: 'Coordination des activités associatives' },
      { icon: 'fas fa-hand-holding-usd', text: 'Gestion administrative et financière' },
      { icon: 'fas fa-satellite-dish', text: 'Communication et relations membres' },
    ],
    accent: '#B7222D',
    members: BUREAU_MEMBERS,
  },
  {
    id: 'commission',
    icon: 'fas fa-balance-scale',
    label: 'Contrôle & Discipline',
    sublabel: '2 membres',
    badge: 'Organe Indépendant',
    title: "Commission de Contrôle",
    tagline: "Garant de la transparence et des Statuts",
    desc: "Organe indépendant garant de la bonne gestion et du respect des Statuts. La commission assure la transparence, l'équité et le bon fonctionnement de toutes les instances associatives.",
    missions: [
      { icon: 'fas fa-search-dollar', text: 'Contrôle de la gestion financière' },
      { icon: 'fas fa-file-contract', text: 'Vérification du respect des statuts' },
      { icon: 'fas fa-bullhorn', text: 'Rapport à l\'Assemblée Générale' },
      { icon: 'fas fa-handshake', text: 'Résolution des litiges internes' },
    ],
    accent: '#0E7C42',
    members: COMMISSION_MEMBERS,
  },
];

export default function TeamTabs() {
  const [active, setActive] = useState('bureau');
  const tab = TABS.find(t => t.id === active);

  return (
    <section className="tt-section section">
      <div className="container">

        <div className="section-header">
          <span className="section-badge">Notre Organisation</span>
          <h2>L'Équipe qui fait vivre l'AECC</h2>
          <p>Découvrez les personnes engagées qui animent, organisent et représentent notre communauté</p>
        </div>

        <div className="tt-switcher" role="tablist">
          {TABS.map(t => (
            <button
              key={t.id}
              role="tab"
              aria-selected={active === t.id}
              className={`tt-switch-btn${active === t.id ? ' tt-switch-active' : ''}`}
              style={active === t.id ? { '--tt-accent': t.accent } : {}}
              onClick={() => setActive(t.id)}
            >
              <span className="tt-switch-icon" style={active === t.id ? { background: `${t.accent}20`, color: t.accent } : {}}>
                <i className={t.icon}></i>
              </span>
              <span className="tt-switch-text">
                <strong>{t.label}</strong>
                <em>{t.sublabel}</em>
              </span>
            </button>
          ))}
        </div>

        <div className="tt-panel" key={tab.id}>
          <div className="tt-org-card" style={{ '--tt-accent': tab.accent }}>
            <div className="tt-org-card-top" style={{ background: `linear-gradient(135deg, ${tab.accent}14, ${tab.accent}06)`, borderBottom: `1px solid ${tab.accent}20` }}>
              <div className="tt-org-icon-wrap" style={{ background: `${tab.accent}18`, border: `1.5px solid ${tab.accent}28` }}>
                <i className={tab.icon} style={{ color: tab.accent }}></i>
              </div>
              <span className="tt-org-badge" style={{ background: `${tab.accent}12`, color: tab.accent, border: `1px solid ${tab.accent}25` }}>
                {tab.badge}
              </span>
              <h3 className="tt-org-title">{tab.title}</h3>
              <p className="tt-org-tagline">{tab.tagline}</p>
            </div>
            <div className="tt-org-card-body">
              <p className="tt-org-desc">{tab.desc}</p>
              <ul className="tt-missions">
                {tab.missions.map((m, i) => (
                  <li key={i}>
                    <span className="tt-mission-icon" style={{ background: `${tab.accent}12`, color: tab.accent }}>
                      <i className={m.icon}></i>
                    </span>
                    <span>{m.text}</span>
                  </li>
                ))}
              </ul>
              <Link to="/equipe" className="tt-org-cta" style={{ background: tab.accent }}>
                <i className="fas fa-users"></i> Voir tous les profils
              </Link>
            </div>
          </div>

          <div className={`tt-members-grid${tab.members.length <= 2 ? ' tt-members-grid--sm' : ''}`}>
            {tab.members.map((m, i) => (
              <Link key={i} to={`/equipe/${m.slug}`} className="tt-member-card" style={{ '--m-color': m.color }}>
                <div className="tt-member-avatar" style={{ background: `linear-gradient(135deg, ${m.color}, ${m.color}99)` }}>
                  <span>{m.initials}</span>
                </div>
                <div className="tt-member-info">
                  <div className="tt-member-header">
                    <h4>{m.name}</h4>
                    <i className="fas fa-arrow-up-right-from-square tt-member-link-icon"></i>
                  </div>
                  <span className="tt-member-role" style={{ color: m.color, background: `${m.color}10` }}>{m.role}</span>
                  <p className="tt-member-desc">{m.desc}</p>
                </div>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
