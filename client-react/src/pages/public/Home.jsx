import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import NewsletterBlock from '../../components/common/NewsletterBlock';
import ExpandableText from '../../components/common/ExpandableText';
import HeroBanner3D from '../../components/home/HeroBanner3D';

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

const SCHOLARSHIPS = [
  { name: 'Bourse CSC', icon: '🇨🇳', desc: 'Chinese Government Scholarship — Programme phare du gouvernement chinois', detail: 'Couvre les frais de scolarité, logement et allocation mensuelle' },
  { name: 'Bourse Provinciale', icon: '🏛️', desc: 'Bourses offertes par les gouvernements provinciaux chinois', detail: 'Varies selon la province, souvent partielles' },
  { name: 'Bourse Universitaire', icon: '🎓', desc: 'Bourses d\'excellence décernées par les universités', detail: 'Basées sur le mérite académique et la recherche' },
  { name: 'Bourse du Congo', icon: '🇨🇬', desc: 'Bourse du gouvernement congolais pour études à l\'étranger', detail: 'Allocation mensuelle + frais de voyage' },
];

const NEWS_ITEMS = [
  { title: 'Forum de Coopération Sino-Africaine (FOCAC)', category: 'Diplomatie', icon: 'fas fa-handshake', desc: 'Les relations sino-congolaises continuent de se renforcer dans les domaines de l\'éducation, du commerce et des infrastructures.' },
  { title: 'Bourses CSC 2025–2026', category: 'Éducation', icon: 'fas fa-graduation-cap', desc: 'Les candidatures pour les bourses du gouvernement chinois sont ouvertes. Date limite : 31 mars 2026.' },
  { title: 'Salon de l\'emploi pour étudiants africains', category: 'Carrière', icon: 'fas fa-briefcase', desc: 'Plusieurs entreprises chinoises et internationales recrutent des talents africains qualifiés.' },
  { title: 'Programme d\'échange culturel Congo-Chine', category: 'Culture', icon: 'fas fa-globe-africa', desc: 'Un nouveau programme d\'échange culturel permet aux étudiants de partager les richesses de nos deux cultures.' },
];

