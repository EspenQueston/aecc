import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { useState, useEffect } from 'react';
import ChatWidget from '../common/ChatWidget';
import ScrollWidget from '../common/ScrollWidget';

export default function PublicLayout() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nlEmail, setNlEmail] = useState('');
  const [nlStatus, setNlStatus] = useState(null);
  const [showWechat, setShowWechat] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setShowWechat(true);
    window.addEventListener('open-wechat-popup', handler);
    return () => window.removeEventListener('open-wechat-popup', handler);
  }, []);

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

            <button className={`mobile-menu-btn${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <span className="mhb-bar" />
              <span className="mhb-bar" />
              <span className="mhb-bar" />
            </button>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer${menuOpen ? ' open' : ''}`} onClick={e => { if (e.target.classList.contains('mobile-drawer-overlay')) setMenuOpen(false); }}>
        <div className="mobile-drawer-overlay" />
        <div className="mobile-drawer-panel">
          <div className="mobile-drawer-header">
            <Link to="/" className="mobile-drawer-logo" onClick={() => setMenuOpen(false)}>
              <div className="logo-upload-frame">
                <img src="/logo.png" alt="AECC" onError={e => { e.target.style.display = 'none'; }} />
              </div>
              <span>AECC</span>
            </Link>
            <button className="mobile-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Fermer">
              <i className="fas fa-times"></i>
            </button>
          </div>
          <nav className="mobile-drawer-nav">
            <NavLink to="/" end className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-home"></i></span>
              <span className="mdr-text">Accueil</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/about" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-info-circle"></i></span>
              <span className="mdr-text">À propos</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/blogs" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-newspaper"></i></span>
              <span className="mdr-text">Blog</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/resources" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-book"></i></span>
              <span className="mdr-text">Ressources</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/events" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-calendar-alt"></i></span>
              <span className="mdr-text">Événements</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/learning" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-graduation-cap"></i></span>
              <span className="mdr-text">Apprentissage</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
            <NavLink to="/contact" className="mobile-drawer-link" onClick={() => setMenuOpen(false)}>
              <span className="mdr-icon"><i className="fas fa-envelope"></i></span>
              <span className="mdr-text">Contact</span>
              <i className="fas fa-chevron-right mdr-arrow"></i>
            </NavLink>
          </nav>
          <div className="mobile-drawer-footer">
            {user ? (
              <>
                <Link to="/profile" className="mobile-drawer-auth-btn" onClick={() => setMenuOpen(false)}>
                  <i className="fas fa-user-circle"></i> {user.firstName}
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="mobile-drawer-auth-btn mobile-drawer-admin-btn" onClick={() => setMenuOpen(false)}>
                    <i className="fas fa-cog"></i> Admin
                  </Link>
                )}
                <button onClick={() => { logout(); setMenuOpen(false); }} className="mobile-drawer-logout-btn">
                  <i className="fas fa-sign-out-alt"></i> Déconnexion
                </button>
              </>
            ) : (
              <Link to="/register" className="mobile-drawer-auth-btn" onClick={() => setMenuOpen(false)}>
                <i className="fas fa-sign-in-alt"></i> Connexion / Inscription
              </Link>
            )}
          </div>
        </div>
      </div>

      <main>
        <Outlet />
      </main>

      <footer className="main-footer">
        <div className="footer-top-bar" />
        <div className="container">
          <div className="footer-grid">

            {/* Brand column */}
            <div className="footer-brand">
              <div className="footer-brand-logo">
                <span className="footer-logo-frame">
                  <img src="/logo.png" alt="AECC" onError={e => e.target.style.display = 'none'} />
                </span>
                <span>AECC</span>
              </div>
              <p>Association des Étudiants Congolais en Chine — Créée le 1er Août 2000 à Pékin. Devise : Unité – Travail – Réussite.</p>
              {nlStatus && <p style={{ fontSize: '.82rem', color: nlStatus.type === 'success' ? '#10b981' : '#ef4444' }}>{nlStatus.msg}</p>}
              <form onSubmit={handleNewsletter} className="newsletter-form" style={{ marginBottom: '1.2rem' }}>
                <input type="email" placeholder="Votre email…" value={nlEmail} onChange={e => setNlEmail(e.target.value)} required />
                <button type="submit" className="btn btn-primary btn-sm">
                  <i className="fas fa-paper-plane"></i>
                </button>
              </form>
              <ul className="social-links">
                <li>
                  <button onClick={() => setShowWechat(true)} className="social-link-btn" aria-label="WeChat">
                    <i className="fab fa-weixin"></i>
                  </button>
                </li>
                <li>
                  <a href="https://www.facebook.com/profile.php?id=61560764129668" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <i className="fab fa-facebook"></i>
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/aecc242congochine/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <i className="fab fa-instagram"></i>
                  </a>
                </li>
              </ul>
            </div>

            {/* Navigation column */}
            <div className="footer-links">
              <p className="footer-col-title">Navigation</p>
              <ul>
                <li><Link to="/about">À propos</Link></li>
                <li><Link to="/events">Événements</Link></li>
                <li><Link to="/resources">Ressources</Link></li>
                <li><Link to="/blogs">Blog</Link></li>
                <li><Link to="/contact">Contact</Link></li>
              </ul>
            </div>

            {/* Discover column */}
            <div className="footer-links">
              <p className="footer-col-title">Découvrir</p>
              <ul>
                <li><Link to="/bourses">Bourses d'Études</Link></li>
                <li><Link to="/activites">Activités Sociales</Link></li>
                <li><Link to="/relations">Relations Sino-Congolaises</Link></li>
                <li><Link to="/learning">Apprentissage</Link></li>
                <li><Link to="/register">Rejoindre l'AECC</Link></li>
              </ul>
            </div>

            {/* Contact column */}
            <div className="footer-contact-col">
              <p className="footer-col-title">Contactez-nous</p>
              <ul className="footer-contact-list">
                <li>
                  <a href="mailto:aecc242@gmail.com" className="footer-contact-item">
                    <i className="fas fa-envelope" style={{ color: 'var(--primary-light)' }}></i>
                    <span>aecc242@gmail.com</span>
                  </a>
                </li>
                <li>
                  <button onClick={() => setShowWechat(true)} className="footer-contact-item footer-contact-btn">
                    <i className="fab fa-weixin" style={{ color: '#07C160' }}></i>
                    <span>WeChat: 18506959673</span>
                  </button>
                </li>
                <li className="footer-contact-item footer-address-item">
                  <i className="fas fa-map-marker-alt" style={{ color: 'var(--primary-light)' }}></i>
                  <address>Beijing, République Populaire de Chine</address>
                </li>
              </ul>
            </div>

          </div>

          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} AECC — Association des Étudiants Congolais en Chine. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      <ChatWidget />
      <ScrollWidget />

      {showWechat && (
        <div className="wechat-modal-overlay" onClick={() => { setShowWechat(false); setWechatCopied(false); }}>
          <div className="wechat-modal" onClick={e => e.stopPropagation()}>
            <button className="wechat-modal-close" onClick={() => { setShowWechat(false); setWechatCopied(false); }}><i className="fas fa-times"></i></button>
            <div className="wechat-modal-icon"><i className="fab fa-wechat"></i></div>
            <h3>WeChat ID</h3>
            <p className="wechat-id">18506959673</p>
            <button className="wechat-copy-btn" onClick={() => { navigator.clipboard.writeText('18506959673'); setWechatCopied(true); setTimeout(() => setWechatCopied(false), 2000); }}>
              <i className={`fas fa-${wechatCopied ? 'check' : 'copy'}`}></i> {wechatCopied ? 'Copié !' : 'Copier l\'ID'}
            </button>
            <p className="wechat-hint">Scannez ou ajoutez cet ID sur WeChat pour nous contacter</p>
          </div>
        </div>
      )}
    </>
  );
}
