import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

const LEVEL_LABELS = {
  'tous-niveaux': 'Tous niveaux',
  'debutant': 'Débutant',
  'intermediaire': 'Intermédiaire',
  'avance': 'Avancé',
};

const TYPE_LABELS = {
  'formation': 'Formation',
  'youtube': 'Chaîne YouTube',
  'useful-link': 'Lien Utile',
};

export default function LearningDetail() {
  const { slug } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get(`/learning/resources/${slug}`);
        setResource(data.data);
      } catch {
        setError(true);
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) return (
    <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
    </div>
  );

  if (error || !resource) return (
    <div className="section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="empty-state-card anim-fade-up">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Ressource non trouvée</h3>
        <p>Cette ressource n'existe pas ou a été supprimée.</p>
        <Link to="/learning" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          <i className="fas fa-arrow-left"></i> Retour au centre d'apprentissage
        </Link>
      </div>
    </div>
  );

  const color = resource.color || '#2563eb';
  const isFile = !!resource.filePath;
  const resourceUrl = isFile ? resource.filePath : resource.url;

  return (
    <>
      {/* Hero */}
      <section className="lr-detail-hero anim-fade-in" style={{ '--accent': color }}>
        <div className="container">
          <Link to="/learning" className="back-link anim-fade-right">
            <i className="fas fa-arrow-left"></i> Centre d'Apprentissage
          </Link>
          <div className="lr-detail-hero-content">
            <div className="lr-detail-icon anim-scale-in" style={{ background: `${color}22`, color }}>
              <i className={resource.icon || 'fas fa-book'}></i>
            </div>
            <div className="anim-fade-up">
              <span className="lr-detail-type">{TYPE_LABELS[resource.type] || resource.type}</span>
              <h1>{resource.title}</h1>
              <p className="lr-detail-subtitle">{resource.description}</p>
              <div className="lr-detail-meta">
                {resource.level && <span className="lr-meta-badge"><i className="fas fa-signal"></i> {LEVEL_LABELS[resource.level] || resource.level}</span>}
                {resource.featured && <span className="lr-meta-badge lr-meta-featured"><i className="fas fa-star"></i> Recommandé</span>}
                {isFile && <span className="lr-meta-badge"><i className="fas fa-file"></i> Fichier</span>}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section">
        <div className="container">
          <div className="lr-detail-layout">
            {/* Main content */}
            <div className="lr-detail-main">
              {/* Long description */}
              {resource.longDescription && (
                <div className="lr-detail-card anim-fade-up">
                  <div className="lr-detail-card-header" style={{ '--accent': color }}>
                    <i className="fas fa-info-circle"></i>
                    <h2>À propos</h2>
                  </div>
                  <div className="lr-detail-card-body">
                    {resource.longDescription.split('\n').map((p, i) => p.trim() && <p key={i}>{p}</p>)}
                  </div>
                </div>
              )}

              {/* Advantages */}
              {resource.advantages?.length > 0 && (
                <div className="lr-detail-card anim-fade-up" style={{ animationDelay: '.1s' }}>
                  <div className="lr-detail-card-header lr-header-success">
                    <i className="fas fa-check-circle"></i>
                    <h2>Avantages</h2>
                  </div>
                  <div className="lr-detail-card-body">
                    <ul className="lr-pros-list">
                      {resource.advantages.map((a, i) => (
                        <li key={i} className="anim-fade-right" style={{ animationDelay: `${i * 0.07}s` }}>
                          <span className="lr-list-icon lr-icon-pro"><i className="fas fa-check"></i></span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Disadvantages */}
              {resource.disadvantages?.length > 0 && (
                <div className="lr-detail-card anim-fade-up" style={{ animationDelay: '.2s' }}>
                  <div className="lr-detail-card-header lr-header-warning">
                    <i className="fas fa-exclamation-triangle"></i>
                    <h2>Points d'attention</h2>
                  </div>
                  <div className="lr-detail-card-body">
                    <ul className="lr-cons-list">
                      {resource.disadvantages.map((d, i) => (
                        <li key={i} className="anim-fade-right" style={{ animationDelay: `${i * 0.07}s` }}>
                          <span className="lr-list-icon lr-icon-con"><i className="fas fa-exclamation"></i></span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Details */}
              {resource.details?.length > 0 && (
                <div className="lr-detail-card anim-fade-up" style={{ animationDelay: '.3s' }}>
                  <div className="lr-detail-card-header" style={{ '--accent': color }}>
                    <i className="fas fa-lightbulb"></i>
                    <h2>Détails importants</h2>
                  </div>
                  <div className="lr-detail-card-body">
                    <ul className="lr-details-list">
                      {resource.details.map((d, i) => (
                        <li key={i} className="anim-fade-right" style={{ animationDelay: `${i * 0.07}s` }}>
                          <span className="lr-list-icon" style={{ background: `${color}18`, color }}><i className="fas fa-arrow-right"></i></span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar with CTA */}
            <div className="lr-detail-sidebar anim-fade-left" style={{ animationDelay: '.2s' }}>
              <div className="lr-cta-box" style={{ '--accent': color }}>
                <div className="lr-cta-icon-wrap">
                  <div className="lr-cta-icon anim-pulse-glow" style={{ background: color, color: '#fff' }}>
                    <i className={isFile ? 'fas fa-download' : 'fas fa-external-link-alt'}></i>
                  </div>
                </div>
                <h3>{isFile ? 'Télécharger la ressource' : 'Accéder à la ressource'}</h3>
                <p>{isFile
                  ? `Téléchargez "${resource.fileName || 'le fichier'}" directement sur votre appareil`
                  : 'Cliquez pour accéder à cette ressource en ligne'
                }</p>
                <a
                  href={resourceUrl}
                  target={isFile ? '_self' : '_blank'}
                  rel={isFile ? undefined : 'noopener noreferrer'}
                  download={isFile ? resource.fileName : undefined}
                  className="lr-cta-btn anim-shimmer"
                  style={{ '--btn-color': color }}
                >
                  <span className="lr-cta-btn-bg"></span>
                  <span className="lr-cta-btn-text">
                    <i className={isFile ? 'fas fa-cloud-download-alt' : 'fas fa-rocket'}></i>
                    {isFile ? 'Télécharger maintenant' : 'Visiter le site'}
                  </span>
                </a>
                {resource.url && isFile && (
                  <a href={resource.url} target="_blank" rel="noopener noreferrer" className="lr-cta-alt">
                    <i className="fas fa-external-link-alt"></i> Voir aussi le site web
                  </a>
                )}
              </div>

              {/* Quick info */}
              <div className="lr-sidebar-info anim-fade-up" style={{ animationDelay: '.4s' }}>
                <h4>Informations</h4>
                <div className="lr-info-row">
                  <span><i className="fas fa-tag"></i> Type</span>
                  <span>{TYPE_LABELS[resource.type]}</span>
                </div>
                {resource.level && (
                  <div className="lr-info-row">
                    <span><i className="fas fa-signal"></i> Niveau</span>
                    <span>{LEVEL_LABELS[resource.level]}</span>
                  </div>
                )}
                <div className="lr-info-row">
                  <span><i className="fas fa-calendar"></i> Ajouté</span>
                  <span>{new Date(resource.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section cta-section anim-fade-up">
        <div className="container">
          <div className="cta-content">
            <h2>Découvrez plus de ressources</h2>
            <p>Explorez notre centre d'apprentissage pour trouver d'autres formations et outils</p>
            <Link to="/learning" className="btn btn-white btn-lg anim-bounce-subtle">
              <i className="fas fa-graduation-cap"></i> Centre d'Apprentissage
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
