import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';

/* ── Static team data (no DB) ─────────────────────────────── */
const TEAM_MEMBERS = [
  { slug: 'rinel', name: 'Rinel', role: 'Président', structure: 'Bureau Exécutif', bio: "Chargé de la coordination et de l'orientation de l'AECC. Représente l'association dans tous les actes de vie civile et veille au bon fonctionnement de toutes les structures.", tags: ['Direction', 'Coordination', 'Représentation'], color: '#B7222D', icon: 'fas fa-crown' },
  { slug: 'cleve', name: 'Cleve', role: 'Secrétaire Général', structure: 'Bureau Exécutif', bio: "Assure l'administration, la rédaction des procès-verbaux et la tenue des archives. Assure l'intérim du Président en cas d'absence.", tags: ['Administration', 'Archives', 'Procès-verbaux'], color: '#2563eb', icon: 'fas fa-file-alt' },
  { slug: 'mabiala', name: 'Roland Mabiala', role: 'Secrétaire Socio-culturel', structure: 'Bureau Exécutif', bio: "Doctorant à BFSU Beijing. Assure la mobilisation, la communication et l'accueil des étudiants. Organise les événements sociaux et culturels de l'AECC.", tags: ['Communication', 'Culture', 'Mobilisation'], color: '#7c3aed', icon: 'fas fa-bullhorn' },
  { slug: 'exauce', name: 'Exauce', role: 'Trésorier Général', structure: 'Bureau Exécutif', bio: "Gestionnaire des ressources financières et du patrimoine de l'AECC. Assure la transparence financière.", tags: ['Comptabilité', 'Gestion financière', 'Transparence'], color: '#d97706', icon: 'fas fa-wallet' },
  { slug: 'cluivert', name: 'Cluivert Moukendi', role: 'Responsable Technique', structure: 'Bureau Exécutif', bio: "Master en IA à Beihang University. Développeur fullstack passionné. Gère le site web, les réseaux sociaux et l'infrastructure de l'AECC.", tags: ['Développement web', 'Intelligence Artificielle', 'Infrastructure'], color: '#059669', icon: 'fas fa-cogs' },
  { slug: 'gloire', name: 'Gloire', role: 'Commissaire', structure: 'Commission de Contrôle', bio: "Veille à la bonne gestion des finances, au bon fonctionnement des instances et à l'exécution des activités de l'association.", tags: ['Contrôle', 'Audit', 'Statuts'], color: '#dc2626', icon: 'fas fa-gavel' },
  { slug: 'david', name: 'David', role: 'Rapporteur', structure: 'Commission de Contrôle', bio: "Rédige les rapports de la Commission, assiste le Commissaire dans ses fonctions et présente les conclusions à l'Assemblée Générale.", tags: ['Rédaction', 'Rapports', 'Assemblée Générale'], color: '#0891b2', icon: 'fas fa-pen-fancy' },
];

function searchTeam(q) {
  const lq = q.toLowerCase();
  return TEAM_MEMBERS.filter(m =>
    m.name.toLowerCase().includes(lq) ||
    m.role.toLowerCase().includes(lq) ||
    m.structure.toLowerCase().includes(lq) ||
    m.bio.toLowerCase().includes(lq) ||
    m.tags.some(t => t.toLowerCase().includes(lq))
  );
}

/* ── Highlight matching text ───────────────────────────────── */
function Hl({ text = '', q = '' }) {
  if (!q.trim() || !text) return <>{text}</>;
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
  return <>{parts.map((p, i) => p.toLowerCase() === q.toLowerCase() ? <mark key={i} className="sr-hl">{p}</mark> : p)}</>;
}

/* ── Filter tab config ─────────────────────────────────────── */
const TABS = [
  { key: 'all',       label: 'Tout',          icon: 'fas fa-th-large' },
  { key: 'blogs',     label: 'Articles',      icon: 'fas fa-newspaper',      color: '#B7222D' },
  { key: 'team',      label: 'Équipe',        icon: 'fas fa-users',          color: '#7c3aed' },
  { key: 'learning',  label: 'Apprentissage', icon: 'fas fa-graduation-cap', color: '#2563eb' },
  { key: 'events',    label: 'Événements',    icon: 'fas fa-calendar-alt',   color: '#d97706' },
  { key: 'resources', label: 'Ressources',    icon: 'fas fa-book',           color: '#059669' },
];

