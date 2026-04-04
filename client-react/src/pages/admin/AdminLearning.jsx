import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

/* ─── Constants ─── */
const CHANNEL_CATEGORIES = [
  { value: 'finances-economie', label: 'Finances & Économie' },
  { value: 'computer-science', label: 'Computer Science' },
  { value: 'droit-law', label: 'Droit & Law' },
  { value: 'business-commerce', label: 'Business & Commerce' },
  { value: 'agriculture-elevage', label: 'Agriculture & Élevage' },
  { value: 'marketing-communication', label: 'Marketing & Communication' },
  { value: 'cryptomonnaie', label: 'Cryptomonnaie' },
  { value: 'sciences-physique', label: 'Sciences — Physique' },
  { value: 'sciences-chimie', label: 'Sciences — Chimie' },
  { value: 'sciences-biologie', label: 'Sciences — Biologie' },
  { value: 'sciences-mathematiques', label: 'Sciences — Mathématiques' },
  { value: 'sciences-medecine', label: 'Sciences — Médecine' },
  { value: 'sciences-ingenierie', label: 'Sciences — Ingénierie' },
  { value: 'langues', label: 'Langues' },
  { value: 'art-culture', label: 'Art & Culture' },
  { value: 'developpement-personnel', label: 'Développement Personnel' },
  { value: 'aecc', label: 'AECC' },
  { value: 'autre', label: 'Autre' },
];

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'Anglais' },
  { value: 'zh', label: 'Chinois' },
  { value: 'multi', label: 'Multilingue' },
];

const LEVELS = [
  { value: '', label: 'Non spécifié' },
  { value: 'tous-niveaux', label: 'Tous niveaux' },
  { value: 'debutant', label: 'Débutant' },
  { value: 'intermediaire', label: 'Intermédiaire' },
  { value: 'avance', label: 'Avancé' },
];

const TABS = [
  { key: 'channels', label: 'Canaux Telegram', icon: 'fab fa-telegram-plane' },
  { key: 'formation', label: 'Formations', icon: 'fas fa-graduation-cap' },
  { key: 'youtube', label: 'YouTube', icon: 'fab fa-youtube' },
  { key: 'useful-link', label: 'Liens Utiles', icon: 'fas fa-link' },
];

const EMPTY_CHANNEL = {
  name: '', description: '', url: '', category: 'computer-science',
  icon: 'fab fa-telegram-plane', subscribers: 0, language: 'fr',
  featured: false, status: 'active'
};

const EMPTY_RESOURCE = {
  title: '', description: '', url: '', icon: 'fas fa-book',
  color: '#2563eb', level: '', slug: '', highlight: false,
  featured: false, status: 'active', order: 0,
  sourceType: 'url', // 'url' or 'file'
  longDescription: '', advantages: '', disadvantages: '', details: ''
};

const FRONTEND_URL = '/learning';

