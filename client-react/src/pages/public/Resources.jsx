import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import PageHero from '../../components/common/PageHero';

const CATEGORY_LABELS = {
  Academic: { label: 'Académique', icon: 'fas fa-book', color: '#2563eb' },
  Administrative: { label: 'Administratif', icon: 'fas fa-file-alt', color: '#475569' },
  Cultural: { label: 'Culturel', icon: 'fas fa-globe-africa', color: '#7c3aed' },
  Career: { label: 'Carrière', icon: 'fas fa-briefcase', color: '#059669' },
  Employment: { label: 'Emploi', icon: 'fas fa-user-tie', color: '#d97706' },
  Scholarship: { label: 'Bourse', icon: 'fas fa-graduation-cap', color: '#B7222D' },
  General: { label: 'Général', icon: 'fas fa-folder', color: '#64748b' },
};
const RES_IMGS = [
  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&h=340&fit=crop',
];

export default function Resources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('');
  const [type, setType] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  useEffect(() => { loadResources(); }, [category, type, search]);

  async function loadResources() {
    setLoading(true);
    try {
      let url = '/resources?limit=50';
      if (category) url += `&category=${category}`;
      if (type) url += `&type=${type}`;
      const data = await api.get(url);
      let list = data.data || [];
      if (search) {
        const s = search.toLowerCase();
        list = list.filter(r => r.title.toLowerCase().includes(s) || (r.description || '').toLowerCase().includes(s));
      }
      setResources(list);
    } catch { setResources([]); }
    setLoading(false);
  }

  const [filtersOpen, setFiltersOpen] = useState(false);

  function handleSearch(e) { e.preventDefault(); setSearch(searchInput); }
  function clearFilters() { setCategory(''); setType(''); setSearch(''); setSearchInput(''); }
  const hasFilters = category || type || search;

  return (
    <>
      <PageHero
        badge="Ressources"
        title="Bibliothèque de Ressources"
        subtitle="Guides, outils et documents essentiels pour les étudiants congolais en Chine"
        icon="fas fa-book"
      />

      <section className="section">
        <div className="container">
          <div className="archive-filters">
            <form className="archive-search" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <i className="fas fa-search"></i>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Rechercher une ressource..." />
                {searchInput && <button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); }}><i className="fas fa-times"></i></button>}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
            </form>
            <button className={`filter-toggle-btn ${filtersOpen ? 'open' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
              <i className="fas fa-sliders-h"></i> Filtres {hasFilters && <span className="filter-count">{(category ? 1 : 0) + (type ? 1 : 0)}</span>}
              <i className="fas fa-chevron-down"></i>
            </button>
            <div className={`archive-filter-row ${filtersOpen ? 'open' : ''}`}>
              <div className="filter-group">
                <label>Catégorie</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option value="">Toutes</option>
                  {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Type</label>
                <select value={type} onChange={e => setType(e.target.value)}>
                  <option value="">Tous</option>
                  <option value="Document">Document</option>
                  <option value="Video">Vidéo</option>
                  <option value="Blog">Blog</option>
                  <option value="Tutorial">Tutoriel</option>
                  <option value="Course">Cours</option>
                  <option value="Telegram">Telegram</option>
                  <option value="Scholarship">Bourse</option>
                  <option value="External Link">Lien externe</option>
                </select>
              </div>
              {hasFilters && <button className="btn btn-outline btn-sm filter-clear-btn" onClick={clearFilters}><i className="fas fa-times"></i> Réinitialiser</button>}
            </div>
            {hasFilters && (
              <div className="active-filters">
                {search && <span className="active-filter"><i className="fas fa-search"></i> "{search}" <button onClick={() => { setSearch(''); setSearchInput(''); }}><i className="fas fa-times"></i></button></span>}
                {category && <span className="active-filter"><i className={CATEGORY_LABELS[category]?.icon}></i> {CATEGORY_LABELS[category]?.label} <button onClick={() => setCategory('')}><i className="fas fa-times"></i></button></span>}
                {type && <span className="active-filter"><i className="fas fa-file"></i> {type} <button onClick={() => setType('')}><i className="fas fa-times"></i></button></span>}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Chargement...</div>
          ) : resources.length === 0 ? (
            <div className="empty-state-card">
              <i className="fas fa-book-open"></i>
              <h3>Aucune ressource trouvée</h3>
              <p>{hasFilters ? 'Essayez de modifier vos filtres.' : 'Les ressources arrivent bientôt !'}</p>
              {hasFilters && <button className="btn btn-primary btn-sm" onClick={clearFilters}>Réinitialiser</button>}
            </div>
          ) : (
            <div className="cards-grid three-cols">
              {resources.map((res, i) => {
                const catInfo = CATEGORY_LABELS[res.category] || { label: res.category, icon: 'fas fa-file', color: '#6b7280' };
                const img = RES_IMGS[i % RES_IMGS.length];
                const resUrl = res.externalUrl || res.fileUrl;
                const typeIcon = res.type === 'Video' ? 'fas fa-video' : res.type === 'Document' ? 'fas fa-file-alt' : res.type === 'Blog' ? 'fas fa-blog' : res.type === 'Tutorial' ? 'fas fa-chalkboard-teacher' : res.type === 'Course' ? 'fas fa-graduation-cap' : res.type === 'Telegram' ? 'fab fa-telegram-plane' : res.type === 'Scholarship' ? 'fas fa-award' : 'fas fa-external-link-alt';
                return (
                  <div key={res._id} className="card resource-card">
                    <div className="card-img-wrap">
                      <img src={img} alt={res.title} className="card-img" />
                      <span className="card-category-overlay" style={{ background: catInfo.color }}><i className={catInfo.icon}></i> {catInfo.label}</span>
                    </div>
                    <div className="card-body">
                      <h3>{res.title}</h3>
                      <p>{res.description?.length > 120 ? res.description.substring(0, 120) + '...' : res.description}</p>
                      <div className="card-footer">
                        <span className="card-type-badge"><i className={typeIcon}></i> {res.type || 'Document'}</span>
                        {resUrl && (
                          <a href={resUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                            <i className="fas fa-external-link-alt"></i> Accéder
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
