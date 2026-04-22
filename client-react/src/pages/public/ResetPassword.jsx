import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthDotMap from '../../components/auth/AuthDotMap';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Erreur');
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <div className="auth-standalone">
      <Link to="/register" className="auth-home-link"><i className="fas fa-arrow-left"></i> Retour à la connexion</Link>
      <section className="auth-section">
        <div className="container">
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
                  <p>Congo — Chine</p>
                </div>
                <h3 className="auth-sidebar-title">Sécurité du compte</h3>
                <p className="auth-sidebar-sub">Créez un nouveau mot de passe fort pour sécuriser votre accès AECC.</p>
                <div className="auth-features">
                  <div className="auth-feature"><i className="fas fa-shield-alt"></i><span>Chiffrement AES-256</span></div>
                  <div className="auth-feature"><i className="fas fa-key"></i><span>Minimum 8 caractères</span></div>
                  <div className="auth-feature"><i className="fas fa-lock"></i><span>Connexion sécurisée SSL</span></div>
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-form-panel">
              {success ? (
                <div className="auth-form auth-form--center">
                  <div className="auth-success-icon" style={{ color: '#22c55e' }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Mot de passe modifié !</h3>
                  <p className="auth-subtitle">
                    Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.
                  </p>
                  <button onClick={() => navigate('/register')} className="btn btn-primary btn-block btn-lg" style={{ marginTop: '1.5rem' }}>
                    <i className="fas fa-sign-in-alt"></i> Se connecter
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-form-icon-header">
                    <i className="fas fa-key"></i>
                  </div>
                  <h3>Nouveau mot de passe</h3>
                  <p className="auth-subtitle">Créez un nouveau mot de passe pour votre compte AECC.</p>
                  {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
                  <div className="form-group">
                    <label><i className="fas fa-lock"></i> Nouveau mot de passe</label>
                    <div className="input-with-icon">
                      <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Minimum 8 caractères" required minLength={8} />
                      <button type="button" className="input-icon-btn" onClick={() => setShowPassword(!showPassword)}>
                        <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label><i className="fas fa-lock"></i> Confirmer le mot de passe</label>
                    <input type={showPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Retapez le mot de passe" required minLength={8} />
                    {confirmPassword && password !== confirmPassword && (
                      <span className="form-hint text-danger"><i className="fas fa-times-circle"></i> Les mots de passe ne correspondent pas</span>
                    )}
                    {confirmPassword && password === confirmPassword && password.length >= 8 && (
                      <span className="form-hint text-success"><i className="fas fa-check-circle"></i> Les mots de passe correspondent</span>
                    )}
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Réinitialisation...</> : <><i className="fas fa-save"></i> Réinitialiser le mot de passe</>}
                  </button>
                  <p className="auth-switch-text">
                    <Link to="/register" className="auth-back-link">
                      <i className="fas fa-arrow-left"></i> Retour à la connexion
                    </Link>
                  </p>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
