import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminProfiles() {
  const [profiles, setProfiles] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfiles(); }, [pagination.page]);

  async function loadProfiles(page = pagination.page) {
    setLoading(true);
    try {
      const data = await api.get(`/profile?page=${page}&limit=10`);
      const list = Array.isArray(data) ? data : data.data || [];
      setProfiles(list);
      if (data.pagination) setPagination(p => ({ ...p, ...data.pagination, page }));
    } catch { setProfiles([]); }
    setLoading(false);
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-id-card"></i> Profils</h1>
        <span className="badge">{pagination.total || profiles.length} total</span>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <>
          <div className="cards-grid three-cols">
            {profiles.map(p => {
              const u = p.user || {};
              return (
                <div key={p._id} className="profile-card">
                  <div className="profile-card-avatar">{(u.firstName?.[0] || '?')}{(u.lastName?.[0] || '')}</div>
                  <h3>{u.firstName} {u.lastName}</h3>
                  <p className="profile-card-email">{u.email}</p>
                  {u.university && <p className="profile-card-info"><i className="fas fa-university"></i> {u.university}</p>}
                  {u.fieldOfStudy && <p className="profile-card-info"><i className="fas fa-graduation-cap"></i> {u.fieldOfStudy}</p>}
                  {p.bio && <p className="profile-card-bio">{p.bio.slice(0, 100)}{p.bio.length > 100 ? '...' : ''}</p>}
                  {p.skills?.length > 0 && (
                    <div className="skills-tags">
                      {p.skills.slice(0, 5).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {profiles.length === 0 && <div className="table-empty" style={{ textAlign: 'center', padding: '3rem' }}>Aucun profil trouvé</div>}

          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <span>Page {pagination.page} / {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
