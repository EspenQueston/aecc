import { Link } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

/* ── Member data ────────────────────────────────────────────── */
const BUREAU = [
  {
    slug: 'rinel',
    name: 'Rinel',
    fullname: 'Rinel',
    role: 'Président',
    initials: 'RI',
    color: '#B7222D',
    grad: 'linear-gradient(135deg,#B7222D,#e04455)',
    icon: 'fas fa-crown',
    bio: "Chargé de la coordination et de l'orientation de l'AECC. Représente l'association dans tous les actes de vie civile et veille au bon fonctionnement de toutes les structures.",
    tags: ['Direction générale', 'Représentation', 'Coordination'],
    email: 'president@aecc.org',
  },
  {
    slug: 'cleve',
    name: 'Cleve',
    fullname: 'Cleve',
    role: 'Secrétaire Général',
    initials: 'CL',
    color: '#2563eb',
    grad: 'linear-gradient(135deg,#1d4ed8,#3b82f6)',
    icon: 'fas fa-file-alt',
    bio: "Assure l'administration, la rédaction des procès-verbaux et la tenue des archives. Assure l'intérim du Président en cas d'absence.",
    tags: ['Administration', 'Archives', 'Procès-verbaux'],
    email: 'secretariat@aecc.org',
  },
  {
    slug: 'mabiala',
    name: 'Roland Mabiala',
    fullname: 'Roland Naguydem Mabiala',
    role: 'Secrétaire Socio-culturel',
    initials: 'RM',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    icon: 'fas fa-bullhorn',
    bio: "Doctorant à BFSU Beijing. Assure la mobilisation, la communication et l'accueil des étudiants. Organise les événements sociaux et culturels de l'AECC.",
    tags: ['Communication', 'Mobilisation', 'Culture'],
    email: 'mabialaroland@hotmail.com',
  },
  {
    slug: 'exauce',
    name: 'Exauce',
    fullname: 'Exauce',
    role: 'Trésorier Général',
    initials: 'EX',
    color: '#d97706',
    grad: 'linear-gradient(135deg,#b45309,#f59e0b)',
    icon: 'fas fa-wallet',
    bio: "Gestionnaire des ressources financières et du patrimoine. Cosignataire des sorties de fonds. Assure la transparence et l'équilibre budgétaire de l'AECC.",
    tags: ['Comptabilité', 'Gestion financière', 'Transparence'],
    email: 'tresorerie@aecc.org',
  },
  {
    slug: 'cluivert',
    name: 'Cluivert Moukendi',
    fullname: 'Cluivert Moukendi',
    role: 'Responsable Technique',
    initials: 'CM',
    color: '#059669',
    grad: 'linear-gradient(135deg,#047857,#10b981)',
    icon: 'fas fa-cogs',
    bio: "Master en IA à Beihang University. Développeur fullstack passionné. Gère le site web, les réseaux sociaux, les outils numériques et l'infrastructure de l'AECC.",
    tags: ['Développement web', 'Intelligence Artificielle', 'Infrastructure'],
    email: 'cluivertmoukendi@gmail.com',
  },
];

const COMMISSION = [
  {
    slug: 'gloire',
    name: 'Gloire',
    fullname: 'Gloire',
    role: 'Commissaire',
    initials: 'GL',
    color: '#dc2626',
    grad: 'linear-gradient(135deg,#b91c1c,#ef4444)',
    icon: 'fas fa-gavel',
    bio: "Veille à la bonne gestion des finances, au bon fonctionnement des instances et à l'exécution des activités de l'association selon les Statuts.",
    tags: ['Contrôle', 'Audit', 'Statuts'],
    email: 'commission@aecc.org',
  },
  {
    slug: 'diba-grace',
    name: 'Diba Grace',
    fullname: 'Diba Grace',
    role: 'Rapporteur',
    initials: 'DG',
    color: '#0891b2',
    grad: 'linear-gradient(135deg,#0e7490,#06b6d4)',
    icon: 'fas fa-pen-fancy',
    bio: "Rédige les rapports de la Commission, assiste le Commissaire dans ses fonctions et présente les conclusions à l'Assemblée Générale.",
    tags: ['Rédaction', 'Rapports', 'Assemblée Générale'],
    email: 'dibawang@hotmail.com',
  },
];