const LEARNING_TYPE_LABELS = { formation: 'Formation', youtube: 'YouTube', 'useful-link': 'Lien utile', telegram: 'Telegram' };
const LEARNING_TYPE_ICONS  = { formation: 'fas fa-graduation-cap', youtube: 'fab fa-youtube', 'useful-link': 'fas fa-link', telegram: 'fab fa-telegram-plane' };

/* ── Result cards ──────────────────────────────────────────── */
function BlogCard({ item, q }) {
  return (
    <Link to={`/blogs/${item._id}`} className="sr-card sr-card--blog">
      <div className="sr-card-icon" style={{ background: 'rgba(183,34,45,.1)', color: '#B7222D' }}><i className="fas fa-newspaper"></i></div>
      <div className="sr-card-body">
        <span className="sr-type-badge" style={{ background: 'rgba(183,34,45,.08)', color: '#B7222D' }}><i className="fas fa-newspaper"></i> Article</span>
        <h3><Hl text={item.title} q={q} /></h3>
        <p><Hl text={item.excerpt?.substring(0, 130)} q={q} />{item.excerpt?.length > 130 ? '…' : ''}</p>
        {item.createdAt && <span className="sr-meta"><i className="fas fa-calendar"></i> {new Date(item.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>}
      </div>
      <i className="fas fa-arrow-right sr-card-arrow"></i>
    </Link>
  );
}

function TeamCard({ member, q }) {
  const initials = member.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  return (
    <Link to={`/equipe/${member.slug}`} className="sr-card sr-card--team">
      <div className="sr-card-avatar" style={{ background: `linear-gradient(135deg,${member.color}cc,${member.color})` }}>{initials}</div>
      <div className="sr-card-body">
        <span className="sr-type-badge" style={{ background: `${member.color}14`, color: member.color }}><i className={member.icon}></i> {member.structure}</span>
        <h3><Hl text={member.name} q={q} /></h3>
        <p className="sr-role"><Hl text={member.role} q={q} /></p>
        <p><Hl text={member.bio.substring(0, 110)} q={q} />…</p>
        <div className="sr-tags">{member.tags.map((t, i) => <span key={i} className="sr-tag">{t}</span>)}</div>
      </div>
      <i className="fas fa-arrow-right sr-card-arrow"></i>
    </Link>
  );
}

function LearningCard({ item, q }) {
  const ltype = item.type === 'telegram' ? 'telegram' : item.type;
  const icon = LEARNING_TYPE_ICONS[ltype] || 'fas fa-graduation-cap';
  const label = LEARNING_TYPE_LABELS[ltype] || 'Ressource';
  const color = item.color || '#2563eb';
  const href = item.type === 'telegram' ? item.url : (item.slug ? `/learning/resource/${item.slug}` : item.url);
  const isExternal = item.type === 'telegram' || item.type === 'useful-link' || item.type === 'youtube';
  const CardTag = isExternal ? 'a' : Link;
  const cardProps = isExternal ? { href, target: '_blank', rel: 'noopener noreferrer' } : { to: href };
  return (
    <CardTag {...cardProps} className="sr-card sr-card--learning">
      <div className="sr-card-icon" style={{ background: `${color}18`, color }}><i className={icon}></i></div>
      <div className="sr-card-body">
        <span className="sr-type-badge" style={{ background: `${color}14`, color }}><i className={icon}></i> {label}</span>
        <h3><Hl text={item.title || item.name} q={q} /></h3>
        <p><Hl text={(item.description || '').substring(0, 130)} q={q} />{(item.description || '').length > 130 ? '…' : ''}</p>
        {item.level && item.level !== '' && <span className="sr-meta"><i className="fas fa-signal"></i> {item.level}</span>}
      </div>
      <i className={`fas fa-${isExternal ? 'external-link-alt' : 'arrow-right'} sr-card-arrow`}></i>
    </CardTag>
  );
}

function EventCard({ item, q }) {
  return (
    <Link to={`/events/${item._id}`} className="sr-card sr-card--event">
      <div className="sr-card-icon" style={{ background: 'rgba(217,119,6,.1)', color: '#d97706' }}><i className="fas fa-calendar-alt"></i></div>
      <div className="sr-card-body">
        <span className="sr-type-badge" style={{ background: 'rgba(217,119,6,.08)', color: '#d97706' }}><i className="fas fa-calendar-alt"></i> Événement</span>
        <h3><Hl text={item.title} q={q} /></h3>
        <p><Hl text={(item.description || '').substring(0, 130)} q={q} />{(item.description || '').length > 130 ? '…' : ''}</p>
        <div className="sr-meta-row">
          {item.startDate && <span className="sr-meta"><i className="fas fa-clock"></i> {new Date(item.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
          {item.location && <span className="sr-meta"><i className="fas fa-map-marker-alt"></i> {item.location}</span>}
        </div>
      </div>
      <i className="fas fa-arrow-right sr-card-arrow"></i>
    </Link>
  );
}

function ResourceCard({ item, q }) {
  return (
    <div className="sr-card sr-card--resource">
      <div className="sr-card-icon" style={{ background: 'rgba(5,150,105,.1)', color: '#059669' }}><i className="fas fa-book"></i></div>
      <div className="sr-card-body">
        <span className="sr-type-badge" style={{ background: 'rgba(5,150,105,.08)', color: '#059669' }}><i className="fas fa-book"></i> Ressource</span>
        <h3><Hl text={item.title} q={q} /></h3>
        <p><Hl text={(item.description || '').substring(0, 130)} q={q} />{(item.description || '').length > 130 ? '…' : ''}</p>
        {item.category && <span className="sr-meta"><i className="fas fa-tag"></i> {item.category}</span>}
      </div>
    </div>
  );
}

/* ── Section block ─────────────────────────────────────────── */
function Section({ title, icon, color, count, children }) {
  return (
    <div className="sr-section">
      <div className="sr-section-head" style={{ borderColor: color }}>
        <span className="sr-section-icon" style={{ background: `${color}15`, color }}><i className={icon}></i></span>
        <h2>{title}</h2>
        <span className="sr-section-count" style={{ background: `${color}12`, color }}>{count}</span>
      </div>
      <div className="sr-cards">{children}</div>
    </div>
  );
}

/* ── Empty state ───────────────────────────────────────────── */
function Empty({ query }) {
  return (
    <div className="sr-empty">
      <div className="sr-empty-icon"><i className="fas fa-search"></i></div>
      <h3>Aucun résultat pour « {query} »</h3>
      <p>Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
      <div className="sr-empty-suggestions">
        <span>Suggestions :</span>
        {['HSK', 'bourse', 'événement', 'Cluivert', 'Telegram'].map(s => (
          <Link key={s} to={`/search?q=${s}`} className="sr-suggestion">{s}</Link>
        ))}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────── */
export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [inputVal, setInputVal] = useState(searchParams.get('q') || '');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(null);
  const inputRef = useRef(null);

  const q = searchParams.get('q') || '';

  const doSearch = useCallback(async (query) => {
    if (!query || query.trim().length < 2) return;
    setLoading(true);
    setElapsed(null);
    const t0 = performance.now();
    try {
      const data = await api.get(`/search?q=${encodeURIComponent(query.trim())}&limit=20`);
      const teamData = searchTeam(query.trim());
      const blogs     = data.results?.blogs?.data     || [];
      const events    = data.results?.events?.data    || [];
      const resources = data.results?.resources?.data || [];
      const learning  = data.results?.learning?.data  || [];
      setResults({
        blogs, events, resources, learning,
        team: teamData,
        totalResults: blogs.length + events.length + resources.length + learning.length + teamData.length
      });
      setElapsed(((performance.now() - t0) / 1000).toFixed(2));
    } catch {
      const teamData = searchTeam(query.trim());
      setResults({ blogs: [], events: [], resources: [], learning: [], team: teamData, totalResults: teamData.length });
      setElapsed(((performance.now() - t0) / 1000).toFixed(2));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (q) { setInputVal(q); doSearch(q); setActiveTab('all'); }
  }, [q, doSearch]);

  function handleSubmit(e) {
    e.preventDefault();
    const v = inputVal.trim();
    if (v) navigate(`/search?q=${encodeURIComponent(v)}`);
  }

  // Count per tab
  const counts = results ? {
    all:       results.totalResults,
    blogs:     results.blogs.length,
    team:      results.team.length,
    learning:  results.learning.length,
    events:    results.events.length,
    resources: results.resources.length,
  } : {};

  // Visible items
  const show = {
    blogs:     activeTab === 'all' || activeTab === 'blogs',
    team:      activeTab === 'all' || activeTab === 'team',
    learning:  activeTab === 'all' || activeTab === 'learning',
    events:    activeTab === 'all' || activeTab === 'events',
    resources: activeTab === 'all' || activeTab === 'resources',
  };

  const hasAny = results && (
    results.blogs.length > 0 || results.team.length > 0 ||
    results.learning.length > 0 || results.events.length > 0 || results.resources.length > 0
  );

  return (
    <div className="sr-page">
      {/* ── Hero search bar ── */}
      <div className="sr-hero">
        <div className="container">
          <h1 className="sr-title">
            {q ? <>Résultats pour <span>«&nbsp;{q}&nbsp;»</span></> : 'Recherche'}
          </h1>
          <form onSubmit={handleSubmit} className="sr-form">
            <div className="sr-input-wrap">
              <i className="fas fa-search sr-form-icon"></i>
              <input
                ref={inputRef}
                type="text"
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                placeholder="Rechercher un article, membre, formation, événement..."
                className="sr-input"
                autoComplete="off"
              />
              {inputVal && (
                <button type="button" className="sr-clear" onClick={() => { setInputVal(''); inputRef.current?.focus(); }}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <button type="submit" className="btn btn-primary sr-btn" disabled={loading}>
              {loading ? <><i className="fas fa-spinner fa-spin"></i> Recherche...</> : <><i className="fas fa-search"></i> Rechercher</>}
            </button>
          </form>
          {results && (
            <p className="sr-meta-line">
              <strong>{results.totalResults}</strong> résultat{results.totalResults !== 1 ? 's' : ''} trouvé{results.totalResults !== 1 ? 's' : ''}
              {elapsed && <> en <strong>{elapsed}s</strong></>}
            </p>
          )}
        </div>
      </div>

      <div className="container sr-body">
        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="sr-skeletons">
            {[1,2,3].map(i => <div key={i} className="sr-skeleton"><div className="sr-sk-icon"></div><div className="sr-sk-lines"><div></div><div></div></div></div>)}
          </div>
        )}

        {/* ── Filter tabs ── */}
        {!loading && results && (
          <div className="sr-tabs">
            {TABS.map(tab => (
              <button
                key={tab.key}
                className={`sr-tab${activeTab === tab.key ? ' sr-tab--active' : ''}`}
                style={activeTab === tab.key && tab.color ? { '--tab-color': tab.color } : {}}
                onClick={() => setActiveTab(tab.key)}
              >
                <i className={tab.icon}></i>
                <span>{tab.label}</span>
                {counts[tab.key] > 0 && <span className="sr-tab-count">{counts[tab.key]}</span>}
              </button>
            ))}
          </div>
        )}

        {/* ── Results ── */}
        {!loading && results && hasAny && (
          <div className="sr-results">
            {show.blogs && results.blogs.length > 0 && (
              <Section title="Articles de blog" icon="fas fa-newspaper" color="#B7222D" count={results.blogs.length}>
                {results.blogs.map(b => <BlogCard key={b._id} item={b} q={q} />)}
              </Section>
            )}
            {show.team && results.team.length > 0 && (
              <Section title="Membres de l'équipe" icon="fas fa-users" color="#7c3aed" count={results.team.length}>
                {results.team.map(m => <TeamCard key={m.slug} member={m} q={q} />)}
              </Section>
            )}
            {show.learning && results.learning.length > 0 && (
              <Section title="Apprentissage & Canaux" icon="fas fa-graduation-cap" color="#2563eb" count={results.learning.length}>
                {results.learning.map((l, i) => <LearningCard key={l._id || l.id || i} item={l} q={q} />)}
              </Section>
            )}
            {show.events && results.events.length > 0 && (
              <Section title="Événements" icon="fas fa-calendar-alt" color="#d97706" count={results.events.length}>
                {results.events.map(e => <EventCard key={e._id} item={e} q={q} />)}
              </Section>
            )}
            {show.resources && results.resources.length > 0 && (
              <Section title="Ressources" icon="fas fa-book" color="#059669" count={results.resources.length}>
                {results.resources.map(r => <ResourceCard key={r._id} item={r} q={q} />)}
              </Section>
            )}
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && results && !hasAny && q && <Empty query={q} />}

        {/* ── Initial state ── */}
        {!loading && !results && (
          <div className="sr-initial">
            <i className="fas fa-search sr-initial-icon"></i>
            <h3>Que recherchez-vous ?</h3>
            <p>Entrez vos mots-clés pour explorer les articles, membres, formations et événements.</p>
            <div className="sr-quick-links">
              <p>Recherches populaires :</p>
              <div className="sr-suggestions">
                {['HSK', 'bourse CSC', 'événement Beijing', 'Python', 'Cluivert', 'Telegram'].map(s => (
                  <button key={s} className="sr-suggestion" onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}>
                    <i className="fas fa-search"></i> {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
