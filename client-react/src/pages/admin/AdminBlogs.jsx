import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';
import MDEditor from '@uiw/react-md-editor';

const EMPTY_FORM = { title: '', content: '', excerpt: '', status: 'publish', categories: '', tags: '', featuredImage: '' };
const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1523050854058-8df90110c476?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&h=340&fit=crop',
  'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=600&h=340&fit=crop',
];

export default function AdminBlogs() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [blogs, setBlogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { loadBlogs(); }, [pagination.page, statusFilter]);

  async function loadBlogs(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/blogs?page=${page}&limit=10&order=DESC`;
      if (statusFilter) url += `&post_status=${statusFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const data = await api.get(url);
      setBlogs(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setBlogs([]); }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_FORM, featuredImage: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)] });
    setError('');
    setShowModal(true);
  }

  function openEdit(blog) {
    setEditing(blog._id);
    setForm({
      title: blog.title || '',
      content: blog.content || '',
      excerpt: blog.excerpt || '',
      status: blog.status || 'publish',
      categories: Array.isArray(blog.categories) ? blog.categories.map(c => c.term_id?.name || c).join(', ') : (blog.category || ''),
      tags: Array.isArray(blog.tags) ? blog.tags.map(t => t.term_id?.name || t).join(', ') : '',
      featuredImage: blog.featuredImage || ''
    });
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Le titre et le contenu sont obligatoires'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        excerpt: form.excerpt.trim() || form.content.substring(0, 160),
        status: form.status,
        featured_image: form.featuredImage,
        categories: form.categories ? form.categories.split(',').map(s => s.trim()).filter(Boolean) : [],
        tags: form.tags ? form.tags.split(',').map(s => s.trim()).filter(Boolean) : []
      };
      if (editing) {
        await api.put(`/blogs/${editing}`, payload);
      } else {
        await api.post('/blogs', payload);
      }
      setShowModal(false);
      loadBlogs(editing ? pagination.page : 1);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer cet article ?', 'Suppression'))) return;
    try {
      await api.delete(`/blogs/${id}`);
      setSelectedIds(ids => ids.filter(i => i !== id));
      loadBlogs();
      addToast('Article supprimé', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function toggleSelect(id) { setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  function toggleSelectAll() { setSelectedIds(selectedIds.length === blogs.length ? [] : blogs.map(b => b._id)); }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} article(s) ?`, 'Suppression multiple'))) return;
    try { await Promise.all(selectedIds.map(id => api.delete(`/blogs/${id}`))); setSelectedIds([]); loadBlogs(); addToast('Articles supprimés', 'success'); } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadBlogs(1);
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-blog"></i> Articles de blog</h1>
        <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
          <span className="badge">{pagination.total || 0} articles</span>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Nouvel article</button>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un article..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Tous les statuts</option>
          <option value="publish">Publié</option>
          <option value="draft">Brouillon</option>
        </select>
        {selectedIds.length > 0 && <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}><i className="fas fa-trash"></i> Supprimer ({selectedIds.length})</button>}
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr><th style={{width:36}}><input type="checkbox" checked={blogs.length > 0 && selectedIds.length === blogs.length} onChange={toggleSelectAll} /></th><th style={{width:50}}></th><th>Titre</th><th>Auteur</th><th>Catégorie</th><th>Statut</th><th>Vues</th><th>Créé</th><th>Modifié</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {blogs.map(b => (
                <tr key={b._id} className={selectedIds.includes(b._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(b._id)} onChange={() => toggleSelect(b._id)} /></td>
                  <td><img src={b.featuredImage && b.featuredImage !== 'no-image.jpg' ? b.featuredImage : 'https://placehold.co/40x40/eee/999?text=B'} alt="" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} /></td>
                  <td className="td-title">{b.title}</td>
                  <td style={{whiteSpace:'nowrap'}}><i className="fas fa-user" style={{marginRight:4,opacity:.5}}></i>{b.author || 'AECC'}</td>
                  <td><span className="badge-category">{b.category || '—'}</span></td>
                  <td><span className={`status-badge status-${b.status || 'publish'}`}>{b.status === 'draft' ? 'Brouillon' : 'Publié'}</span></td>
                  <td style={{textAlign:'center'}}><i className="fas fa-eye" style={{marginRight:4,opacity:.5}}></i>{b.views || 0}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{new Date(b.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td className="td-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(b)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {blogs.length === 0 && <tr><td colSpan="10" className="table-empty">Aucun article trouvé</td></tr>}
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
          <div className="modal-box modal-fullscreen" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier l\'article' : 'Nouvel article'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ overflow: 'auto', maxHeight: 'calc(100vh - 120px)' }}>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-group">
                <label>Titre *</label>
                <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="input-lg" placeholder="Titre de l'article..." />
              </div>
              <div className="form-group">
                <label>Contenu * <span style={{fontWeight:400,fontSize:'.82rem',color:'var(--text-light)'}}>(Éditeur Markdown — prévisualisation live)</span></label>
                <div data-color-mode="light">
                  <MDEditor
                    value={form.content}
                    onChange={val => setForm({ ...form, content: val || '' })}
                    height={400}
                    preview="live"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Extrait</label>
                <textarea rows="2" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Résumé court affiché dans les listes..."></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Image de couverture (URL)</label>
                  <input value={form.featuredImage} onChange={e => setForm({ ...form, featuredImage: e.target.value })} placeholder="https://..." />
                  {form.featuredImage && <img src={form.featuredImage} alt="preview" style={{ marginTop: 8, maxWidth: 200, borderRadius: 8 }} onError={e => e.target.style.display='none'} />}
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="publish">Publié</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégories (séparées par virgules)</label>
                  <input value={form.categories} onChange={e => setForm({ ...form, categories: e.target.value })} placeholder="Actualités, Vie Étudiante, Bourses" />
                </div>
                <div className="form-group">
                  <label>Tags (séparés par virgules)</label>
                  <input value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="chine, congo, éducation" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Sauvegarde...</> : editing ? 'Mettre à jour' : 'Publier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
