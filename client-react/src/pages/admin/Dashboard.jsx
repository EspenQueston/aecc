import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';

const COLORS = ['#B7222D', '#0E7C42', '#2563eb', '#d97706', '#7c3aed', '#059669', '#dc2626', '#0891b2'];

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, blogs: 0, events: 0, resources: 0, contacts: 0, faqs: 0 });
  const [latestBlogs, setLatestBlogs] = useState([]);
  const [latestEvents, setLatestEvents] = useState([]);
  const [recentContacts, setRecentContacts] = useState([]);
  const [allBlogs, setAllBlogs] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [allResources, setAllResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  async function loadDashboard() {
    const [usersR, blogsR, eventsR, resourcesR, contactsR, faqR, allBlogsR, allEventsR, allResourcesR] = await Promise.allSettled([
      api.get('/users?limit=1'),
      api.get('/blogs?limit=5&order=DESC'),
      api.get('/events?limit=5'),
      api.get('/resources?limit=1'),
      api.get('/contact'),
      api.get('/faq'),
      api.get('/blogs?limit=100&order=DESC'),
      api.get('/events?limit=100'),
      api.get('/resources?limit=100')
    ]);

    setStats({
      users: usersR.status === 'fulfilled' ? (usersR.value.pagination?.total || 0) : 0,
      blogs: blogsR.status === 'fulfilled' ? (blogsR.value.pagination?.total || blogsR.value.total || 0) : 0,
      events: eventsR.status === 'fulfilled' ? (eventsR.value.pagination?.total || 0) : 0,
      resources: resourcesR.status === 'fulfilled' ? (resourcesR.value.pagination?.total || 0) : 0,
      contacts: contactsR.status === 'fulfilled' ? (contactsR.value.data || contactsR.value || []).length : 0,
      faqs: faqR.status === 'fulfilled' ? (faqR.value.data || []).length : 0,
    });

    if (blogsR.status === 'fulfilled') setLatestBlogs(blogsR.value.data || []);
    if (eventsR.status === 'fulfilled') setLatestEvents(eventsR.value.data || []);
    if (contactsR.status === 'fulfilled') setRecentContacts((contactsR.value.data || contactsR.value || []).slice(0, 5));
    if (allBlogsR.status === 'fulfilled') setAllBlogs(allBlogsR.value.data || []);
    if (allEventsR.status === 'fulfilled') setAllEvents(allEventsR.value.data || []);
    if (allResourcesR.status === 'fulfilled') setAllResources(allResourcesR.value.data || []);
    setLoading(false);
  }

  if (loading) return <div className="loading-spinner"><i className="fas fa-spinner fa-spin"></i> Chargement du tableau de bord...</div>;

  // Chart data: Blog categories distribution
  const blogCatMap = {};
  allBlogs.forEach(b => { const c = b.category || 'Autre'; blogCatMap[c] = (blogCatMap[c] || 0) + 1; });
  const blogCatData = Object.entries(blogCatMap).map(([name, value]) => ({ name, value }));

  // Chart data: Event types distribution
  const eventTypeMap = {};
  allEvents.forEach(e => { const t = e.type || 'general'; eventTypeMap[t] = (eventTypeMap[t] || 0) + 1; });
  const eventTypeData = Object.entries(eventTypeMap).map(([name, value]) => ({ name, value }));

  // Chart data: Resource categories
  const resCatMap = {};
  allResources.forEach(r => { const c = r.category || 'Autre'; resCatMap[c] = (resCatMap[c] || 0) + 1; });
  const resCatData = Object.entries(resCatMap).map(([name, value]) => ({ name, value }));

  // Chart data: Monthly content creation (last 6 months)
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    months.push({ label: d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' }), year: d.getFullYear(), month: d.getMonth() });
  }
  const monthlyData = months.map(m => ({
    name: m.label,
    Articles: allBlogs.filter(b => { const d = new Date(b.createdAt); return d.getFullYear() === m.year && d.getMonth() === m.month; }).length,
    Événements: allEvents.filter(e => { const d = new Date(e.startDate || e.createdAt); return d.getFullYear() === m.year && d.getMonth() === m.month; }).length,
  }));

  // Upcoming vs past events
  const now = new Date();
  const upcoming = allEvents.filter(e => new Date(e.startDate) > now).length;
  const past = allEvents.length - upcoming;

  const statCards = [
    { icon: 'fas fa-users', label: 'Utilisateurs', value: stats.users, color: '#3b82f6', link: '/admin/users', bg: 'rgba(59,130,246,0.08)' },
    { icon: 'fas fa-blog', label: 'Articles', value: stats.blogs, color: '#10b981', link: '/admin/blogs', bg: 'rgba(16,185,129,0.08)' },
    { icon: 'fas fa-calendar-alt', label: 'Événements', value: stats.events, color: '#f59e0b', link: '/admin/events', bg: 'rgba(245,158,11,0.08)' },
    { icon: 'fas fa-book', label: 'Ressources', value: stats.resources, color: '#8b5cf6', link: '/admin/resources', bg: 'rgba(139,92,246,0.08)' },
    { icon: 'fas fa-envelope', label: 'Messages', value: stats.contacts, color: '#ef4444', link: '/admin/contacts', bg: 'rgba(239,68,68,0.08)' },
    { icon: 'fas fa-question-circle', label: 'FAQ', value: stats.faqs, color: '#0891b2', link: '#', bg: 'rgba(8,145,178,0.08)' },
  ];

  return (
    <div className="dashboard">
      <div className="page-title-bar">
        <h1><i className="fas fa-chart-line"></i> Tableau de bord</h1>
        <span style={{ color: 'var(--text-light)', fontSize: '.9rem' }}>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
      </div>

      {/* Stat Cards */}
      <div className="dash-stats-grid">
        {statCards.map(s => (
          <Link to={s.link} key={s.label} className="dash-stat-card">
            <div className="dash-stat-icon" style={{ color: s.color, background: s.bg }}><i className={s.icon}></i></div>
            <div className="dash-stat-info">
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="dash-charts-row">
        <div className="dash-chart-card">
          <h3><i className="fas fa-chart-area"></i> Contenu créé (6 derniers mois)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthlyData}>
              <defs>
                <linearGradient id="colorArticles" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEvents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="Articles" stroke="#10b981" fillOpacity={1} fill="url(#colorArticles)" strokeWidth={2} />
              <Area type="monotone" dataKey="Événements" stroke="#f59e0b" fillOpacity={1} fill="url(#colorEvents)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="dash-chart-card">
          <h3><i className="fas fa-chart-pie"></i> Catégories d'articles</h3>
          {blogCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={blogCatData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fontSize={11}>
                  {blogCatData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{textAlign:'center',color:'var(--text-light)',padding:'3rem'}}>Aucune donnée</p>}
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="dash-charts-row">
        <div className="dash-chart-card">
          <h3><i className="fas fa-chart-bar"></i> Types d'événements</h3>
          {eventTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={eventTypeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" name="Événements" radius={[6, 6, 0, 0]}>
                  {eventTypeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : <p style={{textAlign:'center',color:'var(--text-light)',padding:'3rem'}}>Aucune donnée</p>}
        </div>
        <div className="dash-chart-card">
          <h3><i className="fas fa-chart-pie"></i> Ressources par catégorie</h3>
          {resCatData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={resCatData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} fontSize={11}>
                  {resCatData.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : <p style={{textAlign:'center',color:'var(--text-light)',padding:'3rem'}}>Aucune donnée</p>}
        </div>
      </div>

      {/* Quick Stats row */}
      <div className="dash-charts-row">
        <div className="dash-chart-card dash-mini">
          <div className="dash-mini-stat">
            <div className="dash-mini-icon" style={{background:'rgba(16,185,129,.1)',color:'#10b981'}}><i className="fas fa-calendar-check"></i></div>
            <div><h4>{upcoming}</h4><p>Événements à venir</p></div>
          </div>
          <div className="dash-mini-stat">
            <div className="dash-mini-icon" style={{background:'rgba(239,68,68,.1)',color:'#ef4444'}}><i className="fas fa-calendar-times"></i></div>
            <div><h4>{past}</h4><p>Événements passés</p></div>
          </div>
          <div className="dash-mini-stat">
            <div className="dash-mini-icon" style={{background:'rgba(139,92,246,.1)',color:'#8b5cf6'}}><i className="fas fa-file-alt"></i></div>
            <div><h4>{allBlogs.filter(b => b.status === 'draft').length}</h4><p>Brouillons</p></div>
          </div>
        </div>
      </div>

      {/* Tables */}
      <div className="dashboard-grid">
        <div className="dashboard-panel">
          <div className="panel-header"><h2><i className="fas fa-blog"></i> Derniers articles</h2><Link to="/admin/blogs" className="btn btn-ghost btn-sm">Voir tout</Link></div>
          <table className="admin-table">
            <thead><tr><th>Titre</th><th>Auteur</th><th>Vues</th><th>Date</th></tr></thead>
            <tbody>
              {latestBlogs.map(b => (
                <tr key={b._id}>
                  <td className="td-title">{b.title}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{b.author || 'AECC'}</td>
                  <td style={{textAlign:'center'}}>{b.views || 0}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{new Date(b.createdAt).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
              {latestBlogs.length === 0 && <tr><td colSpan="4" className="table-empty">Aucun article</td></tr>}
            </tbody>
          </table>
        </div>

        <div className="dashboard-panel">
          <div className="panel-header"><h2><i className="fas fa-calendar-alt"></i> Prochains événements</h2><Link to="/admin/events" className="btn btn-ghost btn-sm">Voir tout</Link></div>
          <table className="admin-table">
            <thead><tr><th>Titre</th><th>Date</th><th>Lieu</th></tr></thead>
            <tbody>
              {latestEvents.map(e => <tr key={e._id}><td>{e.title}</td><td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{new Date(e.startDate).toLocaleDateString('fr-FR')}</td><td>{e.location}</td></tr>)}
              {latestEvents.length === 0 && <tr><td colSpan="3" className="table-empty">Aucun événement</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {recentContacts.length > 0 && (
        <div className="dashboard-panel" style={{ marginTop: '1.5rem' }}>
          <div className="panel-header"><h2><i className="fas fa-envelope"></i> Messages récents</h2><Link to="/admin/contacts" className="btn btn-ghost btn-sm">Voir tout</Link></div>
          <table className="admin-table">
            <thead><tr><th>Nom</th><th>Sujet</th><th>Date</th><th>Statut</th></tr></thead>
            <tbody>
              {recentContacts.map(c => (
                <tr key={c._id}>
                  <td>{c.name}</td><td>{c.subject}</td>
                  <td style={{whiteSpace:'nowrap',fontSize:'.82rem'}}>{new Date(c.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td><span className={`status-badge status-${c.status || 'new'}`}>{c.status || 'nouveau'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
