import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); doSearch(q); }
  }, [searchParams]);

  async function doSearch(q) {
    setLoading(true);
    try {
      const data = await api.get(`/search?q=${encodeURIComponent(q)}`);
      // Backend returns { results: { blogs: { data, total }, events: { data, total }, ... } }
      setResults({
        blogs: data.results?.blogs?.data || [],
        events: data.results?.events?.data || [],
        resources: data.results?.resources?.data || [],
        profiles: data.results?.profiles?.data || [],
        totalResults: data.totalResults || 0
      });
    } catch {
      setResults({ blogs: [], events: [], resources: [], profiles: [], totalResults: 0 });
    }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    if (query.trim()) doSearch(query.trim());
  }

  return (
    <section className="section">
      <div className="container">
        <div className="page-header"><h1>Recherche</h1></div>
        <form onSubmit={handleSearch} className="search-form">
          <input type="text" placeholder="Rechercher des articles, événements, ressources..." value={query} onChange={e => setQuery(e.target.value)} className="search-input" />
          <button type="submit" className="btn btn-primary" disabled={loading}><i className="fas fa-search"></i> Rechercher</button>
        </form>

        {loading && <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Recherche en cours...</div>}

        {results && (
          <div className="search-results">
            {results.totalResults > 0 && <p className="search-count">{results.totalResults} résultat(s) trouvé(s)</p>}
            {results.blogs.length > 0 && (
              <div className="result-section"><h2><i className="fas fa-blog"></i> Articles ({results.blogs.length})</h2>
                {results.blogs.map(b => <div key={b._id} className="result-item"><Link to={`/blogs/${b._id}`}><h3>{b.title}</h3></Link><p>{b.excerpt || b.content?.substring(0, 150)}...</p></div>)}
              </div>
            )}
            {results.events.length > 0 && (
              <div className="result-section"><h2><i className="fas fa-calendar-alt"></i> Événements ({results.events.length})</h2>
                {results.events.map(e => <div key={e._id} className="result-item"><Link to={`/events/${e._id}`}><h3>{e.title}</h3></Link><p><i className="fas fa-calendar"></i> {new Date(e.startDate).toLocaleDateString('fr-FR')} — {e.location}</p></div>)}
              </div>
            )}
            {results.resources.length > 0 && (
              <div className="result-section"><h2><i className="fas fa-book"></i> Ressources ({results.resources.length})</h2>
                {results.resources.map(r => <div key={r._id} className="result-item"><h3>{r.title}</h3><p>{r.description?.substring(0, 150)}...</p></div>)}
              </div>
            )}
            {results.totalResults === 0 && <p className="empty-state"><i className="fas fa-search"></i> Aucun résultat pour "{query}".</p>}
          </div>
        )}
      </div>
    </section>
  );
}
