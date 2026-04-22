import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthDotMap from '../../components/auth/AuthDotMap';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || 'Erreur');
      setSent(true);
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
                <h3 className="auth-sidebar-title">Récupération de compte</h3>
                <p className="auth-sidebar-sub">Saisissez votre email pour recevoir un lien de réinitialisation sécurisé.</p>
                <div className="auth-features">
                  <div className="auth-feature"><i className="fas fa-shield-alt"></i><span>Lien sécurisé & chiffré</span></div>
                  <div className="auth-feature"><i className="fas fa-clock"></i><span>Valide pendant 1 heure</span></div>
                  <div className="auth-feature"><i className="fas fa-lock"></i><span>Vos données protégées</span></div>
                </div>
              </div>
            </div>

            {/* Right panel — form */}
            <div className="auth-form-panel">
              {sent ? (
                <div className="auth-form auth-form--center">
                  <div className="auth-success-icon">
                    <i className="fas fa-paper-plane"></i>
                  </div>
                  <h3>Email envoyé !</h3>
                  <p className="auth-subtitle">
                    Si un compte existe avec l'adresse <strong style={{ color: '#fff' }}>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
                  </p>
                  <p className="auth-hint"><i className="fas fa-info-circle"></i> Vérifiez aussi vos spams. Le lien expire après 1 heure.</p>
                  <div className="auth-form-divider"></div>
                  <Link to="/register" className="auth-back-link">
                    <i className="fas fa-arrow-left"></i> Retour à la connexion
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  <div className="auth-form-icon-header">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h3>Mot de passe oublié ?</h3>
                  <p className="auth-subtitle">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
                  {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votreemail@exemple.com" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <><i className="fas fa-paper-plane"></i> Envoyer le lien</>}
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
