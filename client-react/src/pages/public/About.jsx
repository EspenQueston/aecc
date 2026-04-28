import { Link } from 'react-router-dom';
import NewsletterBlock from '../../components/common/NewsletterBlock';
import ExpandableText from '../../components/common/ExpandableText';
import PageHero from '../../components/common/PageHero';
import GlowCard from '../../components/common/GlowCard';
import TeamTabs from '../../components/home/TeamTabs';
import { BUREAU_MEMBERS, COMMISSION_MEMBERS } from '../../data/team';

export default function About() {
  const TIMELINE = [
    { year: '2000', title: 'Création de l\'AECC', desc: 'Le 1er août 2000, l\'Association des Étudiants Congolais en Chine (AECC) est officiellement créée à Beijing par un groupe d\'étudiants pionniers.' },
    { year: '2005', title: 'Expansion dans les provinces', desc: 'L\'AECC s\'étend au-delà de Beijing avec la création de sections provinciales dans les principales villes universitaires chinoises.' },
    { year: '2010', title: 'Consolidation et partenariats', desc: 'Renforcement des liens avec l\'Ambassade du Congo en Chine et signature de partenariats avec des organisations étudiantes.' },
    { year: '2017', title: 'Adoption des Statuts', desc: 'Le 12 décembre 2017, l\'Assemblée Générale adopte les statuts actuels de l\'association, définissant sa structure, ses organes et son fonctionnement.' },
    { year: '2023', title: 'Digitalisation', desc: 'Lancement des canaux de communication numériques et modernisation de la gestion de l\'association.' },
    { year: '2025', title: 'Plateforme 2.0', desc: 'Refonte complète de la plateforme avec espace membre, blog, gestion d\'événements et système de newsletter.' },
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
      <PageHero
        badge="À Propos"
        title="Qui sommes-nous ?"
        subtitle="Découvrez l’histoire, la mission et l’équipe derrière l’AECC"
        icon="fas fa-info-circle"
      />

      {/* Mission & Vision */}
      <section className="section">
        <div className="container">
          <div className="mission-vision-grid">
            <div className="mv-card reveal-left">
              <div className="mv-icon"><i className="fas fa-bullseye"></i></div>
              <h2>Notre Mission</h2>
              <p>L'AECC a été fondée le 1er août 2000 à Beijing pour créer un réseau solide entre les étudiants congolais poursuivant leurs études en Chine. Notre mission est de faciliter l'intégration, promouvoir l'entraide et renforcer les liens communautaires. Nous nous engageons à accompagner chaque étudiant dans son parcours académique, professionnel et personnel en Chine.</p>
            </div>
            <div className="mv-card reveal-right" style={{'--reveal-delay':'.15s'}}>
              <div className="mv-icon"><i className="fas fa-eye"></i></div>
              <h2>Notre Vision</h2>
              <p>Devenir la référence incontournable pour tous les étudiants congolais en Chine, en offrant une plateforme complète d'information, de ressources et de mise en relation. Nous aspirons à former une génération de leaders congolais enrichis par leur expérience en Chine et prêts à contribuer au développement de notre pays.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values — GlowCard */}
      <section className="gc-section section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Nos Principes</span>
            <h2>Nos Valeurs Fondamentales</h2>
            <p>Les piliers qui guident toutes nos actions et décisions</p>
          </div>
          <div className="gc-grid">
            {VALUES.map((v, i) => (
              <GlowCard key={i} glowColor={['red','green','blue','purple','orange','gold'][i]}>
                <div className="gc-card reveal" style={{'--reveal-delay':`${i * 0.08}s`}}>
                  <div className="gc-icon"><i className={v.icon}></i></div>
                  <h3>{v.title}</h3>
                  <p>{v.desc}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Notre Organisation — Bureau + Commission tabs */}
      <TeamTabs />

      {/* Timeline */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Notre Parcours</span>
            <h2>Chronologie de l'AECC</h2>
            <p>Les étapes clés de notre développement</p>
          </div>
          <div className="timeline">
            {TIMELINE.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-dot"></div>
                <div className={`timeline-card ${i % 2 === 0 ? 'reveal-left' : 'reveal-right'}`} style={{'--reveal-delay':`${i * 0.1}s`}}>
                  <span className="timeline-year">{item.year}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — GlowCard */}
      <section className="gc-section section">
        <div className="container">
          <div className="section-header reveal">
            <span className="section-badge">Nos Services</span>
            <h2>Ce que l’AECC vous offre</h2>
            <p>Un accompagnement complet pour réussir votre séjour en Chine</p>
          </div>
          <div className="gc-grid">
            {[
              { num: '01', title: 'Accueil & Orientation', desc: 'Accompagnement des nouveaux arrivants : accueil à l’aéroport, aide à l’installation, guide de survie en Chine.', glow: 'red' },
              { num: '02', title: 'Soutien Académique', desc: 'Tutorat, groupes d’étude, ateliers de rédaction scientifique et préparation aux examens HSK.', glow: 'blue' },
              { num: '03', title: 'Vie Sociale & Culturelle', desc: 'Organisation de fêtes, soirées culturelles, tournois sportifs et sorties de découverte.', glow: 'green' },
              { num: '04', title: 'Développement Professionnel', desc: 'Ateliers CV, préparation aux entretiens, networking et mise en relation avec des employeurs.', glow: 'purple' },
              { num: '05', title: 'Assistance Administrative', desc: 'Aide pour les démarches de visa, résidence, assurance et autres formalités administratives.', glow: 'orange' },
              { num: '06', title: 'Solidarité & Urgences', desc: 'Fonds de solidarité, assistance en cas d’urgence médicale et soutien psychologique.', glow: 'gold' },
            ].map((s, i) => (
              <GlowCard key={i} glowColor={s.glow}>
                <div className="gc-card reveal" style={{'--reveal-delay':`${i * 0.08}s`}}>
                  <div className="gc-num">{s.num}</div>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterBlock />
    </>
  );
}
