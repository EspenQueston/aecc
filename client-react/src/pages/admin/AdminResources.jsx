import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

const RES_CATEGORIES = ['Academic', 'Administrative', 'Cultural', 'Career', 'Employment', 'Scholarship', 'General'];
const RES_TYPES = ['Document', 'Video', 'Blog', 'Tutorial', 'Course', 'Telegram', 'Scholarship', 'External Link'];
const EMPTY_FORM = { title: '', description: '', category: 'General', type: 'Document', fileUrl: '', externalLink: '' };

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState('');
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [categoryFilter, setCategoryFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => { loadResources(); }, [pagination.page, categoryFilter, typeFilter]);

  async function loadResources(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/resources?page=${page}&limit=10`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (categoryFilter) url += `&category=${encodeURIComponent(categoryFilter)}`;
      if (typeFilter) url += `&type=${encodeURIComponent(typeFilter)}`;
      const data = await api.get(url);
      setResources(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setResources([]); }
    setLoading(false);
  }

  function handleSearch(e) {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadResources(1);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(res) {
    setEditing(res._id);
    setForm({
      title: res.title || '',
      description: res.description || '',
      category: res.category || 'General',
      type: res.type || 'Document',
      fileUrl: res.fileUrl || '',
      externalLink: res.externalUrl || res.externalLink || ''
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { setError('Le titre et la description sont obligatoires'); return; }
    if (!form.fileUrl.trim() && !form.externalLink.trim()) { setError('Fournissez un fichier URL ou un lien externe'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        type: form.type,
        fileUrl: form.fileUrl.trim() || undefined,
        externalLink: form.externalLink.trim() || undefined
      };
      if (editing) {
        await api.put(`/resources/${editing}`, payload);
      } else {
        await api.post('/resources', payload);
      }
      setShowModal(false);
      loadResources(editing ? pagination.page : 1);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer cette ressource ?', 'Suppression'))) return;
    try {
      await api.delete(`/resources/${id}`);
      setSelectedIds(ids => ids.filter(i => i !== id));
      loadResources();
      addToast('Ressource supprimée', 'success');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    }
  }

  function toggleSelect(id) { setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  function toggleSelectAll() { setSelectedIds(selectedIds.length === resources.length ? [] : resources.map(r => r._id)); }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} ressource(s) ?`, 'Suppression multiple'))) return;
    try { await Promise.all(selectedIds.map(id => api.delete(`/resources/${id}`))); setSelectedIds([]); loadResources(); addToast('Ressources supprimées', 'success'); } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-book"></i> Ressources</h1>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <span className="badge">{pagination.total || 0} total</span>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Nouvelle ressource</button>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par titre..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Toutes les catégories</option>
          {RES_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Tous les types</option>
          {RES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
              <tr><th style={{width:36}}><input type="checkbox" checked={resources.length > 0 && selectedIds.length === resources.length} onChange={toggleSelectAll} /></th><th>Titre</th><th>Catégorie</th><th>Type</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r._id} className={selectedIds.includes(r._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(r._id)} onChange={() => toggleSelect(r._id)} /></td>
                  <td className="td-title">{r.title}</td>
                  <td><span className="status-badge">{r.category}</span></td>
                  <td>{r.type}</td>
                  <td>{new Date(r.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="td-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && <tr><td colSpan="6" className="table-empty">Aucune ressource trouvée</td></tr>}
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
              <h2>{editing ? 'Modifier la ressource' : 'Nouvelle ressource'}</h2>
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
                <textarea rows="4" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie *</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {RES_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Type *</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                    {RES_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>URL du fichier</label>
                  <input value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })} placeholder="https://..." />
                </div>
                <div className="form-group">
                  <label>Lien externe</label>
                  <input value={form.externalLink} onChange={e => setForm({ ...form, externalLink: e.target.value })} placeholder="https://..." />
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
