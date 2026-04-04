import { useParams, Link } from 'react-router-dom';

const ALL_MEMBERS = {
  'rinel': {
    name: 'Rinel',
    role: 'Président',
    structure: 'Bureau Exécutif',
    icon: 'fas fa-crown',
    color: '#B7222D',
    photo: null,
    bio: 'Président de l\'Association des Étudiants Congolais en Chine (AECC). Conformément aux statuts (Art. 10), le Président est chargé de la coordination et de l\'orientation des activités de l\'association. Il représente l\'AECC dans les actes de vie civile et veille au bon fonctionnement des structures.',
    education: [],
    responsibilities: [
      'Coordonner, orienter et contrôler les activités de l\'Association (Art. 10)',
      'Représenter l\'Association dans les actes de vie civile',
      'Convoquer et présider les sessions de l\'Assemblée Générale',
      'Veiller au bon fonctionnement des structures de l\'Association',
      'Assurer la permanence de l\'Association',
      'Ordonnateur principal des dépenses (cosignataire avec le Trésorier)',
    ],
    contact: { email: 'president@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois', 'Lingala'],
  },
  'cleve': {
    name: 'Cleve',
    role: 'Secrétaire Général',
    structure: 'Bureau Exécutif',
    icon: 'fas fa-file-alt',
    color: '#2563eb',
    photo: null,
    bio: 'Secrétaire Général de l\'AECC. Conformément aux statuts (Art. 12), il assure l\'intérim du Président en cas d\'absence et veille au bon fonctionnement du bureau. Il est chargé de l\'administration et de l\'organisation de l\'association.',
    education: [],
    responsibilities: [
      'Assurer le bon fonctionnement du Bureau, notamment la régularité et la tenue des réunions (Art. 12)',
      'Rédiger les procès-verbaux des réunions et assemblées générales',
      'Tenir les archives et documents de l\'Association',
      'Assurer l\'intérim du Président en cas d\'absence',
      'Gérer la correspondance officielle de l\'Association',
    ],
    contact: { email: 'secretariat@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois'],
  },
  'mabiala': {
    name: 'Mabiala',
    role: 'Secrétaire Socio-culturel',
    structure: 'Bureau Exécutif',
    icon: 'fas fa-bullhorn',
    color: '#7c3aed',
    photo: null,
    bio: 'Secrétaire chargé aux relations publiques et aux affaires socio-culturelles de l\'AECC. Il a pour mission d\'assurer la mobilisation et la communication, d\'accueillir et suivre les étudiants congolais (Art. 13). Il assure l\'intérim du Secrétaire Général en cas d\'absence.',
    education: [],
    responsibilities: [
      'Assurer la mobilisation et la communication de l\'Association (Art. 13)',
      'Accueillir et suivre les étudiants congolais',
      'Organiser les événements sociaux et culturels',
      'Rendre compte de ses activités au Secrétaire Général',
      'Assurer l\'intérim du Secrétaire Général en cas d\'absence ou de démission',
    ],
    contact: { email: 'communication@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois'],
  },
  'exauce': {
    name: 'Exauce',
    role: 'Trésorier Général',
    structure: 'Bureau Exécutif',
    icon: 'fas fa-wallet',
    color: '#d97706',
    photo: null,
    bio: 'Trésorier Général de l\'AECC. Il est le gestionnaire des ressources financières et du patrimoine de l\'Association (Art. 14). Il assure la transparence financière et est cosignataire des sorties de fonds avec le Président.',
    education: [],
    responsibilities: [
      'Tenir les documents comptables de l\'Association (Art. 14)',
      'Faire la collecte des fonds (cotisations statutaires de 10 RMB/mois)',
      'Cosignataire des sorties de fonds avec le Président',
      'Établir les rapports financiers',
      'Gérer le fonds de solidarité pour les cas sociaux (Art. 22 du R.I.)',
    ],
    contact: { email: 'tresorerie@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois'],
  },
  'cluivert': {
    name: 'Cluivert',
    role: 'Responsable Technique',
    structure: 'Bureau Exécutif',
    icon: 'fas fa-cogs',
    color: '#059669',
    photo: null,
    bio: 'Responsable Technique de l\'AECC. Il gère l\'ensemble de l\'infrastructure numérique de l\'association : développement et maintenance du site web, réseaux sociaux et tous les outils technologiques.',
    education: [
      { degree: 'Master en Informatique', university: 'Université de Pékin', year: '2023 – 2026' },
    ],
    responsibilities: [
      'Développer et maintenir le site web de l\'AECC',
      'Gérer les réseaux sociaux de l\'Association',
      'Assurer l\'infrastructure technique (serveurs, domaines, emails)',
      'Former les membres du bureau aux outils numériques',
      'Proposer des solutions technologiques pour améliorer le fonctionnement',
      'Assurer la sécurité des données des membres',
    ],
    contact: { email: 'technique@aecc.org', wechat: '18506959673' },
    languages: ['Français', 'Anglais', 'Chinois (HSK 5)', 'Lingala'],
  },
  'gloire': {
    name: 'Gloire',
    role: 'Commissaire',
    structure: 'Commission de Contrôle, d\'Évaluation et de Discipline',
    icon: 'fas fa-gavel',
    color: '#dc2626',
    photo: null,
    bio: 'Commissaire de la C.C.E.D de l\'AECC. Conformément aux statuts (Art. 19-22), cette commission indépendante veille à la bonne gestion des finances, au bon fonctionnement des instances et à l\'exécution des activités de l\'association.',
    education: [],
    responsibilities: [
      'Suivre la gestion de l\'Association (Art. 19 des Statuts)',
      'Vérifier les comptes financiers de l\'Association',
      'Rendre compte à l\'Assemblée Générale',
      'Interpeller le bureau en cas de dysfonctionnement (Art. 20)',
      'Peut faire convoquer une AG Extraordinaire via pétition (majorité 2/3)',
      'Peut s\'ériger en C.E.I. pour organiser des élections en cas de vacance de poste (Art. 21)',
    ],
    contact: { email: 'discipline@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois'],
  },
  'david': {
    name: 'David',
    role: 'Rapporteur',
    structure: 'Commission de Contrôle, d\'Évaluation et de Discipline',
    icon: 'fas fa-pen-fancy',
    color: '#0891b2',
    photo: null,
    bio: 'Rapporteur de la C.C.E.D de l\'AECC. Il assiste le Commissaire dans ses fonctions, rédige les rapports d\'activité de la commission et présente les conclusions lors des assemblées. En cas de démission du Commissaire, le Rapporteur devient Commissaire (Art. 19 du R.I.).',
    education: [],
    responsibilities: [
      'Rédiger les rapports et comptes rendus de la commission',
      'Assister le Commissaire dans le suivi de la gestion',
      'Présenter les conclusions de la commission en Assemblée Générale',
      'Documenter les décisions et sanctions prises',
      'Archiver les dossiers de la commission',
      'Devenir Commissaire en cas de démission de celui-ci (Art. 19 R.I.)',
    ],
    contact: { email: 'discipline@aecc.org', wechat: null },
    languages: ['Français', 'Anglais', 'Chinois'],
  },
};

