import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

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
      <div className="admin-login-card">
        <div className="admin-login-header">
          <span className="logo-icon" style={{ fontSize: '2rem' }}>🇨🇬</span>
          <h1>AECC Admin</h1>
          <p>Panneau d'administration</p>
        </div>
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
  );
}
