import { Link, useNavigate } from 'react-router-dom';
import PageHero from '../../components/common/PageHero';

const SCHOLARSHIPS = [
  {
    name: 'Bourse CSC (Chinese Government Scholarship)',
    icon: '🇨🇳',
    color: '#B7222D',
    coverage: 'Complète',
    deadline: 'Janvier – Avril (annuelle)',
    description: 'La bourse du gouvernement chinois (CSC) est le programme de bourses le plus prestigieux et le plus complet pour les étudiants internationaux. Elle couvre tous les frais et offre une allocation mensuelle.',
    benefits: ['Frais de scolarité 100% couverts', 'Hébergement sur le campus gratuit', 'Allocation mensuelle : 3 000 RMB (licence), 3 500 RMB (master), 4 000 RMB (doctorat)', 'Assurance médicale complète', 'Frais d\'inscription exemptés'],
    requirements: ['Diplôme requis selon le niveau (bac, licence, master)', 'Limite d\'âge : 25 ans (licence), 35 ans (master), 40 ans (doctorat)', 'Bonne santé physique et mentale', 'Lettres de recommandation (2 professeurs)', 'Plan d\'études détaillé en anglais ou chinois', 'Certificat HSK (selon le programme)'],
    steps: ['Créer un compte sur campuschina.org', 'Contacter directement les universités pour une lettre d\'admission', 'Remplir le formulaire de candidature CSC en ligne', 'Soumettre les documents via l\'ambassade de Chine ou l\'université', 'Attendre les résultats (mai-juillet)'],
    link: 'https://www.csc.edu.cn'
  },
  {
    name: 'Bourse Provinciale',
    icon: '🏛️',
    color: '#0E7C42',
    coverage: 'Partielle à complète',
    deadline: 'Variable selon la province',
    description: 'Les gouvernements provinciaux chinois offrent des bourses aux étudiants internationaux inscrits dans les universités de leur province. Les conditions et montants varient considérablement.',
    benefits: ['Exemption partielle ou totale des frais de scolarité', 'Allocation mensuelle (1 000 – 2 500 RMB)', 'Certaines incluent le logement gratuit', 'Prime d\'excellence académique annuelle'],
    requirements: ['Être inscrit dans une université de la province', 'Bons résultats académiques', 'Pas de bourse CSC en cours', 'Recommandation de l\'université'],
    steps: ['Se renseigner auprès du bureau des affaires internationales de votre université', 'Préparer un dossier académique complet', 'Soumettre la candidature via l\'université', 'Certaines provinces exigent un entretien'],
    link: null
  },
  {
    name: 'Bourse Universitaire',
    icon: '🎓',
    color: '#2563eb',
    coverage: 'Partielle',
    deadline: 'Tout au long de l\'année',
    description: 'De nombreuses universités chinoises offrent des bourses d\'excellence à leurs étudiants internationaux basées sur les performances académiques, la recherche et les activités extra-universitaires.',
    benefits: ['Réduction de 25% à 100% des frais de scolarité', 'Bourse de mérite semestrielle (500 – 5 000 RMB)', 'Prix d\'excellence en recherche', 'Bourses spéciales pour les doctorants publiant des articles'],
    requirements: ['Être étudiant inscrit à l\'université', 'GPA minimum (généralement 3.0/4.0 ou 80/100)', 'Pas d\'infractions disciplinaires', 'Certaines exigent des publications (doctorat)'],
    steps: ['Consulter le site web de votre université pour les bourses disponibles', 'Préparer les documents requis (relevés de notes, recommandations)', 'Soumettre la candidature avant la date limite', 'Les résultats sont annoncés en début de semestre'],
    link: 'https://www.cucas.cn'
  },
  {
    name: 'Bourse du Gouvernement Congolais',
    icon: '🇨🇬',
    color: '#d97706',
    coverage: 'Allocation mensuelle',
    deadline: 'Annuelle (consulter le ministère)',
    description: 'Le gouvernement de la République du Congo offre des bourses d\'études à l\'étranger pour les étudiants congolais méritants. Cette bourse complète les frais non couverts par d\'autres programmes.',
    benefits: ['Allocation mensuelle pour les frais de subsistance', 'Prise en charge du billet d\'avion aller-retour', 'Couverture d\'assurance', 'Renouvellement annuel sous conditions'],
    requirements: ['Nationalité congolaise', 'Admission confirmée dans une université étrangère', 'Dossier académique excellent', 'Engagement à retourner au Congo après les études'],
    steps: ['Contacter le Ministère de l\'Enseignement Supérieur', 'Préparer le dossier complet de candidature', 'Soumettre via les services de l\'ambassade', 'Entretien de sélection'],
    link: null
  },
];

export default function ScholarshipsDetail() {
  const navigate = useNavigate();
  return (
    <>
      <PageHero
        badge="Bourses d’Études"
        title="Opportunités de Bourses en Chine"
        subtitle="Guide complet des bourses disponibles pour les étudiants congolais"
        icon="fas fa-graduation-cap"
        back={() => navigate(-1)}
      />

      {SCHOLARSHIPS.map((s, i) => (
        <section key={i} className={`section ${i % 2 === 1 ? 'section-alt' : ''}`}>
          <div className="container">
            <div className="scholarship-detail-header">
              <div className="sd-icon" style={{ background: `${s.color}12` }}>{s.icon}</div>
              <div>
                <h2>{s.name}</h2>
                <div className="sd-meta">
                  <span className="sd-badge" style={{ background: `${s.color}15`, color: s.color }}><i className="fas fa-tag"></i> {s.coverage}</span>
                  <span className="sd-badge" style={{ background: 'var(--bg-alt)', color: 'var(--text)' }}><i className="fas fa-calendar"></i> {s.deadline}</span>
                </div>
              </div>
            </div>
            <p className="sd-description">{s.description}</p>

            <div className="sd-grid">
              <div className="sd-card">
                <h3 style={{ color: s.color }}><i className="fas fa-gift"></i> Avantages</h3>
                <ul>{s.benefits.map((b, j) => <li key={j}><i className="fas fa-check-circle" style={{ color: s.color }}></i> {b}</li>)}</ul>
              </div>
              <div className="sd-card">
                <h3 style={{ color: s.color }}><i className="fas fa-clipboard-list"></i> Conditions requises</h3>
                <ul>{s.requirements.map((r, j) => <li key={j}><i className="fas fa-dot-circle" style={{ color: s.color }}></i> {r}</li>)}</ul>
              </div>
              <div className="sd-card sd-card-full">
                <h3 style={{ color: s.color }}><i className="fas fa-route"></i> Étapes de candidature</h3>
                <ol className="sd-steps">
                  {s.steps.map((step, j) => (
                    <li key={j}><span className="sd-step-num" style={{ background: s.color }}>{j + 1}</span> {step}</li>
                  ))}
                </ol>
              </div>
            </div>
            {s.link && (
              <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <a href={s.link} target="_blank" rel="noopener noreferrer" className="btn btn-primary"><i className="fas fa-external-link-alt"></i> Visiter le site officiel</a>
              </div>
            )}
          </div>
        </section>
      ))}

      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Besoin d'aide pour votre candidature ?</h2>
            <p>L'AECC organise régulièrement des ateliers pour aider les étudiants dans leurs démarches de bourse</p>
            <div className="cta-buttons">
              <Link to="/contact" className="btn btn-white btn-lg"><i className="fas fa-envelope"></i> Nous contacter</Link>
              <Link to="/resources" className="btn btn-outline-white btn-lg"><i className="fas fa-book"></i> Voir les ressources</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
