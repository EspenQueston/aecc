import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import NewsletterBlock from '../../components/common/NewsletterBlock';

const CATEGORY_META = {
  'finances-economie': { label: 'Finances & Économie', icon: 'fas fa-chart-line', color: '#059669' },
  'computer-science': { label: 'Computer Science', icon: 'fas fa-laptop-code', color: '#2563eb' },
  'droit-law': { label: 'Droit & Law', icon: 'fas fa-gavel', color: '#7c3aed' },
  'business-commerce': { label: 'Business & Commerce', icon: 'fas fa-briefcase', color: '#d97706' },
  'agriculture-elevage': { label: 'Agriculture & Élevage', icon: 'fas fa-seedling', color: '#16a34a' },
  'marketing-communication': { label: 'Marketing & Communication', icon: 'fas fa-bullhorn', color: '#e11d48' },
  'cryptomonnaie': { label: 'Cryptomonnaie', icon: 'fab fa-bitcoin', color: '#f59e0b' },
  'sciences-physique': { label: 'Physique', icon: 'fas fa-atom', color: '#6366f1' },
  'sciences-chimie': { label: 'Chimie', icon: 'fas fa-flask', color: '#0891b2' },
  'sciences-biologie': { label: 'Biologie', icon: 'fas fa-dna', color: '#65a30d' },
  'sciences-mathematiques': { label: 'Mathématiques', icon: 'fas fa-square-root-alt', color: '#4f46e5' },
  'sciences-medecine': { label: 'Médecine', icon: 'fas fa-stethoscope', color: '#dc2626' },
  'sciences-ingenierie': { label: 'Ingénierie', icon: 'fas fa-cogs', color: '#475569' },
  'langues': { label: 'Langues', icon: 'fas fa-language', color: '#0d9488' },
  'art-culture': { label: 'Art & Culture', icon: 'fas fa-palette', color: '#c026d3' },
  'developpement-personnel': { label: 'Dév. Personnel', icon: 'fas fa-brain', color: '#ea580c' },
  'aecc': { label: 'AECC', icon: 'fas fa-users', color: '#B7222D' },
  'autre': { label: 'Autre', icon: 'fas fa-ellipsis-h', color: '#64748b' },
};

const SCIENCE_CATS = ['sciences-physique', 'sciences-chimie', 'sciences-biologie', 'sciences-mathematiques', 'sciences-medecine', 'sciences-ingenierie'];

const LEVEL_LABELS = {
  'tous-niveaux': 'Tous niveaux',
  'debutant': 'Débutant',
  'intermediaire': 'Intermédiaire',
  'avance': 'Avancé',
};

