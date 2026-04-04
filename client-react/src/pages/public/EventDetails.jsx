import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function EventDetails() {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadEvent(); }, [id]);

  async function loadEvent() {
    try {
      const data = await api.get(`/events/${id}`);
      setEvent(data.data || data);
    } catch { setEvent(null); }
    setLoading(false);
  }

  if (loading) return <div className="loading-spinner container"><i className="fas fa-spinner fa-spin"></i> Chargement...</div>;
  if (!event) return <div className="container section"><p className="empty-state">Événement non trouvé.</p><Link to="/events" className="btn btn-primary">Retour aux événements</Link></div>;

  return (
    <section className="section">
      <div className="container">
        <Link to="/events" className="back-link"><i className="fas fa-arrow-left"></i> Retour aux événements</Link>
        {event.image && event.image !== 'no-image.jpg' && <img src={event.image} alt={event.title} className="detail-hero-img" />}
        <div className="detail-content">
          <span className="card-category">{event.type || 'general'}</span>
          <h1>{event.title}</h1>
          <div className="detail-meta">
            <span><i className="fas fa-calendar"></i> {new Date(event.startDate).toLocaleDateString('fr-FR')}</span>
            {event.endDate && <span><i className="fas fa-clock"></i> Jusqu'au {new Date(event.endDate).toLocaleDateString('fr-FR')}</span>}
            <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
            {event.organizer && <span><i className="fas fa-user"></i> {event.organizer.firstName} {event.organizer.lastName}</span>}
          </div>
          <div className="detail-body"><p>{event.description}</p></div>
          {(event.externalLink || event.attachmentFile) && (
            <div className="detail-actions" style={{ display: 'flex', gap: '.8rem', flexWrap: 'wrap', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-light)' }}>
              {event.externalLink && (
                <a href={event.externalLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                  <i className="fas fa-external-link-alt"></i> Accéder au lien
                </a>
              )}
              {event.attachmentFile && (
                <a href={event.attachmentFile} target="_blank" rel="noopener noreferrer" className="btn btn-outline" download>
                  <i className="fas fa-file-download"></i> Télécharger le fichier
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
