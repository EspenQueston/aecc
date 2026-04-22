import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AuthDotMap from '../../components/auth/AuthDotMap';

export default function AdminLogin() {
  const { adminLogin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [show2FA, setShow2FA] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await adminLogin(email, password, show2FA ? twoFactorToken : undefined);
      if (result?.requires2FA) { setShow2FA(true); setLoading(false); return; }
      navigate('/admin');
    } catch (err) {
      setError(err.data?.errors?.[0]?.msg || err.message);
    }
    setLoading(false);
  }

  return (
    <div className="admin-login-page">
      <div className="auth-wrapper">

        {/* Left panel — animated world map */}
        <div className="auth-sidebar-panel">
          <AuthDotMap />
          <div className="auth-sidebar-overlay">
            <div className="auth-sidebar-logo">
              <div className="auth-logo-img-wrap">
                <img src="/logo.png" alt="AECC" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }} />
                <div className="auth-logo-fallback">🇨🇬</div>
              </div>
              <h2>AECC</h2>
              <p>Administration</p>
            </div>
            <h3 className="auth-sidebar-title">Espace Administrateur</h3>
            <p className="auth-sidebar-sub">Accès réservé aux administrateurs autorisés de l'AECC.</p>
            <div className="auth-features">
              <div className="auth-feature"><i className="fas fa-users-cog"></i><span>Gestion des membres</span></div>
              <div className="auth-feature"><i className="fas fa-chart-bar"></i><span>Statistiques & rapports</span></div>
              <div className="auth-feature"><i className="fas fa-shield-alt"></i><span>Accès sécurisé 2FA</span></div>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          <div className="auth-form">
            <div className="auth-admin-badge">
              <i className="fas fa-shield-alt"></i> Accès Administrateur
            </div>
            <h3>Connexion Admin</h3>
            <p className="auth-subtitle">Panneau d'administration AECC</p>
            {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><i className="fas fa-envelope"></i> Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@aecc.org" required />
              </div>
              <div className="form-group">
                <label><i className="fas fa-lock"></i> Mot de passe</label>
                <div className="input-with-icon">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" required />
                  <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                    <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                  </button>
                </div>
              </div>
              {show2FA && (
                <div className="form-group twofa-input animate-in">
                  <label><i className="fas fa-shield-alt"></i> Code 2FA</label>
                  <input type="text" value={twoFactorToken} onChange={e => setTwoFactorToken(e.target.value)} placeholder="Code à 6 chiffres" maxLength={6} required autoFocus />
                  <small className="form-hint">Entrez le code de votre application d'authentification</small>
                </div>
              )}
              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin"></i> Connexion...</> : <><i className="fas fa-sign-in-alt"></i> Se connecter</>}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
