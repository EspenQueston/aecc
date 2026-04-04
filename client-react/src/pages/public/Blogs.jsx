import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

const CATEGORIES = ['Actualités', 'Vie Étudiante', 'Bourses', 'Culture', 'Conseils', 'Témoignages'];
const PLACEHOLDER_IMGS = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=340&fit=crop',
];

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('DESC');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => { loadBlogs(); }, [page, category, search, sort]);

  async function loadBlogs() {
    setLoading(true);
    try {
      let url = `/blogs?page=${page}&limit=9&order=${sort}`;
      if (category) url += `&category=${encodeURIComponent(category)}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const data = await api.get(url);
      setBlogs(data.data || []);
      setPagination(data.pagination || {});
    } catch { setBlogs([]); }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  function clearFilters() {
    setCategory('');
    setSearch('');
    setSearchInput('');
    setSort('DESC');
    setPage(1);
  }

  const hasFilters = category || search || sort !== 'DESC';

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="section-badge">Blog</span>
          <h1>Articles & Actualités</h1>
          <p>Témoignages, guides et actualités de la communauté étudiante congolaise en Chine</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {/* Filters */}
          <div className="archive-filters">
            <form className="archive-search" onSubmit={handleSearch}>
              <div className="search-input-wrap">
                <i className="fas fa-search"></i>
                <input value={searchInput} onChange={e => setSearchInput(e.target.value)} placeholder="Rechercher un article..." />
                {searchInput && <button type="button" className="search-clear" onClick={() => { setSearchInput(''); setSearch(''); setPage(1); }}><i className="fas fa-times"></i></button>}
              </div>
              <button type="submit" className="btn btn-primary btn-sm">Rechercher</button>
            </form>
            <button className={`filter-toggle-btn ${filtersOpen ? 'open' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)}>
              <i className="fas fa-sliders-h"></i> Filtres {hasFilters && <span className="filter-count">{(category ? 1 : 0) + (sort !== 'DESC' ? 1 : 0)}</span>}
              <i className="fas fa-chevron-down"></i>
            </button>
            <div className={`archive-filter-row ${filtersOpen ? 'open' : ''}`}>
              <div className="filter-group">
                <label>Catégorie</label>
                <select value={category} onChange={e => { setCategory(e.target.value); setPage(1); }}>
                  <option value="">Toutes les catégories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="filter-group">
                <label>Tri</label>
                <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}>
                  <option value="DESC">Plus récent</option>
                  <option value="ASC">Plus ancien</option>
                </select>
              </div>
              {hasFilters && (
                <button className="btn btn-outline btn-sm filter-clear-btn" onClick={clearFilters}>
                  <i className="fas fa-times"></i> Réinitialiser
                </button>
              )}
            </div>
            {(category || search) && (
              <div className="active-filters">
                {search && <span className="active-filter"><i className="fas fa-search"></i> "{search}" <button onClick={() => { setSearch(''); setSearchInput(''); }}><i className="fas fa-times"></i></button></span>}
                {category && <span className="active-filter"><i className="fas fa-tag"></i> {category} <button onClick={() => setCategory('')}><i className="fas fa-times"></i></button></span>}
              </div>
            )}
          </div>

          {loading ? (
            <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Chargement des articles...</div>
          ) : blogs.length === 0 ? (
            <div className="empty-state-card">
              <i className="fas fa-pen-fancy"></i>
              <h3>Aucun article trouvé</h3>
              <p>{hasFilters ? 'Essayez de modifier vos filtres.' : 'Les premiers articles arrivent bientôt !'}</p>
              {hasFilters && <button className="btn btn-primary btn-sm" onClick={clearFilters}>Réinitialiser les filtres</button>}
            </div>
          ) : (
            <div className="cards-grid three-cols">
              {blogs.map((blog, i) => {
                const img = blog.featuredImage && blog.featuredImage !== 'no-image.jpg'
                  ? blog.featuredImage
                  : PLACEHOLDER_IMGS[i % PLACEHOLDER_IMGS.length];
                return (
                  <Link to={`/blogs/${blog._id}`} key={blog._id} className="card blog-card card-hover-link">
                    <div className="card-img-wrap">
                      <img src={img} alt={blog.title} className="card-img" />
                      <span className="card-category-overlay">{blog.category || 'Article'}</span>
                    </div>
                    <div className="card-body">
                      <h3>{blog.title}</h3>
                      <p>{blog.excerpt || blog.content?.replace(/[#*_`>\[\]]/g, '').substring(0, 130)}...</p>
                      <div className="card-footer">
                        <div className="card-meta-row">
                          <span className="card-author"><i className="fas fa-user"></i> {blog.author || 'AECC'}</span>
                          <span className="card-date"><i className="far fa-calendar-alt"></i> {new Date(blog.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                        </div>
                        <div className="card-stats-row">
                          <span><i className="fas fa-eye"></i> {blog.views || 0}</span>
                          <span className="read-more">Lire <i className="fas fa-arrow-right"></i></span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" onClick={() => setPage(page - 1)} disabled={page <= 1}>
                <i className="fas fa-chevron-left"></i> Précédent
              </button>
              <div className="pagination-pages">
                {Array.from({ length: Math.min(pagination.pages, 7) }, (_, i) => {
                  const p = i + 1;
                  return <button key={p} className={`pagination-page ${page === p ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>;
                })}
              </div>
              <button className="btn btn-outline btn-sm" onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}>
                Suivant <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
