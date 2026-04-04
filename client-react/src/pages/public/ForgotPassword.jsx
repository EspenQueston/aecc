import { useState } from 'react';
import { Link } from 'react-router-dom';

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
          <div className="auth-wrapper" style={{ maxWidth: '480px', margin: '0 auto' }}>
            <div className="auth-form-panel" style={{ width: '100%' }}>
              {sent ? (
                <div className="auth-form" style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{ fontSize: '3.5rem', marginBottom: '1rem' }}>
                    <i className="fas fa-paper-plane" style={{ color: '#B7222D' }}></i>
                  </div>
                  <h3 style={{ marginBottom: '.5rem' }}>Email envoyé !</h3>
                  <p style={{ color: '#555', fontSize: '.92rem', lineHeight: '1.6', marginBottom: '1.2rem' }}>
                    Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques instants.
                  </p>
                  <p style={{ color: '#888', fontSize: '.82rem' }}>
                    <i className="fas fa-info-circle"></i> Vérifiez aussi vos spams. Le lien expire après 1 heure.
                  </p>
                  <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
                    <Link to="/register" className="link-btn" style={{ color: '#B7222D', fontWeight: '500', fontSize: '.88rem' }}>
                      <i className="fas fa-arrow-left"></i> Retour à la connexion
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="auth-form">
                  <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                    <i className="fas fa-lock" style={{ fontSize: '2.5rem', color: '#B7222D', marginBottom: '.5rem', display: 'block' }}></i>
                    <h3>Mot de passe oublié ?</h3>
                    <p className="auth-subtitle">Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>
                  </div>
                  {error && <div className="alert alert-error"><i className="fas fa-exclamation-circle"></i> {error}</div>}
                  <div className="form-group">
                    <label><i className="fas fa-envelope"></i> Email</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="votreemail@exemple.com" required />
                  </div>
                  <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                    {loading ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <><i className="fas fa-paper-plane"></i> Envoyer le lien</>}
                  </button>
                  <p className="auth-switch-text" style={{ marginTop: '1rem' }}>
                    <Link to="/register" style={{ color: '#B7222D', fontWeight: '500', textDecoration: 'none' }}>
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
