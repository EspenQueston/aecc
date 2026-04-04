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
      {/* Reading progress bar */}
      <div className="blog-progress-bar" style={{ width: `${progress}%` }} />

      <article className="blog-detail-wrapper" ref={articleRef}>
        {/* Hero banner */}
        {img && (
          <div className="blog-detail-hero">
            <img src={img} alt={blog.title} />
            <div className="blog-detail-hero-overlay">
              <div className="container">
                <Link to="/blogs" className="back-link"><i className="fas fa-arrow-left"></i> Retour au blog</Link>
              </div>
            </div>
          </div>
        )}

        <div className="container" style={{ maxWidth: 780 }}>
          {!img && (
            <div style={{ paddingTop: '2rem' }}>
              <Link to="/blogs" className="btn btn-ghost btn-sm"><i className="fas fa-arrow-left"></i> Retour au blog</Link>
            </div>
          )}

          {/* Article header */}
          <header className="blog-detail-header">
            <span className="card-category">{blog.category || 'Article'}</span>
            <h1>{blog.title}</h1>
            <div className="blog-detail-meta">
              <span><i className="fas fa-user-circle"></i> {blog.author || 'AECC'}</span>
              <span><i className="fas fa-calendar-alt"></i> {new Date(blog.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              <span><i className="fas fa-clock"></i> {readInfo.minutes} min de lecture</span>
              <span><i className="fas fa-eye"></i> {blog.views || 0} vues</span>
            </div>
          </header>

          {/* Article body */}
          <div className="blog-detail-body">
            {htmlContent ? (
              <div dangerouslySetInnerHTML={{ __html: blog.content }} />
            ) : (
              blog.content.split('\n').map((para, i) =>
                para.trim() ? <p key={i}>{para}</p> : null
              )
            )}
          </div>

          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="blog-detail-tags">
              {blog.tags.map((t, i) => <span key={i} className="tag"><i className="fas fa-hashtag"></i> {t.term_id?.name || t}</span>)}
            </div>
          )}

          {/* Footer */}
          <div className="blog-detail-footer">
            <div className="blog-detail-footer-info">
              <span><i className="fas fa-align-left"></i> {readInfo.words.toLocaleString('fr-FR')} mots</span>
              <span><i className="fas fa-clock"></i> ~{readInfo.minutes} min</span>
            </div>
            <Link to="/blogs" className="btn btn-primary btn-sm"><i className="fas fa-arrow-left"></i> Tous les articles</Link>
          </div>
        </div>
      </article>
    </>
  );
}