export default function MemberCV() {
  const { slug } = useParams();
  const member = ALL_MEMBERS[slug];

  if (!member) {
    return (
      <section className="section" style={{ textAlign: 'center', padding: '4rem 0' }}>
        <div className="container">
          <i className="fas fa-user-slash" style={{ fontSize: '3rem', color: 'var(--text-light)', marginBottom: '1rem' }}></i>
          <h2>Membre non trouvé</h2>
          <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>Ce profil n'est pas disponible.</p>
          <Link to="/" className="btn btn-primary"><i className="fas fa-arrow-left"></i> Retour à l'accueil</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="page-hero" style={{ background: `linear-gradient(135deg, ${member.color} 0%, ${member.color}bb 100%)` }}>
        <div className="container">
          <Link to="/#equipe" className="back-link"><i className="fas fa-arrow-left"></i> Retour</Link>
          <span className="section-badge" style={{ background: 'rgba(255,255,255,.2)', color: '#fff' }}><i className={member.icon}></i> {member.structure}</span>
          <h1>{member.name}</h1>
          <p>{member.role}</p>
        </div>
      </section>

      {/* CV Content */}
      <section className="section">
        <div className="container">
          <div className="cv-layout">
            {/* Sidebar */}
            <aside className="cv-sidebar">
              <div className="cv-avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)` }}>
                <i className={member.icon} style={{ fontSize: '3rem', color: '#fff' }}></i>
              </div>
              <h2>{member.name}</h2>
              <span className="cv-role-badge" style={{ background: `${member.color}15`, color: member.color }}>{member.role}</span>
              <p className="cv-structure-label"><i className="fas fa-building"></i> {member.structure}</p>

              {/* Contact */}
              <div className="cv-section-sm">
                <h4><i className="fas fa-envelope"></i> Contact</h4>
                {member.contact.email && <p><a href={`mailto:${member.contact.email}`}>{member.contact.email}</a></p>}
                {member.contact.wechat && <p><i className="fab fa-weixin"></i> {member.contact.wechat}</p>}
              </div>

              {/* Languages */}
              <div className="cv-section-sm">
                <h4><i className="fas fa-globe"></i> Langues</h4>
                <div className="cv-tags">
                  {member.languages.map((lang, i) => (
                    <span key={i} className="cv-tag">{lang}</span>
                  ))}
                </div>
              </div>
            </aside>

            {/* Main */}
            <div className="cv-main">
              {/* Bio */}
              <div className="cv-card">
                <h3><i className="fas fa-user" style={{ color: member.color }}></i> Biographie</h3>
                <p className="cv-bio">{member.bio}</p>
              </div>

              {/* Education */}
              {member.education.length > 0 && (
                <div className="cv-card">
                  <h3><i className="fas fa-graduation-cap" style={{ color: member.color }}></i> Formation</h3>
                  {member.education.map((edu, i) => (
                    <div key={i} className="cv-edu-item">
                      <h4>{edu.degree}</h4>
                      <p>{edu.university} — <em>{edu.year}</em></p>
                    </div>
                  ))}
                </div>
              )}

              {/* Responsibilities */}
              <div className="cv-card">
                <h3><i className="fas fa-tasks" style={{ color: member.color }}></i> Responsabilités</h3>
                <ul className="cv-responsibilities">
                  {member.responsibilities.map((r, i) => (
                    <li key={i}><i className="fas fa-check" style={{ color: member.color }}></i> {r}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
