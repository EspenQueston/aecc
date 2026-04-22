import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const RELATIONS_SECTIONS = [
  {
    title: 'Le Forum FOCAC',
    icon: '🌍',
    color: '#B7222D',
    content: 'Le Forum sur la Coopération Sino-Africaine (FOCAC), créé en 2000, est le cadre principal de dialogue et de coopération entre la Chine et les pays africains. La République du Congo est un membre actif depuis sa création.',
    keyPoints: [
      'Sommet triennal alternant entre Pékin et une capitale africaine',
      'Plans d\'action couvrant l\'économie, l\'éducation, la santé et la culture',
      'Engagement de la Chine pour 60 milliards USD d\'investissements en Afrique (2018)',
      'Formation de 50 000 professionnels africains et 50 000 bourses (2019-2021)',
      'Le FOCAC 2024 à Pékin a renforcé les engagements éducatifs',
    ],
  },
  {
    title: 'Coopération Éducative',
    icon: '🎓',
    color: '#0E7C42',
    content: 'La coopération éducative entre le Congo et la Chine a connu une croissance remarquable. Le nombre d\'étudiants congolais en Chine est passé de quelques dizaines dans les années 2000 à plusieurs centaines aujourd\'hui.',
    keyPoints: [
      'Plus de 500 étudiants congolais actuellement en Chine',
      'Bourses CSC dédiées au Congo avec quota annuel croissant',
      'Programmes d\'échange entre universités congolaises et chinoises',
      'Institut Confucius à Brazzaville (Université Marien Ngouabi)',
      'Enseignement du chinois (mandarin) de plus en plus populaire au Congo',
      'Reconnaissance mutuelle des diplômes en cours de négociation',
    ],
  },
  {
    title: 'Échanges Culturels',
    icon: '🎭',
    color: '#7c3aed',
    content: 'Les échanges culturels entre le Congo et la Chine sont un vecteur essentiel de compréhension mutuelle. L\'AECC joue un rôle de pont culturel en organisant des événements qui célèbrent les deux cultures.',
    keyPoints: [
      'Festivals culturels sino-congolais organisés par l\'AECC',
      'Participation aux célébrations du Nouvel An chinois',
      'Promotion de la culture congolaise auprès des universités chinoises',
      'Cours de langues croisés (français-chinois)',
      'Expositions d\'art et de photographie',
      'Échanges gastronomiques et culinaires',
    ],
  },
  {
    title: 'Relations Diplomatiques',
    icon: '🤝',
    color: '#2563eb',
    content: 'La République du Congo a été l\'un des premiers pays africains à établir des relations diplomatiques avec la République populaire de Chine en 1964. Cette relation historique constitue le socle d\'une coopération multiforme.',
    keyPoints: [
      'Relations diplomatiques établies le 22 février 1964',
      'Visites d\'État régulières entre les deux pays',
      'Coopération dans les infrastructures : routes, hôpitaux, stades',
      'Aide médicale chinoise au Congo (missions médicales régulières)',
      'Projets communs dans les télécommunications et le numérique',
      'Zone Économique Spéciale de Pointe-Noire',
    ],
  },
  {
    title: 'Perspectives & Opportunités',
    icon: '🚀',
    color: '#d97706',
    content: 'L\'avenir des relations sino-congolaises offre de nombreuses opportunités pour les étudiants congolais formés en Chine. L\'AECC travaille à maximiser ces opportunités pour ses membres.',
    keyPoints: [
      'Demande croissante de professionnels bilingues français-chinois',
      'Opportunités dans le commerce international sino-africain',
      'Rôle de pont culturel pour les entreprises chinoises au Congo',
      'Programmes de stages dans les entreprises chinoises',
      'Création de réseaux d\'alumni sino-congolais',
      'Projets entrepreneuriaux exploitant les compétences interculturelles',
    ],
  },
];

export default function RelationsDetail() {
  const navigate = useNavigate();
  return (
    <>
      <PageHero
        badge="Coopération"
        title="Relations Sino-Congolaises & Éducation"
        subtitle="L’histoire et l’avenir de la coopération entre le Congo et la Chine dans le domaine éducatif et culturel"
        icon="fas fa-handshake"
        back={() => navigate(-1)}
      />

      <section className="section">
        <div className="container">
          <div className="rel-timeline">
            <div className="rel-timeline-line"></div>
            <div className="rel-timeline-item">
              <div className="rel-timeline-dot" style={{ background: '#B7222D' }}></div>
              <div className="rel-timeline-content">
                <span className="rel-year">1964</span>
                <p>Établissement des relations diplomatiques</p>
              </div>
            </div>
            <div className="rel-timeline-item">
              <div className="rel-timeline-dot" style={{ background: '#0E7C42' }}></div>
              <div className="rel-timeline-content">
                <span className="rel-year">2000</span>
                <p>Création du Forum FOCAC</p>
              </div>
            </div>
            <div className="rel-timeline-item">
              <div className="rel-timeline-dot" style={{ background: '#2563eb' }}></div>
              <div className="rel-timeline-content">
                <span className="rel-year">2006</span>
                <p>Premier plan d'action FOCAC avec le Congo</p>
              </div>
            </div>
            <div className="rel-timeline-item">
              <div className="rel-timeline-dot" style={{ background: '#7c3aed' }}></div>
              <div className="rel-timeline-content">
                <span className="rel-year">2018</span>
                <p>Sommet FOCAC à Pékin – 60 milliards USD</p>
              </div>
            </div>
            <div className="rel-timeline-item">
              <div className="rel-timeline-dot" style={{ background: '#d97706' }}></div>
              <div className="rel-timeline-content">
                <span className="rel-year">2024</span>
                <p>FOCAC 2024 – Nouveaux engagements éducatifs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {RELATIONS_SECTIONS.map((s, i) => (
        <section key={i} className={`section ${i % 2 === 0 ? 'section-alt' : ''}`}>
          <div className="container">
            <div className="rel-header">
              <div className="rel-icon" style={{ background: `${s.color}15` }}>{s.icon}</div>
              <h2>{s.title}</h2>
            </div>
            <p className="rel-description">{s.content}</p>
            <div className="rel-points">
              {s.keyPoints.map((point, j) => (
                <div key={j} className="rel-point">
                  <div className="rel-point-num" style={{ background: s.color }}>{j + 1}</div>
                  <p>{point}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Contribuez aux relations sino-congolaises</h2>
            <p>En tant qu'étudiants congolais en Chine, nous sommes les ambassadeurs de cette coopération</p>
            <div className="cta-buttons">
              <Link to="/about" className="btn btn-white btn-lg"><i className="fas fa-info-circle"></i> En savoir plus sur l'AECC</Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg"><i className="fas fa-envelope"></i> Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
