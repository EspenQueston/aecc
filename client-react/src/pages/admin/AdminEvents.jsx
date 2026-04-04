import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

const EVENT_TYPES = [
  { value: 'general', label: 'Général' },
  { value: 'seminar', label: 'Séminaire' },
  { value: 'workshop', label: 'Atelier' },
  { value: 'networking', label: 'Réseautage' },
  { value: 'cultural', label: 'Culturel' },
  { value: 'academic', label: 'Académique' }
];

const EMPTY_FORM = { title: '', description: '', location: '', startDate: '', endDate: '', type: 'general', image: '', externalLink: '', attachmentFile: '' };

export default function AdminEvents() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => { loadEvents(); }, [pagination.page, typeFilter, dateFilter]);

  async function loadEvents(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/events?page=${page}&limit=10`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;
      if (dateFilter) url += `&date=${dateFilter}`;
      const data = await api.get(url);
      setEvents(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setEvents([]); }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadEvents(1);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(ev) {
    setEditing(ev._id);
    setForm({
      title: ev.title || '',
      description: ev.description || '',
      location: ev.location || '',
      startDate: ev.startDate ? ev.startDate.slice(0, 16) : '',
      endDate: ev.endDate ? ev.endDate.slice(0, 16) : '',
      type: ev.type || 'general',
      image: ev.image || '',
      externalLink: ev.externalLink || '',
      attachmentFile: ev.attachmentFile || ''
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim() || !form.location.trim() || !form.startDate || !form.endDate) {
      setError('Tous les champs marqués * sont obligatoires');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        type: form.type,
        image: form.image.trim() || undefined,
        externalLink: form.externalLink.trim() || '',
        attachmentFile: form.attachmentFile.trim() || ''
      };
      if (editing) {
        await api.put(`/events/${editing}`, payload);
      } else {
        await api.post('/events', payload);
      }
      setShowModal(false);
      loadEvents(editing ? pagination.page : 1);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer cet événement ?', 'Suppression'))) return;
    try {
      await api.delete(`/events/${id}`);
      setSelectedIds(ids => ids.filter(i => i !== id));
      loadEvents();
      addToast('Événement supprimé', 'success');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    }
  }

  function toggleSelect(id) { setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  function toggleSelectAll() { setSelectedIds(selectedIds.length === events.length ? [] : events.map(e => e._id)); }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} événement(s) ?`, 'Suppression multiple'))) return;
    try { await Promise.all(selectedIds.map(id => api.delete(`/events/${id}`))); setSelectedIds([]); loadEvents(); addToast('Événements supprimés', 'success'); } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function typeLabel(val) {
    return EVENT_TYPES.find(t => t.value === val)?.label || val;
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-calendar-alt"></i> Événements</h1>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <span className="badge">{pagination.total || 0} total</span>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Nouvel événement</button>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par titre ou lieu..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Tous les types</option>
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select value={dateFilter} onChange={e => { setDateFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="this-week">Cette semaine</option>
          <option value="this-month">Ce mois</option>
          <option value="future">À venir</option>
        </select>
        {selectedIds.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i> Supprimer ({selectedIds.length})
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr><th style={{width:36}}><input type="checkbox" checked={events.length > 0 && selectedIds.length === events.length} onChange={toggleSelectAll} /></th><th>Titre</th><th>Type</th><th>Lieu</th><th>Date début</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev._id} className={selectedIds.includes(ev._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(ev._id)} onChange={() => toggleSelect(ev._id)} /></td>
                  <td className="td-title">{ev.title}</td>
                  <td><span className="status-badge">{typeLabel(ev.type)}</span></td>
                  <td>{ev.location}</td>
                  <td>{new Date(ev.startDate).toLocaleDateString('fr-FR')}</td>
                  <td className="td-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ev)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ev._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {events.length === 0 && <tr><td colSpan="6" className="table-empty">Aucun événement trouvé</td></tr>}
            </tbody>
          </table>

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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier l\'événement' : 'Nouvel événement'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea rows="5" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Lieu *</label>
                  <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de début *</label>
                  <input type="datetime-local" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Date de fin *</label>
                  <input type="datetime-local" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>URL de l'image</label>
                <input value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label><i className="fas fa-link"></i> Lien externe</label>
                  <input value={form.externalLink} onChange={e => setForm({ ...form, externalLink: e.target.value })} placeholder="https://lien-inscription.com" />
                </div>
                <div className="form-group">
                  <label><i className="fas fa-file-download"></i> URL fichier à télécharger</label>
                  <input value={form.attachmentFile} onChange={e => setForm({ ...form, attachmentFile: e.target.value })} placeholder="https://example.com/document.pdf" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Sauvegarde...</> : editing ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
