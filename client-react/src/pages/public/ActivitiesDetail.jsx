import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const ACTIVITIES = [
  {
    title: 'Soirées & Galas',
    icon: '🎉',
    color: '#B7222D',
    image: null,
    description: 'L\'AECC organise régulièrement des soirées festives et galas pour célébrer les fêtes nationales congolaises, les fins d\'année académique et les événements culturels importants.',
    details: [
      'Soirée de la Fête Nationale du Congo (15 août)',
      'Gala de fin d\'année académique',
      'Soirée du Nouvel An et Nouvel An chinois',
      'Célébration de la Journée de l\'Indépendance',
      'Soirées d\'intégration pour les nouveaux étudiants',
    ],
    highlights: ['Musique congolaise et africaine live', 'Cuisine traditionnelle congolaise', 'Performances artistiques et danse', 'Remise de prix aux étudiants méritants'],
  },
  {
    title: 'Tournois Sportifs',
    icon: '⚽',
    color: '#0E7C42',
    description: 'Le sport est un pilier de la vie communautaire de l\'AECC. Nous organisons des compétitions inter-villes et inter-associations pour renforcer les liens entre étudiants.',
    details: [
      'Tournoi annuel de football inter-villes',
      'Compétitions de basketball et volleyball',
      'Matchs amicaux avec d\'autres associations africaines',
      'Journées sportives multi-disciplines',
    ],
    highlights: ['Trophées et médailles pour les vainqueurs', 'Esprit d\'équipe et fair-play', 'Renforcement des liens entre villes', 'Promotion de la santé et du bien-être'],
  },
  {
    title: 'Séminaires & Conférences',
    icon: '📚',
    color: '#2563eb',
    description: 'L\'AECC organise des séminaires éducatifs et des conférences pour le développement personnel et professionnel de ses membres, avec des intervenants de qualité.',
    details: [
      'Conférences sur l\'insertion professionnelle',
      'Ateliers de rédaction de CV et lettres de motivation',
      'Séminaires sur l\'entrepreneuriat en Afrique',
      'Formations sur les compétences interculturelles',
      'Présentations de recherches par les doctorants congolais',
    ],
    highlights: ['Intervenants professionnels et académiques', 'Certificats de participation', 'Networking avec des professionnels', 'Sessions de questions-réponses interactives'],
  },
  {
    title: 'Accueil des Nouveaux',
    icon: '🤝',
    color: '#7c3aed',
    description: 'Chaque début d\'année académique, l\'AECC met en place un programme complet d\'accueil et d\'accompagnement pour les nouveaux étudiants congolais arrivant en Chine.',
    details: [
      'Accueil à l\'aéroport et aide à l\'installation',
      'Guide d\'orientation : carte SIM, compte bancaire, transport',
      'Présentation du système universitaire chinois',
      'Mise en relation avec des « parrains/marraines » (étudiants plus anciens)',
      'Kit de bienvenue avec informations essentielles',
    ],
    highlights: ['Support 24/7 pendant la première semaine', 'Groupe WeChat dédié aux nouveaux', 'Visite guidée du campus et de la ville', 'Soirée de bienvenue officielle'],
  },
  {
    title: 'Actions de Solidarité',
    icon: '❤️',
    color: '#dc2626',
    description: 'La solidarité est au cœur des valeurs de l\'AECC. Nous nous mobilisons pour soutenir nos membres en difficulté et contribuer au développement du Congo.',
    details: [
      'Fonds de solidarité pour les étudiants en difficulté financière',
      'Aide en cas de maladie ou d\'urgence',
      'Collectes pour des causes humanitaires au Congo',
      'Accompagnement psychologique et moral',
      'Campagnes de sensibilisation santé',
    ],
    highlights: ['Cotisations solidaires volontaires', 'Réseau d\'entraide entre étudiants', 'Partenariats avec des ONG', 'Impact mesurable sur la communauté'],
  },
  {
    title: 'Networking & Développement',
    icon: '🌐',
    color: '#059669',
    description: 'L\'AECC facilite le networking entre les étudiants congolais, les professionnels de la diaspora et les entreprises chinoises intéressées par l\'Afrique.',
    details: [
      'Rencontres avec des entrepreneurs congolais en Chine',
      'Participation aux forums économiques sino-africains',
      'Ateliers sur le commerce international et les opportunités',
      'Visites d\'entreprises et de zones industrielles',
      'Événements de networking avec d\'autres associations africaines',
    ],
    highlights: ['Connexions professionnelles durables', 'Opportunités de stages et d\'emploi', 'Mentorat par des professionnels établis', 'Base de données de contacts professionnels'],
  },
];

export default function ActivitiesDetail() {
  const navigate = useNavigate();
  return (
    <>
      <PageHero
        badge="Vie Communautaire"
        title="Activités Sociales & Culturelles"
        subtitle="Découvrez les différentes activités organisées par l’AECC pour enrichir la vie de ses membres"
        icon="fas fa-heart"
        back={() => navigate(-1)}
      />

      {ACTIVITIES.map((a, i) => (
        <section key={i} className={`section ${i % 2 === 1 ? 'section-alt' : ''}`}>
          <div className="container">
            <div className="act-header">
              <div className="act-icon" style={{ background: `${a.color}15` }}>{a.icon}</div>
              <h2>{a.title}</h2>
            </div>
            <p className="act-description">{a.description}</p>

            <div className="act-grid">
              <div className="act-card">
                <h3 style={{ color: a.color }}><i className="fas fa-list"></i> Ce que nous proposons</h3>
                <ul>{a.details.map((d, j) => <li key={j}><i className="fas fa-chevron-right" style={{ color: a.color }}></i> {d}</li>)}</ul>
              </div>
              <div className="act-card">
                <h3 style={{ color: a.color }}><i className="fas fa-star"></i> Points forts</h3>
                <ul>{a.highlights.map((h, j) => <li key={j}><i className="fas fa-check" style={{ color: a.color }}></i> {h}</li>)}</ul>
              </div>
            </div>
          </div>
        </section>
      ))}

      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Rejoignez nos activités</h2>
            <p>Participez à la vie communautaire de l'AECC et créez des souvenirs inoubliables</p>
            <div className="cta-buttons">
              <Link to="/events" className="btn btn-white btn-lg"><i className="fas fa-calendar"></i> Voir les événements</Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg"><i className="fas fa-envelope"></i> Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
