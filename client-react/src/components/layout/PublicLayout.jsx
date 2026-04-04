import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useState } from 'react';
import ChatWidget from '../common/ChatWidget';
import ScrollWidget from '../common/ScrollWidget';

export default function PublicLayout() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(null);
  const navigate = useNavigate();

  function handleSearch(e) {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setMenuOpen(false);
    }
  }

  async function handleNewsletter(e) {
    e.preventDefault();
    if (!nlEmail.trim()) return;
    try {
      await api.post('/newsletter/subscribe', { email: nlEmail.trim() });
      setNlStatus({ type: 'success', msg: 'Inscrit avec succès !' });
      setNlEmail('');
      setTimeout(() => setNlStatus(null), 4000);
    } catch (err) {
      setNlStatus({ type: 'error', msg: err.message || 'Erreur' });
      setTimeout(() => setNlStatus(null), 4000);
    }
  }

  return (
    <>
      <header className="main-header">
        <div className="container">
          <nav className="main-nav">
            <Link to="/" className="logo">
              <div className="logo-upload-frame">
                <img src="/logo.png" alt="AECC" onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} />
                <i className="fas fa-camera logo-placeholder-icon" style={{ display: 'none' }}></i>
              </div>
              <span className="logo-text">AECC</span>
            </Link>

            <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
              <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Accueil</NavLink></li>
              <li><NavLink to="/about" onClick={() => setMenuOpen(false)}>À propos</NavLink></li>
              <li><NavLink to="/blogs" onClick={() => setMenuOpen(false)}>Blog</NavLink></li>
              <li><NavLink to="/resources" onClick={() => setMenuOpen(false)}>Ressources</NavLink></li>
              <li><NavLink to="/events" onClick={() => setMenuOpen(false)}>Événements</NavLink></li>
              <li><NavLink to="/learning" onClick={() => setMenuOpen(false)}>Apprentissage</NavLink></li>
              <li><NavLink to="/contact" onClick={() => setMenuOpen(false)}>Contact</NavLink></li>
            </ul>

            <div className="nav-actions">
              <form onSubmit={handleSearch} className="nav-search">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <button type="submit"><i className="fas fa-search"></i></button>
              </form>

              {user ? (
                <div className="nav-user">
                  <Link to="/profile" className="btn btn-ghost btn-sm">
                    <i className="fas fa-user"></i> {user.firstName}
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="btn btn-ghost btn-sm">
                      <i className="fas fa-cog"></i>
                    </Link>
                  )}
                  <button onClick={logout} className="btn btn-outline btn-sm">Déconnexion</button>
                </div>
              ) : (
                <div className="nav-user">
                  <Link to="/register" className="btn btn-primary btn-sm">
                    <i className="fas fa-sign-in-alt"></i> Connexion
                  </Link>
                </div>
              )}
            </div>

            <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
              <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h3><span className="footer-logo-frame"><img src="/logo.png" alt="AECC" onError={e => e.target.style.display='none'} /></span> AECC</h3>
              <p>Association des Étudiants Congolais en Chine — Créée le 1er Août 2000 à Pékin. Devise : Unité – Travail – Réussite.</p>
              <div className="social-links">
                <a href="#" aria-label="WeChat"><i className="fab fa-wechat"></i></a>
                <a href="#" aria-label="WhatsApp"><i className="fab fa-whatsapp"></i></a>
                <a href="#" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              </div>
            </div>
            <div className="footer-links">
              <h4>Navigation</h4>
              <ul>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/events">Événements</Link></li>
                <li><Link to="/resources">Ressources</Link></li>
                <li><Link to="/blogs">Blog</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Découvrir</h4>
              <ul>
                <li><Link to="/bourses">Bourses d'Études</Link></li>
                <li><Link to="/activites">Activités Sociales</Link></li>
                <li><Link to="/relations">Relations Sino-Congolaises</Link></li>
                <li><Link to="/learning">Domaines d'Apprentissage</Link></li>
              </ul>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <ul>
                <li><Link to="/contact">Contact & FAQ</Link></li>
                <li><Link to="/register">S'inscrire</Link></li>
              </ul>
            </div>
            <div className="footer-newsletter">
              <h4>Newsletter</h4>
              <p>Recevez nos dernières actualités</p>
              {nlStatus && <p style={{ fontSize: '.82rem', color: nlStatus.type === 'success' ? '#10b981' : '#ef4444' }}>{nlStatus.msg}</p>}
              <form onSubmit={handleNewsletter} className="newsletter-form">
                <input type="email" placeholder="Votre email" value={nlEmail} onChange={e => setNlEmail(e.target.value)} required />
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AECC — Association des Étudiants Congolais en Chine. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <ChatWidget />
      <ScrollWidget />
    </>
  );
}
