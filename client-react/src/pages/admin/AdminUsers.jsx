import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

const EMPTY_FORM = {
  firstName: '', lastName: '', secondName: '', email: '', role: 'student', password: '',
  gender: '', dateOfBirth: '', passportNumber: '',
  phone: '', wechat: '', province: '', city: '', lastEntryDate: '',
  university: '', fieldOfStudy: '', degreeLevel: 'bachelor',
  yearOfAdmission: '', expectedGraduation: '', scholarshipStatus: '', scholarshipType: '', studentId: ''
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [viewUser, setViewUser] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const { addToast } = useToast();
  const { confirm } = useConfirm();

  useEffect(() => { loadUsers(); }, [pagination.page, roleFilter]);

  async function loadUsers(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/users?page=${page}&limit=10`;
      if (roleFilter) url += `&role=${roleFilter}`;
      if (search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
      const data = await api.get(url);
      setUsers(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setUsers([]); }
    setLoading(false);
  }

  function openCreate() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  }

  function openEdit(u) {
    setEditing(u._id);
    setForm({
      firstName: u.firstName || u.personal?.firstName || '',
      lastName: u.lastName || u.personal?.lastName || '',
      secondName: u.secondName || u.personal?.secondName || '',
      email: u.email || u.account?.email || '',
      role: u.role || 'student',
      password: '',
      gender: u.gender || u.personal?.gender || '',
      dateOfBirth: u.dateOfBirth || u.personal?.dateOfBirth ? (u.dateOfBirth || u.personal?.dateOfBirth).slice(0, 10) : '',
      passportNumber: u.passportNumber || u.personal?.passportNumber || '',
      phone: u.phone || u.personal?.phoneNumber || '',
      wechat: u.wechat || u.personal?.wechatId || '',
      province: u.province || u.personal?.province || '',
      city: u.city || u.personal?.city || '',
      lastEntryDate: u.lastEntryDate || u.personal?.lastEntryDate ? (u.lastEntryDate || u.personal?.lastEntryDate).slice(0, 10) : '',
      university: u.university || u.academic?.university || '',
      fieldOfStudy: u.fieldOfStudy || u.academic?.fieldOfStudy || '',
      degreeLevel: u.degreeLevel || u.academic?.degreeLevel || 'bachelor',
      yearOfAdmission: u.yearOfAdmission || u.academic?.yearOfAdmission || '',
      expectedGraduation: u.expectedGraduation || u.academic?.expectedGraduation ? (u.expectedGraduation || u.academic?.expectedGraduation).slice(0, 10) : '',
      scholarshipStatus: u.scholarshipStatus || u.academic?.scholarshipStatus || '',
      scholarshipType: u.scholarshipType || u.academic?.scholarshipType || '',
      studentId: u.studentId || u.academic?.studentId || ''
    });
    setError('');
    setShowModal(true);
  }

  async function openView(u) {
    try {
      const data = await api.get(`/users/${u._id}`);
      setViewUser(data.data || data);
    } catch {
      setViewUser(u);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError('Nom, prénom et email sont obligatoires');
      return;
    }
    if (!editing && !form.password) {
      setError('Le mot de passe est obligatoire pour un nouvel utilisateur');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        secondName: form.secondName.trim(),
        email: form.email.trim(),
        role: form.role,
        gender: form.gender || undefined,
        dateOfBirth: form.dateOfBirth || undefined,
        passportNumber: form.passportNumber.trim() || undefined,
        phone: form.phone.trim(),
        wechat: form.wechat.trim(),
        province: form.province.trim() || undefined,
        city: form.city.trim() || undefined,
        lastEntryDate: form.lastEntryDate || undefined,
        university: form.university.trim(),
        fieldOfStudy: form.fieldOfStudy.trim(),
        degreeLevel: form.degreeLevel,
        yearOfAdmission: form.yearOfAdmission || undefined,
        expectedGraduation: form.expectedGraduation || undefined,
        scholarshipStatus: form.scholarshipStatus || undefined,
        scholarshipType: form.scholarshipType.trim() || undefined,
        studentId: form.studentId.trim() || undefined
      };
      if (form.password) payload.password = form.password;
      if (editing) {
        await api.put(`/users/${editing}`, payload);
      } else {
        await api.post('/users/admin-create', payload);
      }
      setShowModal(false);
      loadUsers(editing ? pagination.page : 1);
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    }
    setSaving(false);
  }

  async function handleRoleChange(userId, newRole) {
    if (!(await confirm(`Changer le rôle en "${newRole}" ?`, 'Changement de rôle', 'warning'))) return;
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      loadUsers();
      addToast('Rôle mis à jour', 'success');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    }
  }

  async function handleDelete(userId) {
    if (!(await confirm('Supprimer cet utilisateur ? Cette action est irréversible.', 'Suppression'))) return;
    try {
      await api.delete(`/users/${userId}`);
      setSelectedIds(ids => ids.filter(id => id !== userId));
      loadUsers();
      addToast('Utilisateur supprimé', 'success');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    }
  }

  function toggleSelect(id) {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }
  function toggleSelectAll() {
    if (selectedIds.length === users.length) setSelectedIds([]);
    else setSelectedIds(users.map(u => u._id));
  }
  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} utilisateur(s) ? Cette action est irréversible.`, 'Suppression multiple'))) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/users/${id}`)));
      setSelectedIds([]);
      loadUsers();
      addToast('Utilisateurs supprimés', 'success');
    } catch (err) {
      addToast(err.message || 'Erreur', 'error');
    }
  }

  function handleSearch(e) {
    e.preventDefault();
    setPagination(p => ({ ...p, page: 1 }));
    loadUsers(1);
  }

  async function downloadExcel() {
    try {
      const data = await api.get('/users?page=1&limit=10000');
      const allUsers = data.data || [];
      const headers = ['Prénom','Nom','Post-nom','Email','Rôle','Genre','Date de naissance','N° Passeport','Téléphone','WeChat','Province','Ville','Date entrée Chine','Université','Filière','Niveau','Année admission','Fin études','Boursier','Type bourse','N° Étudiant','Inscription'];
      const rows = allUsers.map(u => [
        u.firstName || u.personal?.firstName || '',
        u.lastName || u.personal?.lastName || '',
        u.secondName || u.personal?.secondName || '',
        u.email || u.account?.email || '',
        u.role || '',
        u.gender || u.personal?.gender || '',
        u.dateOfBirth || u.personal?.dateOfBirth ? new Date(u.dateOfBirth || u.personal?.dateOfBirth).toLocaleDateString('fr-FR') : '',
        u.passportNumber || u.personal?.passportNumber || '',
        u.phone || u.personal?.phoneNumber || '',
        u.wechat || u.personal?.wechatId || '',
        u.province || u.personal?.province || '',
        u.city || u.personal?.city || '',
        u.lastEntryDate || u.personal?.lastEntryDate ? new Date(u.lastEntryDate || u.personal?.lastEntryDate).toLocaleDateString('fr-FR') : '',
        u.university || u.academic?.university || '',
        u.fieldOfStudy || u.academic?.fieldOfStudy || '',
        u.degreeLevel || u.academic?.degreeLevel || '',
        u.yearOfAdmission || u.academic?.yearOfAdmission || '',
        u.expectedGraduation || u.academic?.expectedGraduation ? new Date(u.expectedGraduation || u.academic?.expectedGraduation).toLocaleDateString('fr-FR') : '',
        u.scholarshipStatus || u.academic?.scholarshipStatus || '',
        u.scholarshipType || u.academic?.scholarshipType || '',
        u.studentId || u.academic?.studentId || '',
        new Date(u.createdAt || u.date).toLocaleDateString('fr-FR')
      ]);
      const csvContent = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `utilisateurs_aecc_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      addToast('Erreur lors du téléchargement: ' + (err.message || 'Erreur'), 'error');
    }
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-users"></i> Utilisateurs</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span className="badge">{pagination.total || 0} total</span>
          <button className="btn btn-outline btn-sm" onClick={downloadExcel}><i className="fas fa-file-excel"></i> Exporter CSV</button>
          <button className="btn btn-primary" onClick={openCreate}><i className="fas fa-plus"></i> Nouvel utilisateur</button>
        </div>
      </div>

      <div className="filters-bar">
        <form onSubmit={handleSearch} className="search-inline">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom ou email..." />
          <button type="submit" className="btn btn-primary btn-sm"><i className="fas fa-search"></i></button>
        </form>
        <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}>
          <option value="">Tous les rôles</option>
          <option value="student">Étudiants</option>
          <option value="admin">Administrateurs</option>
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
              <tr><th style={{width:36}}><input type="checkbox" checked={users.length > 0 && selectedIds.length === users.length} onChange={toggleSelectAll} /></th><th>Nom</th><th>Email</th><th>Rôle</th><th>Université</th><th>Inscription</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className={selectedIds.includes(u._id) ? 'row-selected' : ''}>
                  <td><input type="checkbox" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} /></td>
                  <td className="td-title">{u.firstName || u.personal?.firstName} {u.lastName || u.personal?.lastName}</td>
                  <td>{u.email || u.account?.email}</td>
                  <td>
                    <select value={u.role} onChange={e => handleRoleChange(u._id, e.target.value)} className="role-select">
                      <option value="student">Étudiant</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-light)' }}>{u.university || u.academic?.university || '—'}</td>
                  <td>{new Date(u.createdAt || u.date).toLocaleDateString('fr-FR')}</td>
                  <td className="td-actions">
                    <button className="btn btn-ghost btn-sm" onClick={() => openView(u)} title="Voir"><i className="fas fa-eye"></i></button>
                    <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Modifier"><i className="fas fa-edit"></i></button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u._id)} title="Supprimer"><i className="fas fa-trash"></i></button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && <tr><td colSpan="7" className="table-empty">Aucun utilisateur trouvé</td></tr>}
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

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              {error && <div className="alert alert-danger">{error}</div>}

              <h4 style={{ fontSize: '.9rem', color: 'var(--text-light)', marginBottom: '.5rem' }}><i className="fas fa-user"></i> Informations personnelles</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom *</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Nom *</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Post-nom</label>
                  <input value={form.secondName} onChange={e => setForm({ ...form, secondName: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Genre</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })}>
                    <option value="">— Sélectionner —</option>
                    <option value="male">Homme</option>
                    <option value="female">Femme</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>N° Passeport</label>
                  <input value={form.passportNumber} onChange={e => setForm({ ...form, passportNumber: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Téléphone</label>
                  <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+86..." />
                </div>
                <div className="form-group">
                  <label>WeChat ID</label>
                  <input value={form.wechat} onChange={e => setForm({ ...form, wechat: e.target.value })} />
                </div>
              </div>

              <h4 style={{ fontSize: '.9rem', color: 'var(--text-light)', marginBottom: '.5rem', marginTop: '1rem' }}><i className="fas fa-map-marker-alt"></i> Localisation en Chine</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Province</label>
                  <input value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Ville</label>
                  <input value={form.city} onChange={e => setForm({ ...form, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Date d'entrée en Chine</label>
                  <input type="date" value={form.lastEntryDate} onChange={e => setForm({ ...form, lastEntryDate: e.target.value })} />
                </div>
              </div>

              <h4 style={{ fontSize: '.9rem', color: 'var(--text-light)', marginBottom: '.5rem', marginTop: '1rem' }}><i className="fas fa-graduation-cap"></i> Informations académiques</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Université</label>
                  <input value={form.university} onChange={e => setForm({ ...form, university: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Domaine d'études</label>
                  <input value={form.fieldOfStudy} onChange={e => setForm({ ...form, fieldOfStudy: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Niveau d'études</label>
                  <select value={form.degreeLevel} onChange={e => setForm({ ...form, degreeLevel: e.target.value })}>
                    <option value="language">Cours de langue</option>
                    <option value="bachelor">Licence</option>
                    <option value="master">Master</option>
                    <option value="phd">Doctorat</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Année d'admission</label>
                  <input type="number" value={form.yearOfAdmission} onChange={e => setForm({ ...form, yearOfAdmission: e.target.value })} placeholder="2024" min="2000" max="2030" />
                </div>
                <div className="form-group">
                  <label>Fin d'études prévue</label>
                  <input type="date" value={form.expectedGraduation} onChange={e => setForm({ ...form, expectedGraduation: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Boursier</label>
                  <select value={form.scholarshipStatus} onChange={e => setForm({ ...form, scholarshipStatus: e.target.value })}>
                    <option value="">— Sélectionner —</option>
                    <option value="yes">Oui</option>
                    <option value="no">Non</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Type de bourse</label>
                  <input value={form.scholarshipType} onChange={e => setForm({ ...form, scholarshipType: e.target.value })} placeholder="CSC, Provinciale..." />
                </div>
                <div className="form-group">
                  <label>N° Étudiant</label>
                  <input value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} />
                </div>
              </div>

              <h4 style={{ fontSize: '.9rem', color: 'var(--text-light)', marginBottom: '.5rem', marginTop: '1rem' }}><i className="fas fa-lock"></i> Compte</h4>
              <div className="form-row">
                <div className="form-group">
                  <label>Email *</label>
                  <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>{editing ? 'Nouveau mot de passe' : 'Mot de passe *'}</label>
                  <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder={editing ? 'Laisser vide pour ne pas changer' : ''} {...(!editing && { required: true, minLength: 8 })} />
                </div>
                <div className="form-group">
                  <label>Rôle</label>
                  <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                    <option value="student">Étudiant</option>
                    <option value="admin">Administrateur</option>
                  </select>
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

      {/* View User Detail Modal */}
      {viewUser && (
        <div className="modal-overlay" onClick={() => setViewUser(null)}>
          <div className="modal-box modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Détails de l'utilisateur</h2>
              <button className="modal-close" onClick={() => setViewUser(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="modal-body" style={{ maxHeight: 'calc(100vh - 200px)', overflowY: 'auto' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                <div className="admin-avatar" style={{ width: 56, height: 56, fontSize: '1.1rem' }}>
                  {(viewUser.firstName || viewUser.personal?.firstName || '?')[0]}{(viewUser.lastName || viewUser.personal?.lastName || '?')[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{viewUser.firstName || viewUser.personal?.firstName} {viewUser.lastName || viewUser.personal?.lastName} {viewUser.secondName || viewUser.personal?.secondName || ''}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '.88rem' }}>{viewUser.email || viewUser.account?.email}</p>
                  <span className={`status-badge status-${viewUser.role === 'admin' ? 'active' : 'draft'}`}>{viewUser.role === 'admin' ? 'Administrateur' : 'Étudiant'}</span>
                </div>
              </div>

              <h4 style={{ marginBottom: '.5rem', color: 'var(--text)', fontSize: '.95rem' }}><i className="fas fa-user"></i> Informations personnelles</h4>
              <div className="info-grid" style={{ marginBottom: '1.2rem' }}>
                <div className="info-item"><label>Prénom</label><span>{viewUser.firstName || viewUser.personal?.firstName || '—'}</span></div>
                <div className="info-item"><label>Nom</label><span>{viewUser.lastName || viewUser.personal?.lastName || '—'}</span></div>
                <div className="info-item"><label>Post-nom</label><span>{viewUser.secondName || viewUser.personal?.secondName || '—'}</span></div>
                <div className="info-item"><label>Genre</label><span>{({male:'Homme',female:'Femme'})[viewUser.gender || viewUser.personal?.gender] || '—'}</span></div>
                <div className="info-item"><label>Date de naissance</label><span>{viewUser.dateOfBirth || viewUser.personal?.dateOfBirth ? new Date(viewUser.dateOfBirth || viewUser.personal?.dateOfBirth).toLocaleDateString('fr-FR') : '—'}</span></div>
                <div className="info-item"><label>N° Passeport</label><span>{viewUser.passportNumber || viewUser.personal?.passportNumber || '—'}</span></div>
                <div className="info-item"><label><i className="fas fa-phone"></i> Téléphone</label><span>{viewUser.phone || viewUser.personal?.phoneNumber || '—'}</span></div>
                <div className="info-item"><label><i className="fab fa-weixin"></i> WeChat</label><span>{viewUser.wechat || viewUser.personal?.wechatId || '—'}</span></div>
              </div>

              <h4 style={{ marginBottom: '.5rem', color: 'var(--text)', fontSize: '.95rem' }}><i className="fas fa-map-marker-alt"></i> Localisation en Chine</h4>
              <div className="info-grid" style={{ marginBottom: '1.2rem' }}>
                <div className="info-item"><label>Province</label><span>{viewUser.province || viewUser.personal?.province || '—'}</span></div>
                <div className="info-item"><label>Ville</label><span>{viewUser.city || viewUser.personal?.city || '—'}</span></div>
                <div className="info-item"><label>Date d'entrée</label><span>{viewUser.lastEntryDate || viewUser.personal?.lastEntryDate ? new Date(viewUser.lastEntryDate || viewUser.personal?.lastEntryDate).toLocaleDateString('fr-FR') : '—'}</span></div>
              </div>

              <h4 style={{ marginBottom: '.5rem', color: 'var(--text)', fontSize: '.95rem' }}><i className="fas fa-graduation-cap"></i> Informations académiques</h4>
              <div className="info-grid" style={{ marginBottom: '1.2rem' }}>
                <div className="info-item"><label>Université</label><span>{viewUser.university || viewUser.academic?.university || '—'}</span></div>
                <div className="info-item"><label>Filière</label><span>{viewUser.fieldOfStudy || viewUser.academic?.fieldOfStudy || '—'}</span></div>
                <div className="info-item"><label>Niveau</label><span>{({language:'Langue',bachelor:'Licence',master:'Master',phd:'Doctorat'})[viewUser.degreeLevel || viewUser.academic?.degreeLevel] || viewUser.degreeLevel || '—'}</span></div>
                <div className="info-item"><label>Année d'admission</label><span>{viewUser.yearOfAdmission || viewUser.academic?.yearOfAdmission || '—'}</span></div>
                <div className="info-item"><label>Fin d'études prévue</label><span>{viewUser.expectedGraduation || viewUser.academic?.expectedGraduation ? new Date(viewUser.expectedGraduation || viewUser.academic?.expectedGraduation).toLocaleDateString('fr-FR') : '—'}</span></div>
                <div className="info-item"><label>Boursier</label><span>{viewUser.scholarshipStatus || viewUser.academic?.scholarshipStatus === 'yes' ? 'Oui' : viewUser.scholarshipStatus === 'no' || viewUser.academic?.scholarshipStatus === 'no' ? 'Non' : '—'}</span></div>
                <div className="info-item"><label>Type de bourse</label><span>{viewUser.scholarshipType || viewUser.academic?.scholarshipType || '—'}</span></div>
                <div className="info-item"><label>N° Étudiant</label><span>{viewUser.studentId || viewUser.academic?.studentId || '—'}</span></div>
              </div>

              <h4 style={{ marginBottom: '.5rem', color: 'var(--text)', fontSize: '.95rem' }}><i className="fas fa-info-circle"></i> Compte</h4>
              <div className="info-grid">
                <div className="info-item"><label>Email</label><span>{viewUser.email || viewUser.account?.email || '—'}</span></div>
                <div className="info-item"><label>Rôle</label><span>{viewUser.role === 'admin' ? 'Administrateur' : 'Étudiant'}</span></div>
                <div className="info-item"><label>Inscription</label><span>{new Date(viewUser.createdAt || viewUser.date).toLocaleDateString('fr-FR')}</span></div>
                <div className="info-item"><label>2FA</label><span>{viewUser.twoFactorEnabled ? 'Activé' : 'Désactivé'}</span></div>
              </div>

              <div className="modal-footer">
                <button className="btn btn-ghost" onClick={() => setViewUser(null)}>Fermer</button>
                <button className="btn btn-primary" onClick={() => { setViewUser(null); openEdit(viewUser); }}>
                  <i className="fas fa-edit"></i> Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
