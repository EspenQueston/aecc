import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';

function stripHtml(html) {
  const doc = new DOMParser().parseFromString(html || '', 'text/html');
  return doc.body.textContent || '';
}

function estimateReadingTime(text) {
  // Average adult reading speed: 238 words per minute (Brysbaert, 2019)
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 238));
  return { words, minutes };
}

function isHtmlContent(content) {
  return /<[a-z][\s\S]*>/i.test(content);
}

export default function BlogDetails() {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showWechat, setShowWechat] = useState(false);
  const [wechatCopied, setWechatCopied] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    loadBlog();
    api.post(`/blogs/${id}/view`, {}).catch(() => {});
  }, [id]);

  // Reading progress bar
  useEffect(() => {
    function onScroll() {
      if (!articleRef.current) return;
      const rect = articleRef.current.getBoundingClientRect();
      const articleTop = articleRef.current.offsetTop;
      const articleHeight = articleRef.current.offsetHeight;
      const scrolled = window.scrollY - articleTop;
      const total = articleHeight - window.innerHeight;
      const pct = total > 0 ? Math.min(100, Math.max(0, (scrolled / total) * 100)) : 0;
      setProgress(pct);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [blog]);

  async function loadBlog() {
    try {
      const data = await api.get(`/blogs/${id}`);
      setBlog(data.data || data);
    } catch { setBlog(null); }
    setLoading(false);
  }

  const readInfo = useMemo(() => {
    if (!blog?.content) return { words: 0, minutes: 1 };
    const plainText = isHtmlContent(blog.content) ? stripHtml(blog.content) : blog.content;
    return estimateReadingTime(plainText);
  }, [blog?.content]);

  if (loading) return <div className="loading-spinner container" style={{padding:'6rem 0'}}><i className="fas fa-spinner fa-spin"></i></div>;
  if (!blog) return <div className="container section"><div className="empty-state-card"><i className="fas fa-exclamation-triangle"></i><h3>Article non trouvé</h3><p>Cet article n'existe pas ou a été supprimé.</p><Link to="/blogs" className="btn btn-primary">Retour au blog</Link></div></div>;

  const img = blog.featuredImage && blog.featuredImage !== 'no-image.jpg' ? blog.featuredImage : null;
  const htmlContent = isHtmlContent(blog.content);

  return (
    <>
      <div className="blog-progress-bar" style={{ width: `${progress}%` }} />

      <div className="bd-page">
        <div className="container bd-container">
          <Link to="/blogs" className="bd-back"><i className="fas fa-arrow-left"></i> Retour aux articles</Link>

          <article ref={articleRef} className="bd-article">
            <header className="bd-header">
              <span className="bd-category">{blog.category || 'Article'}</span>
              <h1 className="bd-title">{blog.title}</h1>

              <div className="bd-meta">
                <div className="bd-author">
                  <div className="bd-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="bd-author-info">
                    <strong>{blog.author || 'Équipe AECC'}</strong>
                    <span>{new Date(blog.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })} • {readInfo.minutes} min de lecture</span>
                  </div>
                </div>
                <div className="bd-stats">
                  <span title="Vues"><i className="fas fa-eye"></i> {blog.views || 0}</span>
                </div>
              </div>

              {img && (
                <figure className="bd-featured">
                  <img src={img} alt={blog.title} />
                  <div className="bd-featured-overlay" />
                </figure>
              )}
            </header>

            <div className="bd-layout">
              <main className="bd-content bd-content--full">
                {htmlContent ? (
                  <div className="bd-html" dangerouslySetInnerHTML={{ __html: blog.content }} />
                ) : (
                  <div className="bd-html">
                    {blog.content.split('\n').map((para, i) =>
                      para.trim() ? <p key={i}>{para}</p> : null
                    )}
                  </div>
                )}

                {blog.tags && blog.tags.length > 0 && (
                  <div className="bd-tags">
                    <i className="fas fa-tags"></i>
                    {blog.tags.map((t, i) => <span key={i} className="bd-tag">{t.term_id?.name || t}</span>)}
                  </div>
                )}

                <div className="bd-author-box">
                  <div className="bd-author-box-avatar">
                    <i className="fas fa-bullhorn"></i>
                  </div>
                  <div className="bd-author-box-info">
                    <h4>{blog.author || 'Équipe AECC'}</h4>
                    <p>L'Association des Étudiants Congolais en Chine a pour mission de rassembler, d'orienter et de soutenir la communauté étudiante congolaise en Chine.</p>
                    <div className="bd-author-socials">
                      <button onClick={() => setShowWechat(true)}><i className="fab fa-weixin"></i> WeChat</button>
                      <a href="https://www.facebook.com/profile.php?id=61560764129668" target="_blank" rel="noopener noreferrer"><i className="fab fa-facebook"></i> Facebook</a>
                      <a href="https://www.instagram.com/aecc242congochine/" target="_blank" rel="noopener noreferrer"><i className="fab fa-instagram"></i> Instagram</a>
                    </div>
                  </div>
                </div>

                <div className="bd-footer">
                  <Link to="/blogs" className="btn btn-outline"><i className="fas fa-arrow-left"></i> Explorer d'autres articles</Link>
                </div>
              </main>
            </div>
          </article>
        </div>
      </div>

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
          </div>
        </div>
      )}
    </>
  );
}