/* ── Card Component ─────────────────────────────────────────── */
function MemberCard({ member, index }) {
  return (
    <Link to={`/equipe/${member.slug}`} className="eq-card" style={{ '--m-color': member.color, animationDelay: `${index * 0.06}s` }}>
      {/* Top accent bar */}
      <div className="eq-card-bar" style={{ background: member.grad }} />

      {/* Avatar */}
      <div className="eq-card-avatar" style={{ background: member.grad }}>
        <span>{member.initials}</span>
      </div>

      {/* Role badge */}
      <span className="eq-role-badge" style={{ background: `${member.color}18`, color: member.color, border: `1px solid ${member.color}28` }}>
        <i className={member.icon}></i> {member.role}
      </span>

      {/* Name */}
      <h3 className="eq-card-name">{member.name}</h3>

      {/* Bio */}
      <p className="eq-card-bio">{member.bio}</p>

      {/* Tags */}
      <div className="eq-tags">
        {member.tags.map((t, i) => (
          <span key={i} className="eq-tag">{t}</span>
        ))}
      </div>

      {/* Footer */}
      <div className="eq-card-footer">
        <span className="eq-profile-link">
          Voir le profil <i className="fas fa-arrow-right"></i>
        </span>
        {member.email && (
          <button
            className="eq-email-btn"
            onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `mailto:${member.email}`; }}
            title={member.email}
            type="button"
          >
            <i className="fas fa-envelope"></i>
          </button>
        )}
      </div>
    </Link>
  );
}

/* ── Page ───────────────────────────────────────────────────── */
export default function Equipe() {
  return (
    <>
      <PageHero
        badge="Notre Organisation"
        title="L'Équipe AECC"
        subtitle="Les hommes et femmes dévoués qui font vivre, grandissent et représentent la communauté des étudiants congolais en Chine"
        icon="fas fa-users"
      />

      <div className="section eq-page">
        <div className="container">

          {/* ── Bureau Exécutif ── */}
          <div className="eq-section-header">
            <div className="eq-section-label" style={{ background: 'rgba(183,34,45,.08)', color: '#B7222D', border: '1px solid rgba(183,34,45,.18)' }}>
              <i className="fas fa-users-cog"></i>
              <span>Bureau Exécutif</span>
            </div>
            <h2>Direction de l'Association</h2>
            <p>Les membres élus qui coordonnent et dirigent toutes les activités de l'AECC au quotidien</p>
          </div>

          <div className="eq-grid">
            {BUREAU.map((m, i) => <MemberCard key={m.slug} member={m} index={i} />)}
          </div>

          {/* ── Divider ── */}
          <div className="eq-divider">
            <div className="eq-divider-line"></div>
            <div className="eq-divider-badge">
              <i className="fas fa-balance-scale"></i>
            </div>
            <div className="eq-divider-line"></div>
          </div>

          {/* ── Commission ── */}
          <div className="eq-section-header">
            <div className="eq-section-label" style={{ background: 'rgba(14,124,66,.08)', color: '#0E7C42', border: '1px solid rgba(14,124,66,.18)' }}>
              <i className="fas fa-gavel"></i>
              <span>Commission de Contrôle</span>
            </div>
            <h2>Contrôle &amp; Discipline</h2>
            <p>L'organe indépendant qui veille à la transparence, au respect des Statuts et au bon fonctionnement de toutes les instances</p>
          </div>

          <div className="eq-grid eq-grid--commission">
            {COMMISSION.map((m, i) => <MemberCard key={m.slug} member={m} index={i} />)}
          </div>

          {/* ── Call to action ── */}
          <div className="eq-cta-block">
            <div className="eq-cta-inner">
              <i className="fas fa-handshake eq-cta-icon"></i>
              <h3>Envie de nous rejoindre ?</h3>
              <p>L'AECC accueille tous les étudiants congolais étudiant en Chine. Rejoignez notre communauté et participez à la vie associative.</p>
              <div className="eq-cta-btns">
                <Link to="/register" className="btn btn-primary btn-lg">
                  <i className="fas fa-user-plus"></i> Rejoindre l'AECC
                </Link>
                <Link to="/contact" className="btn btn-outline btn-lg">
                  <i className="fas fa-envelope"></i> Nous contacter
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
