import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import PageHero from '../../components/common/PageHero';

const TYPE_LABELS = {
  seminar: { label: 'Séminaire', icon: 'fas fa-chalkboard-teacher', color: '#2563eb' },
  workshop: { label: 'Atelier', icon: 'fas fa-tools', color: '#d97706' },
  networking: { label: 'Networking', icon: 'fas fa-network-wired', color: '#7c3aed' },
  cultural: { label: 'Culturel', icon: 'fas fa-palette', color: '#B7222D' },
  academic: { label: 'Académique', icon: 'fas fa-graduation-cap', color: '#0E7C42' },
  general: { label: 'Général', icon: 'fas fa-calendar', color: '#6b7280' },
};
const EVENT_IMGS = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1559223607-a43c990c692c?w=600&h=340&fit=crop',
];

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [timeFilter, setTimeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => { loadEvents(); }, [filter, timeFilter, search]);

  async function loadEvents() {
    setLoading(true);
    try {
      let url = '/events?limit=50';
      if (filter) url += `&type=${filter}`;
      const data = await api.get(url);
      let list = data.data || [];
      const now = new Date();
      if (timeFilter === 'upcoming') list = list.filter(e => new Date(e.startDate) > now);
      else if (timeFilter === 'past') list = list.filter(e => new Date(e.startDate) <= now);
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(e => e.title.toLowerCase().includes(s) || (e.description || '').toLowerCase().includes(s) || (e.location || '').toLowerCase().includes(s));
      }
      setEvents(list);
    } catch { setEvents([]); }
    setLoading(false);
  }

  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleSearch(e) { e.preventDefault(); setSearch(searchInput); }
  function clearFilters() { setFilter(''); setTimeFilter(''); setSearch(''); setSearchInput(''); }
  const hasFilters = filter || timeFilter || search;

  return (
    <>
      <PageHero
        badge="Événements"
        title="Nos Événements & Activités"
        subtitle="Participez aux rencontres, séminaires et activités culturelles de la communauté"
        icon="fas fa-calendar-alt"
      />

      <section className="section">
        <div className="container">
          <div className="archive-filters">
            <form className="archive-search" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <i className="fas fa-search"></i>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Rechercher un événement..." />
                {searchInput && <button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); }}><i className="fas fa-times"></i></button>}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
            </form>
            <button className={`filter-toggle-btn ${filtersOpen ? 'open' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
              <i className="fas fa-sliders-h"></i> Filtres {hasFilters && <span className="filter-count">{(filter ? 1 : 0) + (timeFilter ? 1 : 0)}</span>}
              <i className="fas fa-chevron-down"></i>
            </button>
            <div className={`archive-filter-row ${filtersOpen ? 'open' : ''}`}>
              <div className="filter-group">
                <label>Type</label>
                <select value={filter} onChange={e => setFilter(e.target.value)}>
                  <option value="">Tous les types</option>
                  {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Période</label>
                <select value={timeFilter} onChange={e => setTimeFilter(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="upcoming">À venir</option>
                  <option value="past">Passés</option>
                </select>
              </div>
              {hasFilters && <button className="btn btn-outline btn-sm filter-clear-btn" onClick={clearFilters}><i className="fas fa-times"></i> Réinitialiser</button>}
            </div>
            {hasFilters && (
              <div className="active-filters">
                {search && <span className="active-filter"><i className="fas fa-search"></i> "{search}" <button onClick={() => { setSearch(''); setSearchInput(''); }}><i className="fas fa-times"></i></button></span>}
                {filter && <span className="active-filter"><i className={TYPE_LABELS[filter]?.icon}></i> {TYPE_LABELS[filter]?.label} <button onClick={() => setFilter('')}><i className="fas fa-times"></i></button></span>}
                {timeFilter && <span className="active-filter"><i className="fas fa-clock"></i> {timeFilter === 'upcoming' ? 'À venir' : 'Passés'} <button onClick={() => setTimeFilter('')}><i className="fas fa-times"></i></button></span>}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Chargement...</div>
          ) : events.length === 0 ? (
            <div className="empty-state-card">
              <i className="fas fa-calendar-times"></i>
              <h3>Aucun événement trouvé</h3>
              <p>{hasFilters ? 'Essayez de modifier vos filtres.' : 'Aucun événement pour le moment.'}</p>
              {hasFilters && <button className="btn btn-primary btn-sm" onClick={clearFilters}>Réinitialiser</button>}
            </div>
          ) : (
            <div className="cards-grid three-cols">
              {events.map((event, i) => {
                const typeInfo = TYPE_LABELS[event.type] || TYPE_LABELS.general;
                const isUpcoming = new Date(event.startDate) > new Date();
                const img = event.image && event.image !== 'no-image.jpg' ? event.image : EVENT_IMGS[i % EVENT_IMGS.length];
                return (
                  <Link to={`/events/${event._id}`} key={event._id} className="card event-card card-hover-link">
                    <div className="card-img-wrap">
                      <img src={img} alt={event.title} className="card-img" />
                      <span className="card-category-overlay" style={{ background: typeInfo.color }}><i className={typeInfo.icon}></i> {typeInfo.label}</span>
                      {isUpcoming && <span className="card-badge-overlay upcoming"><i className="fas fa-clock"></i> À venir</span>}
                    </div>
                    <div className="card-body">
                      <h3>{event.title}</h3>
                      <div className="card-meta">
                        <span><i className="fas fa-calendar"></i> {new Date(event.startDate).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        <span><i className="fas fa-map-marker-alt"></i> {event.location}</span>
                      </div>
                      <p>{event.description?.substring(0, 120)}...</p>
                      {(event.externalLink || event.attachmentFile) && (
                        <div className="card-footer" style={{ gap: '.4rem' }}>
                          {event.externalLink && <span className="card-type-badge"><i className="fas fa-link"></i> Lien</span>}
                          {event.attachmentFile && <span className="card-type-badge"><i className="fas fa-file-download"></i> Fichier</span>}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