export default function Learning() {
  const [channels, setChannels] = useState([]);
  const [formations, setFormations] = useState([]);
  const [youtubeChannels, setYoutubeChannels] = useState([]);
  const [usefulLinks, setUsefulLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const [activeSection, setActiveSection] = useState('channels');

  useEffect(() => {
    async function loadAll() {
      try {
        const [chData, fData, yData, lData] = await Promise.all([
          api.get('/learning/channels'),
          api.get('/learning/resources/public?type=formation'),
          api.get('/learning/resources/public?type=youtube'),
          api.get('/learning/resources/public?type=useful-link'),
        ]);
        setChannels(chData.data || []);
        setFormations(fData.data || []);
        setYoutubeChannels(yData.data || []);
        setUsefulLinks(lData.data || []);
      } catch {
        setChannels([]); setFormations([]); setYoutubeChannels([]); setUsefulLinks([]);
      }
      setLoading(false);
    }
    loadAll();
  }, []);

  const filteredChannels = useMemo(() => {
    let result = channels;
    if (activeCategory) {
      if (activeCategory === 'sciences') {
        result = result.filter(c => SCIENCE_CATS.includes(c.category));
      } else {
        result = result.filter(c => c.category === activeCategory);
      }
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.description.toLowerCase().includes(q));
    }
    return result;
  }, [channels, activeCategory, search]);

  const groupedChannels = useMemo(() => {
    const groups = {};
    filteredChannels.forEach(ch => {
      const cat = ch.category;
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(ch);
    });
    return groups;
  }, [filteredChannels]);

  const mainCategories = [
    { value: '', label: 'Tous' },
    { value: 'finances-economie', label: 'Finances' },
    { value: 'computer-science', label: 'IT & CS' },
    { value: 'droit-law', label: 'Droit' },
    { value: 'business-commerce', label: 'Business' },
    { value: 'agriculture-elevage', label: 'Agriculture' },
    { value: 'marketing-communication', label: 'Marketing' },
    { value: 'cryptomonnaie', label: 'Crypto' },
    { value: 'sciences', label: 'Sciences' },
    { value: 'langues', label: 'Langues' },
    { value: 'aecc', label: 'AECC' },
  ];

  function getResourceUrl(r) {
    if (r.filePath) return r.filePath;
    return r.url || '#';
  }

  return (
    <>
      {/* Hero */}
      <section className="learn-hero">
        <div className="container">
          <span className="section-badge">Apprentissage</span>
          <h1>Centre d'Apprentissage</h1>
          <p>Canaux Telegram, formations et ressources pour développer vos compétences</p>
          <div className="learn-nav">
            <button className={`learn-nav-btn ${activeSection === 'channels' ? 'active' : ''}`} onClick={() => setActiveSection('channels')}>
              <i className="fab fa-telegram-plane"></i> Canaux Telegram
            </button>
            <button className={`learn-nav-btn ${activeSection === 'courses' ? 'active' : ''}`} onClick={() => setActiveSection('courses')}>
              <i className="fas fa-graduation-cap"></i> Formations
            </button>
            <button className={`learn-nav-btn ${activeSection === 'youtube' ? 'active' : ''}`} onClick={() => setActiveSection('youtube')}>
              <i className="fab fa-youtube"></i> YouTube
            </button>
            <button className={`learn-nav-btn ${activeSection === 'links' ? 'active' : ''}`} onClick={() => setActiveSection('links')}>
              <i className="fas fa-link"></i> Liens Utiles
            </button>
          </div>
        </div>
      </section>

      {activeSection === 'channels' && (
        <section className="section">
          <div className="container">
            <div className="learn-toolbar">
              <div className="learn-search">
                <i className="fas fa-search"></i>
                <input type="text" placeholder="Rechercher un canal..." value={search} onChange={e => setSearch(e.target.value)} />
                {search && <button className="learn-search-clear" onClick={() => setSearch('')}><i className="fas fa-times"></i></button>}
              </div>
              <div className="learn-filters">
                {mainCategories.map(c => (
                  <button key={c.value} className={`learn-filter-chip ${activeCategory === c.value ? 'active' : ''}`} onClick={() => setActiveCategory(c.value)}>
                    {c.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="learn-results-bar">
              <span>{filteredChannels.length} canal{filteredChannels.length !== 1 ? 'ux' : ''}</span>
              {(search || activeCategory) && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setActiveCategory(''); }}>
                  <i className="fas fa-times"></i> Réinitialiser
                </button>
              )}
            </div>
            {loading ? (
              <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
            ) : filteredChannels.length === 0 ? (
              <div className="empty-state-card">
                <i className="fab fa-telegram-plane"></i>
                <h3>Aucun canal trouvé</h3>
                <p>Essayez de modifier votre recherche ou vos filtres</p>
              </div>
            ) : (
              <div className="tg-sections">
                {Object.entries(groupedChannels).map(([cat, items]) => {
                  const meta = CATEGORY_META[cat] || CATEGORY_META.autre;
                  return (
                    <div key={cat} className="tg-category-section">
                      <div className="tg-category-header" style={{ '--cat-color': meta.color }}>
                        <div className="tg-category-icon"><i className={meta.icon}></i></div>
                        <h3>{meta.label}</h3>
                        <span className="tg-category-count">{items.length}</span>
                      </div>
                      <div className="tg-channel-grid">
                        {items.map(ch => (
                          <a key={ch._id} href={ch.url} target="_blank" rel="noopener noreferrer" className="tg-channel-card">
                            <div className="tg-channel-info">
                              <h4>{ch.name}</h4>
                              <p>{ch.description}</p>
                              <div className="tg-channel-meta">
                                {ch.featured && <span className="tg-featured">Recommandé</span>}
                                <span className="tg-lang">{ch.language === 'fr' ? 'FR' : ch.language === 'en' ? 'EN' : ch.language === 'zh' ? 'ZH' : 'Multi'}</span>
                              </div>
                            </div>
                            <div className="tg-channel-join"><i className="fas fa-arrow-right"></i></div>
                          </a>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'courses' && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Domaines d'Apprentissage</h2>
              <p>Des formations organisées par thématique pour faciliter votre parcours</p>
            </div>
            {loading ? (
              <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
            ) : formations.length === 0 ? (
              <div className="empty-state-card">
                <i className="fas fa-graduation-cap"></i>
                <h3>Aucune formation disponible</h3>
                <p>De nouvelles formations seront bientôt ajoutées</p>
              </div>
            ) : (
              <div className="learning-grid">
                {formations.map(c => (
                  <Link key={c._id} to={`/learning/resource/${c._id}`} className="learning-card learning-card-link anim-fade-up">
                    <div className="learning-icon" style={{ background: `${c.color || '#2563eb'}15`, color: c.color || '#2563eb' }}>
                      <i className={c.icon || 'fas fa-book'}></i>
                    </div>
                    <h3>{c.title}</h3>
                    <p>{c.description?.length > 120 ? c.description.substring(0, 120) + '...' : c.description}</p>
                    {c.level && <span className="learning-level"><i className="fas fa-signal"></i> {LEVEL_LABELS[c.level] || c.level}</span>}
                    {c.filePath && <span className="learning-file-badge"><i className="fas fa-file-download"></i> Fichier</span>}
                    <span className="learning-explore"><i className="fas fa-arrow-right"></i> Voir les détails</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'youtube' && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2><i className="fab fa-youtube" style={{ color: '#dc2626' }}></i> Chaînes YouTube Recommandées</h2>
              <p>Apprenez le chinois avec ces chaînes populaires et efficaces</p>
            </div>
            {loading ? (
              <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
            ) : youtubeChannels.length === 0 ? (
              <div className="empty-state-card">
                <i className="fab fa-youtube"></i>
                <h3>Aucune chaîne YouTube disponible</h3>
                <p>De nouvelles chaînes seront bientôt ajoutées</p>
              </div>
            ) : (
              <div className="yt-grid">
                {youtubeChannels.map(ch => (
                  <Link key={ch._id} to={`/learning/resource/${ch._id}`} className="yt-card anim-fade-up">
                    <div className="yt-card-icon"><i className={ch.icon || 'fab fa-youtube'}></i></div>
                    <h3>{ch.title}</h3>
                    <p>{ch.description}</p>
                    <span className="yt-card-link">Voir les détails <i className="fas fa-arrow-right"></i></span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {activeSection === 'links' && (
        <section className="section">
          <div className="container">
            <div className="section-header">
              <h2>Sites & Plateformes Recommandés</h2>
              <p>Des ressources externes vérifiées pour les étudiants en Chine</p>
            </div>
            {loading ? (
              <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
            ) : usefulLinks.length === 0 ? (
              <div className="empty-state-card">
                <i className="fas fa-link"></i>
                <h3>Aucun lien disponible</h3>
                <p>De nouveaux liens seront bientôt ajoutés</p>
              </div>
            ) : (
              <div className="links-grid">
                {usefulLinks.map(link => (
                  <Link key={link._id} to={`/learning/resource/${link._id}`} className={`useful-link-card anim-fade-up ${link.highlight ? 'highlighted' : ''}`}>
                    <div className="ulc-icon"><i className={link.icon || 'fas fa-link'}></i></div>
                    <div>
                      <h3>{link.title} <i className="fas fa-arrow-right"></i></h3>
                      <p>{link.description}</p>
                      {link.filePath && <span className="learning-file-badge" style={{ marginTop: '.3rem', display: 'inline-block' }}><i className="fas fa-file-download"></i> Fichier</span>}
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      <NewsletterBlock />

      <section className="section cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Vous connaissez un bon canal ?</h2>
            <p>Partagez-le avec la communauté pour enrichir notre base de connaissances</p>
            <a href="/contact" className="btn btn-white btn-lg"><i className="fas fa-share-alt"></i> Suggérer un canal</a>
          </div>
        </div>
      </section>
    </>
  );
}
