import { useState } from 'react';
import { api } from '../../services/api';

export default function NewsletterBlock() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatus(null);
    try {
      await api.post('/newsletter/subscribe', { email: email.trim() });
      setStatus({ type: 'success', msg: 'Inscription réussie ! Vous recevrez nos prochaines actualités.' });
      setEmail('');
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Erreur lors de l\'inscription.' });
    }
    setLoading(false);
  }

  return (
    <section className="newsletter-block">
      <div className="container">
        <div className="newsletter-block-inner">
          <div className="newsletter-block-text">
            <h2><i className="fas fa-envelope-open-text"></i> Restez informé</h2>
            <p>Inscrivez-vous à notre newsletter pour recevoir les dernières actualités, événements et opportunités de l'AECC directement dans votre boîte mail.</p>
          </div>
          <form onSubmit={handleSubmit} className="newsletter-block-form">
            <div className="newsletter-input-group">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Votre adresse email..."
                required
              />
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <i className="fas fa-spinner fa-spin"></i> : <><i className="fas fa-paper-plane"></i> S'inscrire</>}
              </button>
            </div>
            {status && (
              <div className={`newsletter-status ${status.type}`}>
                <i className={`fas fa-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i> {status.msg}
              </div>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