export default function AdminLearning() {
  const [activeTab, setActiveTab] = useState('channels');

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-book-reader"></i> Gestion de l'Apprentissage</h1>
        <a href={FRONTEND_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="Voir la page Learning">
          <i className="fas fa-external-link-alt"></i> Voir la page
        </a>
      </div>

      <div className="admin-tabs" style={{ display: 'flex', gap: '.25rem', marginBottom: '1.5rem', borderBottom: '2px solid var(--border)', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            className={`btn ${activeTab === t.key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setActiveTab(t.key)}
            style={{ borderRadius: '.5rem .5rem 0 0', fontWeight: activeTab === t.key ? 600 : 400 }}
          >
            <i className={t.icon} style={{ marginRight: '.4rem' }}></i> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'channels' && <ChannelsTab />}
      {activeTab === 'formation' && <ResourcesTab type="formation" typeLabel="Formation" defaultIcon="fas fa-graduation-cap" showLevel />}
      {activeTab === 'youtube' && <ResourcesTab type="youtube" typeLabel="Chaîne YouTube" defaultIcon="fab fa-youtube" />}
      {activeTab === 'useful-link' && <ResourcesTab type="useful-link" typeLabel="Lien Utile" defaultIcon="fas fa-link" showHighlight />}
    </div>
  );
}

/* ═══════════════════════════════════════════════
   Channels Tab (existing functionality preserved)
   ═══════════════════════════════════════════════ */
function ChannelsTab() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [channels, setChannels] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_CHANNEL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { loadChannels(); }, [pagination.page, categoryFilter]);

  async function loadChannels(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/learning/admin?page=${page}&limit=20`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      if (categoryFilter) url += `&category=${categoryFilter}`;
      const data = await api.get(url);
      setChannels(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setChannels([]); }
    setLoading(false);
  }

  function handleSearch(e) { e.preventDefault(); setPagination(p => ({ ...p, page: 1 })); loadChannels(1); }

  function openCreate() { setEditing(null); setForm(EMPTY_CHANNEL); setError(''); setShowModal(true); }

  function openEdit(ch) {
    setEditing(ch._id);
    setForm({
      name: ch.name || '', description: ch.description || '', url: ch.url || '',
      category: ch.category || 'autre', icon: ch.icon || 'fab fa-telegram-plane',
      subscribers: ch.subscribers || 0, language: ch.language || 'fr',
      featured: ch.featured || false, status: ch.status || 'active',
    });
    setError(''); setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.url.trim()) {
      setError('Nom, description et URL sont requis'); return;
    }
    setSaving(true); setError('');
    try {
      const payload = { ...form, name: form.name.trim(), description: form.description.trim(), url: form.url.trim() };
      if (editing) { await api.put(`/learning/${editing}`, payload); }
      else { await api.post('/learning', payload); }
      setShowModal(false); loadChannels(editing ? pagination.page : 1);
    } catch (err) { setError(err.message || 'Erreur'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer ce canal ?', 'Suppression'))) return;
    try { await api.delete(`/learning/${id}`); setSelectedIds(ids => ids.filter(i => i !== id)); loadChannels(); addToast('Canal supprimé', 'success'); }
    catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function toggleSelect(id) { setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  function toggleSelectAll() { setSelectedIds(selectedIds.length === channels.length ? [] : channels.map(c => c._id)); }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} canal(aux) ?`, 'Suppression multiple'))) return;
    try { await Promise.all(selectedIds.map(id => api.delete(`/learning/${id}`))); setSelectedIds([]); loadChannels(); addToast('Canaux supprimés', 'success'); }
    catch (err) { addToast(err.message, 'error'); }
  }

  function catLabel(val) { return CHANNEL_CATEGORIES.find(c => c.value === val)?.label || val; }

  return (
    <>
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <select value={categoryFilter} onChange={e => { setCategoryFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Toutes catégories</option>
          {CHANNEL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Nouveau canal</button>
        {selectedIds.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i> Supprimer ({selectedIds.length})
          </button>
        )}
        <span className="badge" style={{ marginLeft: 'auto' }}>{pagination.total || 0} total</span>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}><input type="checkbox" checked={channels.length > 0 && selectedIds.length === channels.length} onChange={toggleSelectAll} /></th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Langue</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map(ch => (
                <tr key={ch._id} className={selectedIds.includes(ch._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(ch._id)} onChange={() => toggleSelect(ch._id)} /></td>
                  <td className="td-title">
                    <i className={ch.icon} style={{ marginRight: '.4rem', color: 'var(--text-light)' }}></i>
                    {ch.name}
                    {ch.featured && <i className="fas fa-star" style={{ color: '#f59e0b', marginLeft: '.4rem', fontSize: '.75rem' }}></i>}
                  </td>
                  <td><span className="status-badge">{catLabel(ch.category)}</span></td>
                  <td>{ch.language === 'fr' ? '🇫🇷' : ch.language === 'en' ? '🇬🇧' : ch.language === 'zh' ? '🇨🇳' : '🌍'}</td>
                  <td><span className={`status-badge status-${ch.status}`}>{ch.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                  <td className="td-actions">
                    <a href={ch.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="Voir le canal"><i className="fas fa-eye"></i></a>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(ch)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(ch._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {channels.length === 0 && <tr><td colSpan="6" className="table-empty">Aucun canal trouvé</td></tr>}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}><i className="fas fa-chevron-left"></i></button>
              <span>Page {pagination.page} / {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}><i className="fas fa-chevron-right"></i></button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier le canal' : 'Nouveau canal'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group"><label>Nom *</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
                <div className="form-group"><label>URL Telegram *</label><input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://t.me/..." required /></div>
              </div>
              <div className="form-group"><label>Description *</label><textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea></div>
              <div className="form-row">
                <div className="form-group">
                  <label>Catégorie</label>
                  <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                    {CHANNEL_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Langue</label>
                  <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })}>
                    {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Icône (FontAwesome)</label><input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder="fab fa-telegram-plane" /></div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Actif</option><option value="inactive">Inactif</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                  <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                  Recommandé (mis en avant)
                </label>
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
    </>
  );
}

/* ═══════════════════════════════════════════════
   Resources Tab (formations, youtube, links)
   ═══════════════════════════════════════════════ */
function ResourcesTab({ type, typeLabel, defaultIcon, showLevel, showHighlight }) {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ ...EMPTY_RESOURCE, icon: defaultIcon });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => { loadResources(); }, [pagination.page]);

  async function loadResources(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/learning/resources/admin?type=${type}&page=${page}&limit=20`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const data = await api.get(url);
      setResources(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setResources([]); }
    setLoading(false);
  }

  function handleSearch(e) { e.preventDefault(); setPagination(p => ({ ...p, page: 1 })); loadResources(1); }

  function openCreate() {
    setEditing(null);
    setForm({ ...EMPTY_RESOURCE, icon: defaultIcon, sourceType: 'url' });
    setFile(null);
    setError('');
    setShowModal(true);
  }

  function openEdit(r) {
    setEditing(r._id);
    setForm({
      title: r.title || '', description: r.description || '', url: r.url || '',
      icon: r.icon || defaultIcon, color: r.color || '#2563eb',
      level: r.level || '', slug: r.slug || '',
      highlight: r.highlight || false, featured: r.featured || false,
      status: r.status || 'active', order: r.order || 0,
      sourceType: r.filePath ? 'file' : 'url',
      existingFile: r.filePath || '', existingFileName: r.fileName || '',
      longDescription: r.longDescription || '',
      advantages: (r.advantages || []).join('\n'),
      disadvantages: (r.disadvantages || []).join('\n'),
      details: (r.details || []).join('\n')
    });
    setFile(null);
    setError('');
    setShowModal(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) {
      setError('Titre et description sont requis'); return;
    }
    if (form.sourceType === 'url' && !form.url.trim()) {
      setError('L\'URL est requis'); return;
    }
    if (form.sourceType === 'file' && !file && !form.existingFile) {
      setError('Veuillez sélectionner un fichier'); return;
    }
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('icon', form.icon);
      fd.append('color', form.color);
      fd.append('featured', form.featured);
      fd.append('status', form.status);
      fd.append('order', form.order);
      if (showLevel) fd.append('level', form.level);
      if (form.slug) fd.append('slug', form.slug.trim());
      if (showHighlight) fd.append('highlight', form.highlight);
      // Detail fields
      if (form.longDescription) fd.append('longDescription', form.longDescription);
      const advArr = form.advantages.split('\n').map(s => s.trim()).filter(Boolean);
      const disArr = form.disadvantages.split('\n').map(s => s.trim()).filter(Boolean);
      const detArr = form.details.split('\n').map(s => s.trim()).filter(Boolean);
      if (advArr.length) fd.append('advantages', JSON.stringify(advArr));
      if (disArr.length) fd.append('disadvantages', JSON.stringify(disArr));
      if (detArr.length) fd.append('details', JSON.stringify(detArr));
      if (form.sourceType === 'url') {
        fd.append('url', form.url.trim());
      } else if (file) {
        fd.append('file', file);
      } else if (form.existingFile) {
        fd.append('keepFile', 'true');
      }

      if (editing) {
        await api.uploadPut(`/learning/resources/${editing}`, fd);
      } else {
        await api.upload('/learning/resources', fd);
      }
      setShowModal(false);
      loadResources(editing ? pagination.page : 1);
    } catch (err) { setError(err.message || 'Erreur'); }
    setSaving(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer cette ressource ?', 'Suppression'))) return;
    try { await api.delete(`/learning/resources/${id}`); setSelectedIds(ids => ids.filter(i => i !== id)); loadResources(); addToast('Ressource supprimée', 'success'); }
    catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function toggleSelect(id) { setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]); }
  function toggleSelectAll() { setSelectedIds(selectedIds.length === resources.length ? [] : resources.map(r => r._id)); }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} ressource(s) ?`, 'Suppression multiple'))) return;
    try { await Promise.all(selectedIds.map(id => api.delete(`/learning/resources/${id}`))); setSelectedIds([]); loadResources(); addToast('Ressources supprimées', 'success'); }
    catch (err) { addToast(err.message, 'error'); }
  }

  function levelLabel(val) { return LEVELS.find(l => l.value === val)?.label || val || '—'; }

  function getResourceUrl(r) {
    if (r.filePath) return r.filePath;
    return r.url || '#';
  }

  return (
    <>
      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> {typeLabel}</button>
        {selectedIds.length > 0 && (
          <button className="btn btn-danger btn-sm" onClick={handleBulkDelete}>
            <i className="fas fa-trash"></i> Supprimer ({selectedIds.length})
          </button>
        )}
        <span className="badge" style={{ marginLeft: 'auto' }}>{pagination.total || 0} total</span>
      </div>

      {loading ? (
        <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i></div>
      ) : (
        <>
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 36 }}><input type="checkbox" checked={resources.length > 0 && selectedIds.length === resources.length} onChange={toggleSelectAll} /></th>
                <th>Titre</th>
                <th>Source</th>
                {showLevel && <th>Niveau</th>}
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map(r => (
                <tr key={r._id} className={selectedIds.includes(r._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(r._id)} onChange={() => toggleSelect(r._id)} /></td>
                  <td className="td-title">
                    <i className={r.icon || defaultIcon} style={{ marginRight: '.4rem', color: r.color || 'var(--text-light)' }}></i>
                    {r.title}
                    {r.featured && <i className="fas fa-star" style={{ color: '#f59e0b', marginLeft: '.4rem', fontSize: '.75rem' }}></i>}
                    {r.highlight && <i className="fas fa-bolt" style={{ color: '#e11d48', marginLeft: '.4rem', fontSize: '.75rem' }}></i>}
                  </td>
                  <td>
                    {r.filePath ? (
                      <span className="status-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>
                        <i className="fas fa-file" style={{ marginRight: '.3rem' }}></i> Fichier
                      </span>
                    ) : (
                      <span className="status-badge" style={{ background: '#dcfce7', color: '#166534' }}>
                        <i className="fas fa-link" style={{ marginRight: '.3rem' }}></i> Lien
                      </span>
                    )}
                  </td>
                  {showLevel && <td><span className="status-badge">{levelLabel(r.level)}</span></td>}
                  <td><span className={`status-badge status-${r.status}`}>{r.status === 'active' ? 'Actif' : 'Inactif'}</span></td>
                  <td className="td-actions">
                    <a href={`/learning/resource/${r._id}`} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" title="Voir la page détail">
                      <i className="fas fa-eye"></i>
                    </a>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(r)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {resources.length === 0 && <tr><td colSpan={showLevel ? 6 : 5} className="table-empty">Aucune ressource trouvée</td></tr>}
            </tbody>
          </table>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}><i className="fas fa-chevron-left"></i></button>
              <span>Page {pagination.page} / {pagination.pages}</span>
              <button disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}><i className="fas fa-chevron-right"></i></button>
            </div>
          )}
        </>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? `Modifier ${typeLabel}` : `Nouveau ${typeLabel}`}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="form-row">
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Titre *</label>
                  <input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Ordre</label>
                  <input type="number" min="0" value={form.order} onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 0 })} />
                </div>
              </div>
              <div className="form-group">
                <label>Description *</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
              </div>

              {/* Source: URL or File toggle */}
              <div className="form-group">
                <label>Type de source *</label>
                <div style={{ display: 'flex', gap: '.5rem', marginBottom: '.5rem' }}>
                  <button type="button" className={`btn btn-sm ${form.sourceType === 'url' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setForm({ ...form, sourceType: 'url' })}>
                    <i className="fas fa-link"></i> Lien URL
                  </button>
                  <button type="button" className={`btn btn-sm ${form.sourceType === 'file' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setForm({ ...form, sourceType: 'file' })}>
                    <i className="fas fa-file-upload"></i> Fichier
                  </button>
                </div>
                {form.sourceType === 'url' ? (
                  <input value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
                ) : (
                  <div>
                    <input type="file" onChange={e => setFile(e.target.files[0])} accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif" />
                    {form.existingFile && !file && (
                      <div style={{ marginTop: '.3rem', fontSize: '.85rem', color: 'var(--text-light)' }}>
                        <i className="fas fa-paperclip"></i> Fichier actuel: {form.existingFileName || form.existingFile}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Icône (FontAwesome)</label>
                  <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} placeholder={defaultIcon} />
                </div>
                <div className="form-group">
                  <label>Couleur</label>
                  <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} style={{ width: 40, height: 34, padding: 2, cursor: 'pointer' }} />
                    <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} placeholder="#2563eb" style={{ flex: 1 }} />
                  </div>
                </div>
              </div>

              {showLevel && (
                <div className="form-row">
                  <div className="form-group">
                    <label>Niveau</label>
                    <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                      {LEVELS.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Slug (URL friendly)</label>
                    <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} placeholder="ex: chinois-mandarin" />
                  </div>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="active">Actif</option><option value="inactive">Inactif</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <input type="checkbox" checked={form.featured} onChange={e => setForm({ ...form, featured: e.target.checked })} />
                    Recommandé
                  </label>
                </div>
              </div>

              {showHighlight && (
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                    <input type="checkbox" checked={form.highlight} onChange={e => setForm({ ...form, highlight: e.target.checked })} />
                    Mettre en avant (highlight)
                  </label>
                </div>
              )}

              {/* ── Detail page content ── */}
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '.5rem' }}>
                <h3 style={{ fontSize: '.95rem', color: 'var(--text-light)', marginBottom: '.8rem' }}><i className="fas fa-file-alt" style={{ marginRight: '.4rem' }}></i> Contenu de la page détail</h3>
                <div className="form-group">
                  <label>Description longue</label>
                  <textarea rows="4" value={form.longDescription} onChange={e => setForm({ ...form, longDescription: e.target.value })} placeholder="Description détaillée de la ressource..."></textarea>
                </div>
                <div className="form-group">
                  <label>Avantages <span style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>(un par ligne)</span></label>
                  <textarea rows="3" value={form.advantages} onChange={e => setForm({ ...form, advantages: e.target.value })} placeholder="Gratuit et accessible&#10;Contenu de qualité&#10;Mis à jour régulièrement"></textarea>
                </div>
                <div className="form-group">
                  <label>Points d'attention <span style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>(un par ligne)</span></label>
                  <textarea rows="3" value={form.disadvantages} onChange={e => setForm({ ...form, disadvantages: e.target.value })} placeholder="Contenu principalement en anglais&#10;Nécessite une connexion internet"></textarea>
                </div>
                <div className="form-group">
                  <label>Détails importants <span style={{ fontSize: '.8rem', color: 'var(--text-light)' }}>(un par ligne)</span></label>
                  <textarea rows="3" value={form.details} onChange={e => setForm({ ...form, details: e.target.value })} placeholder="Plus de 100 cours disponibles&#10;Certificat délivré à la fin"></textarea>
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
    </>
  );
}
