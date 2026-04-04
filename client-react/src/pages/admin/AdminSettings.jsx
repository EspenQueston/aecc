import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

export default function AdminSettings() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwMsg, setPwMsg] = useState({ type: '', text: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const [twoFA, setTwoFA] = useState({ enabled: false, qrCode: '', secret: '' });
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFAMsg, setTwoFAMsg] = useState({ type: '', text: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

  // Profile state
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', phone: '', wechat: '' });
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    if (user?.twoFactorEnabled) setTwoFA(s => ({ ...s, enabled: true }));
    if (user) {
      setProfileForm({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || user.phoneNumber || '',
        wechat: user.wechat || user.wechatId || ''
      });
    }
  }, [user]);

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg({ type: '', text: '' });
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
      return;
    }
    if (pwForm.newPassword.length < 8) {
      setPwMsg({ type: 'error', text: 'Le mot de passe doit contenir au moins 8 caractères' });
      return;
    }
    setPwLoading(true);
    try {
      await api.put('/auth/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword
      });
      setPwMsg({ type: 'success', text: 'Mot de passe mis à jour avec succès' });
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message || 'Erreur lors de la mise à jour' });
    }
    setPwLoading(false);
  }

  async function generate2FA() {
    setTwoFAMsg({ type: '', text: '' });
    try {
      const data = await api.post('/auth/2fa/generate');
      setTwoFA({ enabled: false, qrCode: data.qrCode, secret: data.secret });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: err.message });
    }
  }

  async function verify2FA(e) {
    e.preventDefault();
    setTwoFAMsg({ type: '', text: '' });
    try {
      await api.post('/auth/2fa/verify', { token: twoFAToken });
      setTwoFA({ enabled: true, qrCode: '', secret: '' });
      setTwoFAToken('');
      setTwoFAMsg({ type: 'success', text: '2FA activé avec succès' });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: err.message || 'Code invalide' });
    }
  }

  async function disable2FA() {
    if (!(await confirm('Désactiver l\'authentification à deux facteurs ?', 'Désactivation 2FA', 'warning'))) return;
    try {
      await api.post('/auth/2fa/disable');
      setTwoFA({ enabled: false, qrCode: '', secret: '' });
      setTwoFAMsg({ type: 'success', text: '2FA désactivé' });
    } catch (err) {
      setTwoFAMsg({ type: 'error', text: err.message });
    }
  }

  async function handleProfileUpdate(e) {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileLoading(true);
    try {
      await api.put('/auth/profile', {
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        phone: profileForm.phone,
        wechat: profileForm.wechat
      });
      setProfileMsg({ type: 'success', text: 'Profil mis à jour avec succès' });
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Erreur lors de la mise à jour' });
    }
    setProfileLoading(false);
  }

  return (
    <div className="admin-page">
      <div className="page-title-bar">
        <h1><i className="fas fa-cog"></i> Paramètres & Profil</h1>
      </div>

      {/* Profile Card (full width) */}
      <div className="settings-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="admin-avatar" style={{ width: 72, height: 72, fontSize: '1.4rem' }}>
            {(user?.firstName || '?')[0]}{(user?.lastName || '?')[0]}
          </div>
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '.2rem' }}>{user?.firstName} {user?.lastName}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '.9rem' }}>{user?.email}</p>
            <span className="status-badge status-publish" style={{ marginTop: '.3rem', display: 'inline-block' }}>{user?.role === 'admin' ? 'Administrateur' : user?.role}</span>
          </div>
        </div>
        {profileMsg.text && <div className={`alert alert-${profileMsg.type === 'success' ? 'success' : 'danger'}`}>{profileMsg.text}</div>}
        <form onSubmit={handleProfileUpdate}>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-user"></i> Prénom</label>
              <input value={profileForm.firstName} onChange={e => setProfileForm({ ...profileForm, firstName: e.target.value })} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-user"></i> Nom</label>
              <input value={profileForm.lastName} onChange={e => setProfileForm({ ...profileForm, lastName: e.target.value })} />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fas fa-envelope"></i> Email</label>
              <input value={profileForm.email} disabled style={{ background: 'var(--bg-alt)', cursor: 'not-allowed' }} />
            </div>
            <div className="form-group">
              <label><i className="fas fa-phone"></i> Téléphone</label>
              <input value={profileForm.phone} onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="+86..." />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label><i className="fab fa-weixin"></i> WeChat ID</label>
              <input value={profileForm.wechat} onChange={e => setProfileForm({ ...profileForm, wechat: e.target.value })} />
            </div>
            <div></div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={profileLoading}>
            {profileLoading ? <><i className="fas fa-spinner fa-spin"></i> Mise à jour...</> : <><i className="fas fa-save"></i> Sauvegarder le profil</>}
          </button>
        </form>
      </div>

      <div className="settings-grid">
        {/* Password Change */}
        <div className="settings-card">
          <h2><i className="fas fa-lock"></i> Changer le mot de passe</h2>
          {pwMsg.text && <div className={`alert alert-${pwMsg.type === 'success' ? 'success' : 'danger'}`}>{pwMsg.text}</div>}
          <form onSubmit={handlePasswordChange}>
            <div className="form-group">
              <label>Mot de passe actuel</label>
              <div className="input-with-icon">
                <input type={showPw.current ? 'text' : 'password'} value={pwForm.currentPassword} onChange={e => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(s => ({ ...s, current: !s.current }))}><i className={`fas fa-eye${showPw.current ? '-slash' : ''}`}></i></button>
              </div>
            </div>
            <div className="form-group">
              <label>Nouveau mot de passe</label>
              <div className="input-with-icon">
                <input type={showPw.new ? 'text' : 'password'} value={pwForm.newPassword} onChange={e => setPwForm({ ...pwForm, newPassword: e.target.value })} required minLength={8} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(s => ({ ...s, new: !s.new }))}><i className={`fas fa-eye${showPw.new ? '-slash' : ''}`}></i></button>
              </div>
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <div className="input-with-icon">
                <input type={showPw.confirm ? 'text' : 'password'} value={pwForm.confirmPassword} onChange={e => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required minLength={8} />
                <button type="button" className="input-icon-btn" onClick={() => setShowPw(s => ({ ...s, confirm: !s.confirm }))}><i className={`fas fa-eye${showPw.confirm ? '-slash' : ''}`}></i></button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={pwLoading}>
              {pwLoading ? <><i className="fas fa-spinner fa-spin"></i> Mise à jour...</> : 'Mettre à jour'}
            </button>
          </form>
        </div>

        {/* 2FA Settings */}
        <div className="settings-card">
          <h2><i className="fas fa-shield-alt"></i> Authentification à deux facteurs (2FA)</h2>
          {twoFAMsg.text && <div className={`alert alert-${twoFAMsg.type === 'success' ? 'success' : 'danger'}`}>{twoFAMsg.text}</div>}

          {twoFA.enabled ? (
            <div className="twofa-status">
              <div className="twofa-enabled">
                <i className="fas fa-check-circle"></i>
                <span>2FA est actuellement <strong>activé</strong></span>
              </div>
              <button onClick={disable2FA} className="btn btn-danger"><i className="fas fa-times"></i> Désactiver 2FA</button>
            </div>
          ) : twoFA.qrCode ? (
            <div className="twofa-setup">
              <p>Scannez ce QR code avec votre application d'authentification :</p>
              <div className="twofa-qr">
                <img src={twoFA.qrCode} alt="QR Code 2FA" />
              </div>
              <p className="form-hint">Ou entrez manuellement : <code>{twoFA.secret}</code></p>
              <form onSubmit={verify2FA} className="twofa-verify">
                <div className="form-group">
                  <label>Code de vérification</label>
                  <input type="text" value={twoFAToken} onChange={e => setTwoFAToken(e.target.value)} placeholder="123456" maxLength={6} className="twofa-input" required />
                </div>
                <button type="submit" className="btn btn-primary">Vérifier et activer</button>
              </form>
            </div>
          ) : (
            <div className="twofa-status">
              <p>Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
              <button onClick={generate2FA} className="btn btn-primary"><i className="fas fa-qrcode"></i> Configurer 2FA</button>
            </div>
          )}
        </div>

        {/* Account Info */}
        <div className="settings-card">
          <h2><i className="fas fa-info-circle"></i> Informations du compte</h2>
          <div className="account-info">
            <div className="info-row"><label>Membre depuis</label><span>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : '—'}</span></div>
            <div className="info-row"><label>Rôle</label><span className="status-badge status-publish">{user?.role === 'admin' ? 'Administrateur' : user?.role}</span></div>
            <div className="info-row"><label>Dernière connexion</label><span>{new Date().toLocaleDateString('fr-FR')}</span></div>
            <div className="info-row"><label>Email</label><span>{user?.email || user?.account?.email || '—'}</span></div>
            <div className="info-row"><label>Genre</label><span>{user?.gender || user?.personal?.gender === 'male' ? 'Homme' : user?.personal?.gender === 'female' ? 'Femme' : user?.gender || '—'}</span></div>
            <div className="info-row"><label>Date de naissance</label><span>{user?.dateOfBirth || user?.personal?.dateOfBirth ? new Date(user.dateOfBirth || user.personal?.dateOfBirth).toLocaleDateString('fr-FR') : '—'}</span></div>
            <div className="info-row"><label>N° Passeport</label><span>{user?.passportNumber || user?.personal?.passportNumber || '—'}</span></div>
          </div>
        </div>

        {/* Location & Academic Info */}
        <div className="settings-card">
          <h2><i className="fas fa-map-marker-alt"></i> Localisation & Études</h2>
          <div className="account-info">
            <div className="info-row"><label>Province</label><span>{user?.province || user?.personal?.province || '—'}</span></div>
            <div className="info-row"><label>Ville</label><span>{user?.city || user?.personal?.city || '—'}</span></div>
            <div className="info-row"><label>Date d'entrée en Chine</label><span>{user?.lastEntryDate || user?.personal?.lastEntryDate ? new Date(user.lastEntryDate || user.personal?.lastEntryDate).toLocaleDateString('fr-FR') : '—'}</span></div>
            <div className="info-row"><label>Université</label><span>{user?.university || user?.academic?.university || '—'}</span></div>
            <div className="info-row"><label>Filière</label><span>{user?.fieldOfStudy || user?.academic?.fieldOfStudy || '—'}</span></div>
            <div className="info-row"><label>Niveau</label><span>{user?.degreeLevel || user?.academic?.degreeLevel || '—'}</span></div>
            <div className="info-row"><label>Statut bourse</label><span>{user?.scholarshipStatus || user?.academic?.scholarshipStatus || '—'}</span></div>
            <div className="info-row"><label>Type de bourse</label><span>{user?.scholarshipType || user?.academic?.scholarshipType || '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
