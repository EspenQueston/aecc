import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import NewsletterBlock from '../../components/common/NewsletterBlock';
import PageHero from '../../components/common/PageHero';

const CATEGORY_LABELS = {
  general: 'Général',
  membership: 'Adhésion',
  scholarships: 'Bourses',
  events: 'Événements',
  academic: 'Académique',
  administrative: 'Administratif'
};

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [faqFilter, setFaqFilter] = useState('all');
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    api.get('/faq').then(res => setFaqs(res.data || [])).catch(() => {});
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contact', form);
      setStatus({ type: 'success', msg: 'Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.' });
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ type: 'error', msg: err.message || 'Erreur lors de l\'envoi du message.' });
    }
    setLoading(false);
  }

  return (
    <>
      <PageHero
        badge="Contact"
        title="Contactez-nous"
        subtitle="Nous sommes là pour répondre à toutes vos questions"
        icon="fas fa-envelope"
      />

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Info */}
            <div className="contact-info-panel">
              <h2>Nos Coordonnées</h2>
              <p className="contact-intro">N'hésitez pas à nous contacter par email, WeChat ou via le formulaire ci-contre. Nous répondons généralement sous 24-48h.</p>
              
              <div className="contact-info-cards">
                <a href="mailto:contact@aecc.org" className="contact-info-card contact-info-link">
                  <div className="contact-card-icon"><i className="fas fa-envelope"></i></div>
                  <div>
                    <h4>Email</h4>
                    <p>contact@aecc.org</p>
                    <p>cluivertmoukendi@gmail.com</p>
                  </div>
                  <i className="fas fa-chevron-right contact-card-chevron"></i>
                </a>
                <button type="button" className="contact-info-card contact-info-link" onClick={() => window.dispatchEvent(new Event('open-wechat-popup'))}>
                  <div className="contact-card-icon"><i className="fab fa-weixin"></i></div>
                  <div>
                    <h4>WeChat</h4>
                    <p>AECC_Official</p>
                    <p className="text-hint">Scannez notre QR code pour nous ajouter</p>
                  </div>
                  <i className="fas fa-chevron-right contact-card-chevron"></i>
                </button>
                <a href="tel:+8618506959673" className="contact-info-card contact-info-link">
                  <div className="contact-card-icon"><i className="fas fa-phone-alt"></i></div>
                  <div>
                    <h4>Téléphone</h4>
                    <p>+86 18506959673</p>
                    <p className="text-hint">Lun-Ven, 9h-18h (heure de Pékin)</p>
                  </div>
                  <i className="fas fa-chevron-right contact-card-chevron"></i>
                </a>
                <a href="https://maps.google.com/?q=Beijing,China" target="_blank" rel="noopener noreferrer" className="contact-info-card contact-info-link">
                  <div className="contact-card-icon"><i className="fas fa-map-marker-alt"></i></div>
                  <div>
                    <h4>Siège</h4>
                    <p>Beijing, République Populaire de Chine</p>
                    <p className="text-hint">Avec des représentants dans toute la Chine</p>
                  </div>
                  <i className="fas fa-chevron-right contact-card-chevron"></i>
                </a>
              </div>

              {/* Social Links */}
              <div className="contact-socials">
                <h4>Suivez-nous</h4>
                <div className="social-links">
                  <a href="https://www.facebook.com/profile.php?id=61560764129668" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
                  <a href="https://www.instagram.com/aecc242congochine/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
                  <button onClick={() => window.dispatchEvent(new Event('open-wechat-popup'))} className="social-link-btn" aria-label="WeChat"><i className="fab fa-weixin"></i></button>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-panel">
              <div className="card">
                <div className="card-body">
                  <h2><i className="fas fa-paper-plane"></i> Envoyez-nous un message</h2>
                  <p className="form-intro">Remplissez le formulaire ci-dessous et nous vous répondrons rapidement.</p>
                  
                  {status && (
                    <div className={`alert alert-${status.type}`}>
                      <i className={`fas fa-${status.type === 'success' ? 'check-circle' : 'exclamation-circle'}`}></i> {status.msg}
                    </div>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label><i className="fas fa-user"></i> Nom complet</label>
                        <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Votre nom complet" required />
                      </div>
                      <div className="form-group">
                        <label><i className="fas fa-envelope"></i> Email</label>
                        <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="votreemail@exemple.com" required />
                      </div>
                    </div>
                    <div className="form-group">
                      <label><i className="fas fa-tag"></i> Sujet</label>
                      <select value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} required>
                        <option value="">— Choisir un sujet —</option>
                        <option value="Question générale">Question générale</option>
                        <option value="Adhésion">Adhésion à l'AECC</option>
                        <option value="Bourses">Information sur les bourses</option>
                        <option value="Événements">Événements et activités</option>
                        <option value="Partenariat">Proposition de partenariat</option>
                        <option value="Assistance">Demande d'assistance</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label><i className="fas fa-comment-alt"></i> Message</label>
                      <textarea value={form.message} onChange={e => setForm({...form, message: e.target.value})} rows="6" placeholder="Décrivez votre demande en détail..." required></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
                      {loading ? <><i className="fas fa-spinner fa-spin"></i> Envoi en cours...</> : <><i className="fas fa-paper-plane"></i> Envoyer le message</>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">Localisation</span>
            <h2>Où nous trouver</h2>
            <p>L'AECC est présente dans les principales villes universitaires de Chine</p>
          </div>
          <div className="map-container">
            <iframe
              title="AECC Location - Beijing, China"
              src="https://www.openstreetmap.org/export/embed.html?bbox=116.2,39.8,116.5,40.0&layer=mapnik&marker=39.9042,116.4074"
              width="100%"
              height="400"
              style={{ border: 0, borderRadius: '12px' }}
              allowFullScreen=""
              loading="lazy"
            ></iframe>
          </div>
          <div className="map-cities">
            <h3><i className="fas fa-map-pin"></i> Villes avec représentants AECC</h3>
            <div className="cities-tags">
              {['Beijing', 'Shanghai', 'Guangzhou', 'Wuhan', 'Chengdu', 'Nanjing', 'Hangzhou', 'Xi\'an', 'Changsha', 'Shenyang', 'Harbin', 'Dalian'].map(city => (
                <span key={city} className="city-tag"><i className="fas fa-map-marker-alt"></i> {city}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FAQ</span>
            <h2>Questions Fréquentes</h2>
            <p>Trouvez rapidement des réponses à vos questions</p>
          </div>
          {faqs.length > 0 && (
            <div className="faq-filters">
              <button className={`faq-filter-btn ${faqFilter === 'all' ? 'active' : ''}`} onClick={() => setFaqFilter('all')}>Toutes</button>
              {[...new Set(faqs.map(f => f.category))].map(cat => (
                <button key={cat} className={`faq-filter-btn ${faqFilter === cat ? 'active' : ''}`} onClick={() => setFaqFilter(cat)}>{CATEGORY_LABELS[cat] || cat}</button>
              ))}
            </div>
          )}
          <div className="faq-accordion">
            {faqs.filter(f => faqFilter === 'all' || f.category === faqFilter).map((faq, i) => (
              <div key={faq._id || i} className={`faq-accordion-item ${openFaq === i ? 'open' : ''}`}>
                <button className="faq-accordion-header" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span><i className="fas fa-question-circle"></i> {faq.question}</span>
                  <i className={`fas fa-chevron-${openFaq === i ? 'up' : 'down'}`}></i>
                </button>
                <div className="faq-accordion-body">
                  <p>{faq.answer}</p>
                  <span className="faq-category-tag">{CATEGORY_LABELS[faq.category] || faq.category}</span>
                </div>
              </div>
            ))}
            {faqs.length === 0 && (
              <div className="faq-grid">
                <div className="faq-item">
                  <h3><i className="fas fa-question-circle"></i> Comment rejoindre l'AECC ?</h3>
                  <p>Créez un compte sur notre plateforme en remplissant le formulaire d'inscription. L'adhésion est gratuite et ouverte à tout étudiant congolais en Chine.</p>
                </div>
                <div className="faq-item">
                  <h3><i className="fas fa-question-circle"></i> Comment obtenir de l'aide pour une urgence ?</h3>
                  <p>Contactez-nous immédiatement via WeChat ou email. L'AECC dispose d'un fonds de solidarité pour aider les membres en situation d'urgence.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <NewsletterBlock />
    </>
  );
}