export default function Home() {
  const [blogs, setBlogs] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ students: 0, universities: 0, events: 0 });
  const [expandedScholarship, setExpandedScholarship] = useState(null);
  const [expandedActivity, setExpandedActivity] = useState(null);

  const toggleScholarship = useCallback((e, i) => { e.preventDefault(); setExpandedScholarship(prev => prev === i ? null : i); }, []);
  const toggleActivity = useCallback((e, i) => { e.preventDefault(); setExpandedActivity(prev => prev === i ? null : i); }, []);

  const navigate = useNavigate();
  const newsRef = useRef(null);
  const activitiesRef = useRef(null);

  // Scroll-reveal observer for cards
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const cards = entry.target.querySelectorAll('.news-card, .activity-card');
          cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('card-visible'), i * 100);
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    if (newsRef.current) observer.observe(newsRef.current);
    if (activitiesRef.current) observer.observe(activitiesRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    const [blogsRes, eventsRes, statsRes] = await Promise.allSettled([
      api.get('/blogs?limit=3'),
      api.get('/events?limit=3'),
      api.get('/system/stats')
    ]);
    if (blogsRes.status === 'fulfilled') setBlogs(blogsRes.value.data || []);
    if (eventsRes.status === 'fulfilled') setEvents(eventsRes.value.data || []);
    if (statsRes.status === 'fulfilled') {
      const s = statsRes.value;
      setStats({ students: s.users || 0, universities: s.universities || 0, events: s.events || 0 });
    }
  }

  return (
    <>
      {/* 3D Hero Banner (desktop) */}
      <HeroBanner3D />

      {/* Old Hero (mobile only — production banner) */}
      <section className="hero hero-mobile-fallback">
        <div className="hero-overlay"></div>
        <div className="container hero-content">
          <span className="hero-badge"><i className="fas fa-star"></i> Bienvenue à l'AECC</span>
          <h1>Association des Étudiants<br/>Congolais en Chine</h1>
          <p>Une communauté unie pour connecter, soutenir et accompagner les étudiants congolais de la République du Congo à travers toute la Chine</p>
          <div className="hero-buttons">
            <Link to="/register" className="btn btn-primary btn-lg"><i className="fas fa-user-plus"></i> Rejoignez-nous</Link>
            <Link to="/about" className="btn btn-outline-white btn-lg"><i className="fas fa-play-circle"></i> Découvrir l'AECC</Link>
          </div>
          <div className="hero-trust">
            <div className="trust-item"><i className="fas fa-check-circle"></i> Gratuit</div>
            <div className="trust-item"><i className="fas fa-check-circle"></i> Sécurisé</div>
            <div className="trust-item"><i className="fas fa-check-circle"></i> Communautaire</div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-icon" style={{color: '#B7222D', background: 'rgba(183,34,45,0.08)'}}><i className="fas fa-users"></i></div><div className="stat-info"><h3>{stats.students || 500}+</h3><p>Étudiants Membres</p></div></div>
            <div className="stat-card"><div className="stat-icon" style={{color: '#0E7C42', background: 'rgba(14,124,66,0.08)'}}><i className="fas fa-university"></i></div><div className="stat-info"><h3>{stats.universities || 50}+</h3><p>Universités en Chine</p></div></div>
            <div className="stat-card"><div className="stat-icon" style={{color: '#2563eb', background: 'rgba(37,99,235,0.08)'}}><i className="fas fa-map-marked-alt"></i></div><div className="stat-info"><h3>31</h3><p>Provinces Couvertes</p></div></div>
            <div className="stat-card"><div className="stat-icon" style={{color: '#d97706', background: 'rgba(217,119,6,0.08)'}}><i className="fas fa-calendar-check"></i></div><div className="stat-info"><h3>{stats.events || 20}+</h3><p>Événements Organisés</p></div></div>
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

      {/* Commission de Contrôle, d'Évaluation et de Discipline */}
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

      {/* Scholarships Section */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Bourses d'Études</span>
            <h2>Opportunités de Bourses en Chine</h2>
            <p>Découvrez les différentes bourses disponibles pour les étudiants congolais</p>
          </div>
          <Link to="/bourses" className="scholarships-grid clickable-section">
            {SCHOLARSHIPS.map((s, i) => (
              <div key={i} className={`scholarship-card${expandedScholarship === i ? ' expanded' : ''}`}>
                <div className="scholarship-icon">{s.icon}</div>
                <h3>{s.name}</h3>
                <p className="scholarship-desc">{s.desc}</p>
                <p className="scholarship-detail"><i className="fas fa-info-circle"></i> {s.detail}</p>
                <button className={`card-expand-toggle${expandedScholarship === i ? ' expanded' : ''}`} onClick={(e) => toggleScholarship(e, i)}>
                  {expandedScholarship === i ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i>
                </button>
              </div>
            ))}
          </Link>
          <div className="section-footer">
            <Link to="/bourses" className="btn btn-primary"><i className="fas fa-search"></i> Explorer les bourses en détail</Link>
          </div>
        </div>
      </section>

      {/* News & Relations Section */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Actualités</span>
            <h2>Relations Sino-Congolaises & Éducation</h2>
            <p>Restez informés sur les dernières nouvelles concernant le Congo, la Chine et l'éducation</p>
          </div>
          <div className="news-grid" ref={newsRef}>
            {NEWS_ITEMS.map((item, i) => (
              <div key={i} className="news-card card-animate" onClick={() => navigate('/relations')} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && navigate('/relations')}>
                <div className="news-icon"><i className={item.icon}></i></div>
                <div className="news-content">
                  <span className="news-category">{item.category}</span>
                  <h3>{item.title}</h3>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="section-footer">
            <Link to="/relations" className="btn btn-primary"><i className="fas fa-globe"></i> En savoir plus</Link>
          </div>
        </div>
      </section>

      {/* Latest Blogs */}
      {blogs.length > 0 && (
        <section className="section section-alt">
          <div className="container">
            <div className="section-header">
              <span className="section-badge">Blog</span>
              <h2>Derniers Articles</h2>
              <p>Actualités et témoignages de notre communauté</p>
            </div>
            <div className="cards-grid">
              {blogs.map(blog => (
                <div key={blog._id} className="card">
                  {blog.featuredImage && blog.featuredImage !== 'no-image.jpg' && <img src={blog.featuredImage} alt={blog.title} className="card-img" />}
                  <div className="card-body">
                    <span className="card-category">{blog.category || 'Article'}</span>
                    <h3>{blog.title}</h3>
                    <p>{blog.excerpt || blog.content?.substring(0, 150)}...</p>
                    <div className="card-footer">
                      <span className="card-date"><i className="far fa-calendar-alt"></i> {new Date(blog.createdAt).toLocaleDateString('fr-FR')}</span>
                      <Link to={`/blogs/${blog._id}`} className="btn btn-outline btn-sm">Lire la suite</Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-footer"><Link to="/blogs" className="btn btn-primary">Voir tous les articles <i className="fas fa-arrow-right"></i></Link></div>
          </div>
        </section>
      )}

      {/* Upcoming Events */}
      {events.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <span className="section-badge">Événements</span>
              <h2>Prochaines Activités</h2>
              <p>Participez à nos rencontres, séminaires et activités culturelles</p>
            </div>
            <div className="cards-grid">
              {events.map(event => (
                <div key={event._id} className="card">
                  <div className="card-body">
                    <span className="card-category">{event.type || 'general'}</span>
                    <h3>{event.title}</h3>
                    <div className="card-meta">
                      <span><i className="fas fa-calendar"></i> {new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
                      <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
                    </div>
                    <p>{event.description?.substring(0, 100)}...</p>
                    <Link to={`/events/${event._id}`} className="btn btn-outline btn-sm">Voir les détails</Link>
                  </div>
                </div>
              ))}
            </div>
            <div className="section-footer"><Link to="/events" className="btn btn-primary">Tous les événements <i className="fas fa-arrow-right"></i></Link></div>
          </div>
        </section>
      )}

      {/* Activities Showcase */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Vie Communautaire</span>
            <h2>Activités Sociales & Culturelles</h2>
            <p>Découvrez la richesse de notre vie communautaire en Chine</p>
          </div>
          <div className="activities-grid" ref={activitiesRef}>
            <div className={`activity-card card-animate${expandedActivity === 0 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-music"></i></div><h3>Soirées Culturelles</h3><p>Célébrations des fêtes congolaises, soirées musicales et gastronomiques</p><button className={`card-expand-toggle${expandedActivity === 0 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 0)}>{expandedActivity === 0 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
            <div className={`activity-card card-animate${expandedActivity === 1 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-futbol"></i></div><h3>Tournois Sportifs</h3><p>Compétitions de football, basketball entre différentes villes</p><button className={`card-expand-toggle${expandedActivity === 1 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 1)}>{expandedActivity === 1 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
            <div className={`activity-card card-animate${expandedActivity === 2 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-chalkboard-teacher"></i></div><h3>Séminaires Académiques</h3><p>Conférences, ateliers et partage d'expériences entre étudiants</p><button className={`card-expand-toggle${expandedActivity === 2 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 2)}>{expandedActivity === 2 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
            <div className={`activity-card card-animate${expandedActivity === 3 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-plane-departure"></i></div><h3>Accueil des Nouveaux</h3><p>Orientation et accompagnement des étudiants nouvellement arrivés</p><button className={`card-expand-toggle${expandedActivity === 3 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 3)}>{expandedActivity === 3 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
            <div className={`activity-card card-animate${expandedActivity === 4 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-heart"></i></div><h3>Actions Solidaires</h3><p>Collectes de fonds, soutien aux membres en difficulté</p><button className={`card-expand-toggle${expandedActivity === 4 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 4)}>{expandedActivity === 4 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
            <div className={`activity-card card-animate${expandedActivity === 5 ? ' expanded' : ''}`} onClick={() => navigate('/activites')} role="button" tabIndex={0}><div className="activity-icon"><i className="fas fa-network-wired"></i></div><h3>Networking Pro</h3><p>Rencontres avec des professionnels, mentorat et opportunités</p><button className={`card-expand-toggle${expandedActivity === 5 ? ' expanded' : ''}`} onClick={(e) => toggleActivity(e, 5)}>{expandedActivity === 5 ? 'Moins' : 'Voir plus'} <i className="fas fa-chevron-down"></i></button></div>
          </div>
          <div className="section-footer">
            <Link to="/activites" className="btn btn-primary"><i className="fas fa-arrow-right"></i> Découvrir toutes les activités</Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterBlock />

      {/* CTA Section */}
      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à rejoindre la plus grande communauté congolaise en Chine ?</h2>
            <p>Inscrivez-vous gratuitement et accédez à un réseau de centaines d'étudiants, des ressources exclusives et des événements inspirants</p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-white btn-lg"><i className="fas fa-user-plus"></i> Créer mon compte</Link>
              <Link to="/contact" className="btn btn-outline-white btn-lg"><i className="fas fa-envelope"></i> Nous contacter</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
