import { useState, useEffect } from 'react';
import { api } from '../../services/api';

export default function AdminNewsletter() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => { loadSubscribers(); }, [filter]);

  async function loadSubscribers() {
    setLoading(true);
    try {
      let url = '/newsletter/subscribers';
      if (filter !== 'all') url += `?active=${filter === 'active'}`;
      const data = await api.get(url);
      setSubscribers(data.data || []);
    } catch { setSubscribers([]); }
    setLoading(false);
  }

  const activeCount = subscribers.filter(s => s.active).length;
  const inactiveCount = subscribers.filter(s => !s.active).length;

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-newspaper"></i> Newsletter</h1>
      </div>

      <div className="stats-grid three-cols" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-icon" style={{ color: '#3b82f6' }}><i className="fas fa-users"></i></div>
          <div className="stat-info"><h3>{subscribers.length}</h3><p>Total abonnés</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ color: '#10b981' }}><i className="fas fa-check-circle"></i></div>
          <div className="stat-info"><h3>{activeCount}</h3><p>Actifs</p></div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
          <div className="stat-icon" style={{ color: '#ef4444' }}><i className="fas fa-times-circle"></i></div>
          <div className="stat-info"><h3>{inactiveCount}</h3><p>Désabonnés</p></div>
        </div>
      </div>

      <div className="filters-bar">
        <select value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="all">Tous</option>
          <option value="active">Actifs</option>
          <option value="inactive">Désabonnés</option>
        </select>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr><th>Email</th><th>Statut</th><th>Date d'inscription</th></tr>
          </thead>
          <tbody>
            {subscribers.map(s => (
              <tr key={s._id}>
                <td>{s.email}</td>
                <td><span className={`status-badge ${s.active ? 'status-publish' : 'status-archived'}`}>{s.active ? 'Actif' : 'Désabonné'}</span></td>
                <td>{new Date(s.subscribedAt).toLocaleDateString('fr-FR')}</td>
              </tr>
            ))}
            {subscribers.length === 0 && <tr><td colSpan="3" className="table-empty">Aucun abonné</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
