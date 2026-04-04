import { Link } from 'react-router-dom';
import NewsletterBlock from '../../components/common/NewsletterBlock';
import ExpandableText from '../../components/common/ExpandableText';

export default function About() {
  const TIMELINE = [
    { year: '2000', title: 'Création de l\'AECC', desc: 'Le 1er août 2000, l\'Association des Étudiants Congolais en Chine (AECC) est officiellement créée à Beijing par un groupe d\'étudiants pionniers.' },
    { year: '2005', title: 'Expansion dans les provinces', desc: 'L\'AECC s\'étend au-delà de Beijing avec la création de sections provinciales dans les principales villes universitaires chinoises.' },
    { year: '2010', title: 'Consolidation et partenariats', desc: 'Renforcement des liens avec l\'Ambassade du Congo en Chine et signature de partenariats avec des organisations étudiantes.' },
    { year: '2017', title: 'Adoption des Statuts', desc: 'Le 12 décembre 2017, l\'Assemblée Générale adopte les statuts actuels de l\'association, définissant sa structure, ses organes et son fonctionnement.' },
    { year: '2023', title: 'Digitalisation', desc: 'Lancement des canaux de communication numériques et modernisation de la gestion de l\'association.' },
    { year: '2025', title: 'Plateforme 2.0', desc: 'Refonte complète de la plateforme avec espace membre, blog, gestion d\'événements et système de newsletter.' },
  ];

  const BUREAU_MEMBERS = [
    { name: 'Rinel', role: 'Président', desc: 'Chargé de la coordination et de l\'orientation de l\'association. Représente l\'AECC auprès des autorités et partenaires.', icon: 'fas fa-crown', color: '#B7222D', city: 'Beijing' },
    { name: 'Cleve', role: 'Secrétaire Général', desc: 'Chargé de l\'administration, de la rédaction des procès-verbaux et de la tenue des archives de l\'association.', icon: 'fas fa-file-alt', color: '#2563eb', city: 'Beijing' },
    { name: 'Mabiala', role: 'Secrétaire Socio-culturel', desc: 'Assure la mobilisation, la communication, l\'accueil et le suivi des étudiants congolais.', icon: 'fas fa-bullhorn', color: '#7c3aed', city: 'Beijing' },
    { name: 'Exauce', role: 'Trésorier Général', desc: 'Gestionnaire des ressources financières et du patrimoine. Cosignataire des sorties de fonds avec le Président.', icon: 'fas fa-wallet', color: '#d97706', city: 'Beijing' },
    { name: 'Cluivert', role: 'Responsable Technique', desc: 'Gère le site web, les réseaux sociaux, les outils numériques et l\'infrastructure technique de l\'AECC.', icon: 'fas fa-cogs', color: '#059669', city: 'Beijing' },
  ];

  const COMMISSION_MEMBERS = [
    { name: 'Gloire', role: 'Commissaire', desc: 'Veille à la bonne gestion des finances, au bon fonctionnement des instances et à l\'exécution des activités de l\'association.', icon: 'fas fa-gavel', color: '#dc2626', city: 'Beijing' },
    { name: 'David', role: 'Rapporteur', desc: 'Rédige les rapports de la commission, assiste le Commissaire et présente les conclusions à l\'Assemblée Générale.', icon: 'fas fa-pen-fancy', color: '#0891b2', city: 'Beijing' },
  ];

  const VALUES = [
    { icon: 'fas fa-handshake', title: 'Solidarité', desc: 'Entraide et soutien mutuel entre tous les membres de la communauté' },
    { icon: 'fas fa-graduation-cap', title: 'Excellence', desc: 'Encourager la réussite académique et le développement personnel' },
    { icon: 'fas fa-globe-africa', title: 'Identité', desc: 'Promouvoir et préserver notre riche patrimoine culturel congolais' },
    { icon: 'fas fa-lightbulb', title: 'Innovation', desc: 'Adopter les nouvelles technologies pour mieux servir nos membres' },
    { icon: 'fas fa-balance-scale', title: 'Intégrité', desc: 'Transparence et honnêteté dans la gestion de l\'association' },
    { icon: 'fas fa-users', title: 'Unité', desc: 'Rassembler les congolais de toutes origines autour de valeurs communes' },
  ];

  return (
    <>
      {/* Hero Banner */}
      <section className="page-hero">
        <div className="container">
          <span className="section-badge">À Propos</span>
          <h1>Qui sommes-nous ?</h1>
          <p>Découvrez l'histoire, la mission et l'équipe derrière l'AECC</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card">
              <div className="mv-icon"><i className="fas fa-bullseye"></i></div>
              <h2>Notre Mission</h2>
              <p>L'AECC a été fondée le 1er août 2000 à Beijing pour créer un réseau solide entre les étudiants congolais poursuivant leurs études en Chine. Notre mission est de faciliter l'intégration, promouvoir l'entraide et renforcer les liens communautaires. Nous nous engageons à accompagner chaque étudiant dans son parcours académique, professionnel et personnel en Chine.</p>
            </div>
            <div className="mv-card">
              <div className="mv-icon"><i className="fas fa-eye"></i></div>
              <h2>Notre Vision</h2>
              <p>Devenir la référence incontournable pour tous les étudiants congolais en Chine, en offrant une plateforme complète d'information, de ressources et de mise en relation. Nous aspirons à former une génération de leaders congolais enrichis par leur expérience en Chine et prêts à contribuer au développement de notre pays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Nos Principes</span>
            <h2>Nos Valeurs Fondamentales</h2>
            <p>Les piliers qui guident toutes nos actions et décisions</p>
          </div>
          <div className="values-grid">
            {VALUES.map((v, i) => (
              <div key={i} className="value-card">
                <div className="value-icon"><i className={v.icon}></i></div>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bureau Exécutif */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Notre Équipe</span>
            <h2>Bureau Exécutif de l'AECC</h2>
            <p>Les membres dévoués qui dirigent et coordonnent les activités de l'association</p>
          </div>
          <div className="office-grid">
            {BUREAU_MEMBERS.map((member, i) => (
              <Link key={i} to={`/equipe/${member.name.toLowerCase()}`} className="office-card office-card-link">
                <div className="office-avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)` }}>
                  <i className={member.icon}></i>
                </div>
                <h3>{member.name}</h3>
                <span className="office-role">{member.role}</span>
                <ExpandableText text={member.desc} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Commission de Contrôle */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Contrôle & Discipline</span>
            <h2>Commission de Contrôle, d'Évaluation et de Discipline</h2>
            <p>Organe indépendant garant de la bonne gestion et du respect des Statuts de l'association</p>
          </div>
          <div className="office-grid office-grid-sm">
            {COMMISSION_MEMBERS.map((member, i) => (
              <Link key={i} to={`/equipe/${member.name.toLowerCase()}`} className="office-card office-card-link">
                <div className="office-avatar" style={{ background: `linear-gradient(135deg, ${member.color}, ${member.color}cc)` }}>
                  <i className={member.icon}></i>
                </div>
                <h3>{member.name}</h3>
                <span className="office-role">{member.role}</span>
                <ExpandableText text={member.desc} />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Notre Parcours</span>
            <h2>Chronologie de l'AECC</h2>
            <p>Les étapes clés de notre développement</p>
          </div>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot"></div>
                <div className="timeline-card">
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Nos Services</span>
            <h2>Ce que l'AECC vous offre</h2>
            <p>Un accompagnement complet pour réussir votre séjour en Chine</p>
          </div>
          <div className="services-grid">
            <div className="service-card">
              <div className="service-number">01</div>
              <h3>Accueil & Orientation</h3>
              <p>Accompagnement des nouveaux arrivants : accueil à l'aéroport, aide à l'installation, guide de survie en Chine.</p>
            </div>
            <div className="service-card">
              <div className="service-number">02</div>
              <h3>Soutien Académique</h3>
              <p>Tutorat, groupes d'étude, ateliers de rédaction scientifique et préparation aux examens HSK.</p>
            </div>
            <div className="service-card">
              <div className="service-number">03</div>
              <h3>Vie Sociale & Culturelle</h3>
              <p>Organisation de fêtes, soirées culturelles, tournois sportifs et sorties de découverte.</p>
            </div>
            <div className="service-card">
              <div className="service-number">04</div>
              <h3>Développement Professionnel</h3>
              <p>Ateliers CV, préparation aux entretiens, networking et mise en relation avec des employeurs.</p>
            </div>
            <div className="service-card">
              <div className="service-number">05</div>
              <h3>Assistance Administrative</h3>
              <p>Aide pour les démarches de visa, résidence, assurance et autres formalités administratives.</p>
            </div>
            <div className="service-card">
              <div className="service-number">06</div>
              <h3>Solidarité & Urgences</h3>
              <p>Fonds de solidarité, assistance en cas d'urgence médicale et soutien psychologique.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterBlock />
    </>
  );
}
