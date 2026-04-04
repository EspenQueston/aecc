import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useToast } from '../../components/common/ConfirmToast';

function maskValue(value, type) {
  if (!value) return '—';
  if (type === 'passport') {
    return value.substring(0, 2) + '***' + value.slice(-2);
  }
  if (type === 'phone') {
    if (value.length <= 4) return '***' + value;
    return value.substring(0, 4) + '****' + value.slice(-3);
  }
  return value;
}

function formatDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
}

const DEGREE_LABELS = {
  language: 'Cours de langue (汉语)',
  bachelor: 'Licence (本科)',
  master: 'Master (硕士)',
  phd: 'Doctorat (博士)',
  other: 'Autre'
};

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ bio: '', yearOfStudy: '', skills: '' });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showSensitive, setShowSensitive] = useState(false);

  useEffect(() => { loadProfile(); }, []);

  async function loadProfile() {
    try {
      const data = await api.get('/profile/me');
      const p = data.data || data;
      setProfile(p);
      setForm({
        bio: p.bio || '',
        yearOfStudy: p.yearOfStudy || '',
        skills: Array.isArray(p.skills) ? p.skills.join(', ') : (p.skills || '')
      });
    } catch { setProfile(null); }
    setLoading(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      const data = await api.post('/profile', form);
      const p = data.data || data;
      setProfile(p);
      setEditing(false);
      setMessage('Profil mis à jour avec succès !');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) { addToast(err.message, 'error'); }
  }

  if (loading) return <div className="loading-spinner container"><i className="fas fa-spinner fa-spin"></i> Chargement du profil...</div>;

  return (
    <>
      <section className="page-hero page-hero-sm">
        <div className="container">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles et académiques</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {message && <div className="alert alert-success"><i className="fas fa-check-circle"></i> {message}</div>}
          
          <div className="profile-page-layout">
            {/* Profile Sidebar */}
            <div className="profile-sidebar">
              <div className="profile-card-main">
                <div className="profile-avatar-lg">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <h2>{user?.firstName} {user?.secondName ? user.secondName + ' ' : ''}{user?.lastName}</h2>
                <p className="profile-email"><i className="fas fa-envelope"></i> {user?.email}</p>
                <div className="profile-quick-info">
                  <div className="pqi-item">
                    <i className="fas fa-university"></i>
                    <span>{user?.university || '—'}</span>
                  </div>
                  <div className="pqi-item">
                    <i className="fas fa-graduation-cap"></i>
                    <span>{DEGREE_LABELS[user?.degreeLevel] || user?.degreeLevel || '—'}</span>
                  </div>
                  <div className="pqi-item">
                    <i className="fas fa-map-marker-alt"></i>
                    <span>{user?.city ? `${user.city}, ${user.province}` : '—'}</span>
                  </div>
                </div>
                <button className="btn btn-primary btn-block" onClick={() => setEditing(!editing)}>
                  <i className={`fas fa-${editing ? 'times' : 'edit'}`}></i> {editing ? 'Annuler' : 'Modifier le profil'}
                </button>
              </div>

              {/* Bio & Skills */}
              {editing ? (
                <form onSubmit={handleSave} className="profile-edit-card">
                  <h3><i className="fas fa-pen"></i> Modifier</h3>
                  <div className="form-group">
                    <label>Bio</label>
                    <textarea value={form.bio} onChange={e => setForm({...form, bio: e.target.value})} rows="4" placeholder="Parlez-nous de vous..."></textarea>
                  </div>
                  <div className="form-group">
                    <label>Année d'étude</label>
                    <input value={form.yearOfStudy} onChange={e => setForm({...form, yearOfStudy: e.target.value})} placeholder="Ex: 3ème année" />
                  </div>
                  <div className="form-group">
                    <label>Compétences <span className="form-hint">(séparées par des virgules)</span></label>
                    <input value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="Python, React, Data Science..." />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block"><i className="fas fa-save"></i> Sauvegarder</button>
                </form>
              ) : (
                <div className="profile-bio-card">
                  <h3><i className="fas fa-user-circle"></i> À propos</h3>
                  <p className="bio-text">{profile?.bio || 'Aucune bio ajoutée. Cliquez sur "Modifier le profil" pour en ajouter une.'}</p>
                  {profile?.yearOfStudy && <p className="year-study"><i className="fas fa-calendar-alt"></i> {profile.yearOfStudy}</p>}
                  {profile?.skills?.length > 0 && (
                    <div className="skills-section">
                      <h4>Compétences</h4>
                      <div className="skills-tags">
                        {(Array.isArray(profile.skills) ? profile.skills : [profile.skills]).map((s, i) => (
                          <span key={i} className="skill-tag">{s}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Profile Details */}
            <div className="profile-main">
              {/* Personal Information */}
              <div className="profile-section-card">
                <div className="psc-header">
                  <h3><i className="fas fa-id-card"></i> Informations Personnelles</h3>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowSensitive(!showSensitive)}>
                    <i className={`fas fa-eye${showSensitive ? '-slash' : ''}`}></i> {showSensitive ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label><i className="fas fa-user"></i> Prénom</label>
                    <span>{user?.firstName || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-user"></i> Nom</label>
                    <span>{user?.lastName || '—'}</span>
                  </div>
                  {user?.secondName && (
                    <div className="info-item">
                      <label><i className="fas fa-user"></i> Post-nom</label>
                      <span>{user.secondName}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label><i className="fas fa-birthday-cake"></i> Date de naissance</label>
                    <span>{formatDate(user?.dateOfBirth)}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-venus-mars"></i> Genre</label>
                    <span>{user?.gender === 'male' ? 'Homme' : user?.gender === 'female' ? 'Femme' : user?.gender || '—'}</span>
                  </div>
                  <div className="info-item sensitive">
                    <label><i className="fas fa-passport"></i> N° Passeport</label>
                    <span className="masked-value">{showSensitive ? (user?.passportNumber || '—') : maskValue(user?.passportNumber, 'passport')}</span>
                  </div>
                  <div className="info-item sensitive">
                    <label><i className="fas fa-phone"></i> Téléphone</label>
                    <span className="masked-value">{showSensitive ? (user?.phoneNumber || '—') : maskValue(user?.phoneNumber, 'phone')}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fab fa-weixin"></i> WeChat</label>
                    <span>{user?.wechatId || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-map-marker-alt"></i> Province</label>
                    <span>{user?.province || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-city"></i> Ville</label>
                    <span>{user?.city || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-plane-arrival"></i> Entrée en Chine</label>
                    <span>{formatDate(user?.lastEntryDate)}</span>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="profile-section-card">
                <div className="psc-header">
                  <h3><i className="fas fa-graduation-cap"></i> Informations Académiques</h3>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label><i className="fas fa-university"></i> Université</label>
                    <span>{user?.university || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-book"></i> Filière</label>
                    <span>{user?.fieldOfStudy || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-layer-group"></i> Niveau</label>
                    <span>{DEGREE_LABELS[user?.degreeLevel] || user?.degreeLevel || '—'}</span>
                  </div>
                  {user?.yearOfAdmission && (
                    <div className="info-item">
                      <label><i className="fas fa-calendar-plus"></i> Année d'admission</label>
                      <span>{user.yearOfAdmission}</span>
                    </div>
                  )}
                  <div className="info-item">
                    <label><i className="fas fa-calendar-check"></i> Fin d'études prévue</label>
                    <span>{formatDate(user?.expectedGraduation)}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-award"></i> Statut de bourse</label>
                    <span className={`scholarship-status ${user?.scholarshipStatus === 'yes' ? 'active' : ''}`}>
                      {user?.scholarshipStatus === 'yes' ? 'Boursier' : user?.scholarshipStatus === 'no' ? 'Autofinancé' : '—'}
                    </span>
                  </div>
                  {user?.scholarshipType && (
                    <div className="info-item">
                      <label><i className="fas fa-trophy"></i> Type de bourse</label>
                      <span>{user.scholarshipType}</span>
                    </div>
                  )}
                  {user?.studentId && (
                    <div className="info-item">
                      <label><i className="fas fa-id-badge"></i> N° Étudiant</label>
                      <span>{user.studentId}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Account Security */}
              <div className="profile-section-card">
                <div className="psc-header">
                  <h3><i className="fas fa-shield-alt"></i> Sécurité du Compte</h3>
                </div>
                <div className="info-grid">
                  <div className="info-item">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <span>{user?.email || '—'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-user-tag"></i> Rôle</label>
                    <span className="role-badge">{user?.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
                  </div>
                  <div className="info-item">
                    <label><i className="fas fa-clock"></i> Membre depuis</label>
                    <span>{formatDate(user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
