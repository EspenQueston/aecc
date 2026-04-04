import { useState, useEffect, useRef, useMemo } from 'react';
import { api } from '../../services/api';
import { useToast, useConfirm } from '../../components/common/ConfirmToast';

export default function AdminContacts() {
  const [activeTab, setActiveTab] = useState('messages');

  return (
    <div className="admin-page gm-mail-app">
      {/* Top bar */}
      <div className="gm-topbar">
        <div className="gm-topbar-left">
          <div className="gm-logo-wrap">
            <i className="fas fa-envelope-open-text"></i>
            <span>Messagerie AECC</span>
          </div>
        </div>
        <div className="gm-topbar-tabs">
          <button className={`gm-topbar-tab ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <i className="fas fa-inbox"></i>
            <span>Messages</span>
          </button>
          <button className={`gm-topbar-tab ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')}>
            <i className="fas fa-comments"></i>
            <span>Chat en direct</span>
          </button>
        </div>
      </div>

      {activeTab === 'messages' ? <ContactMessages /> : <LiveChat />}
    </div>
  );
}

/* ==================== CONTACT MESSAGES TAB ==================== */
function ContactMessages() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [starredIds, setStarredIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('aecc_starred') || '[]'); } catch { return []; }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showReplyBox, setShowReplyBox] = useState(false);

  const FOLDERS = [
    { value: '', label: 'Boîte de réception', icon: 'fas fa-inbox' },
    { value: 'unread', label: 'Non lus', icon: 'fas fa-envelope' },
    { value: 'replied', label: 'Envoyés', icon: 'fas fa-paper-plane' },
    { value: 'read', label: 'Lus', icon: 'fas fa-envelope-open' },
    { value: 'starred', label: 'Suivis', icon: 'fas fa-star' },
    { value: 'archived', label: 'Archives', icon: 'fas fa-archive' },
  ];

  useEffect(() => { loadContacts(); }, [pagination.page, statusFilter]);
  useEffect(() => { localStorage.setItem('aecc_starred', JSON.stringify(starredIds)); }, [starredIds]);

  async function loadContacts(page = pagination.page) {
    setLoading(true);
    try {
      let url = `/contact?page=${page}&limit=25`;
      if (statusFilter && statusFilter !== 'starred') url += `&status=${statusFilter}`;
      const data = await api.get(url);
      setContacts(data.data || []);
      setPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setContacts([]); }
    setLoading(false);
  }

  const displayedContacts = useMemo(() => {
    let list = contacts;
    if (statusFilter === 'starred') list = list.filter(c => starredIds.includes(c._id));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) ||
        c.subject?.toLowerCase().includes(q) || c.message?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [contacts, statusFilter, starredIds, searchQuery]);

  const unreadCount = contacts.filter(c => c.status === 'unread').length;
  const repliedCount = contacts.filter(c => c.status === 'replied').length;
  const starredCount = contacts.filter(c => starredIds.includes(c._id)).length;

  async function selectContact(c) {
    try {
      const data = await api.get(`/contact/${c._id}`);
      setSelected(data.data || c);
      if (c.status === 'unread') updateStatus(c._id, 'read');
    } catch {
      setSelected(c);
      if (c.status === 'unread') updateStatus(c._id, 'read');
    }
    setReplyText('');
    setShowReplyBox(false);
  }

  async function updateStatus(id, status) {
    try {
      await api.put(`/contact/${id}`, { status });
      setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      if (selected?._id === id) setSelected(s => ({ ...s, status }));
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function toggleStar(id, e) {
    e?.stopPropagation();
    setStarredIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!replyText.trim() || !selected) return;
    setReplying(true);
    try {
      const data = await api.post(`/contact/${selected._id}/reply`, { message: replyText.trim() });
      setSelected(data.data);
      setContacts(prev => prev.map(c => c._id === selected._id ? { ...c, status: 'replied' } : c));
      setReplyText('');
      setShowReplyBox(false);
      addToast('Réponse envoyée avec succès', 'success');
    } catch (err) { addToast(err.message || 'Erreur lors de l\'envoi', 'error'); }
    setReplying(false);
  }

  async function handleDelete(id) {
    if (!(await confirm('Supprimer définitivement ce message ?', 'Supprimer le message'))) return;
    try {
      await api.delete(`/contact/${id}`);
      if (selected?._id === id) setSelected(null);
      setSelectedIds(ids => ids.filter(i => i !== id));
      loadContacts();
      addToast('Message supprimé', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function toggleSelect(id, e) {
    e?.stopPropagation();
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  }
  function toggleSelectAll() {
    setSelectedIds(selectedIds.length === displayedContacts.length ? [] : displayedContacts.map(c => c._id));
  }

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    if (!(await confirm(`Supprimer ${selectedIds.length} message(s) ?`, 'Suppression multiple'))) return;
    try {
      await Promise.all(selectedIds.map(id => api.delete(`/contact/${id}`)));
      if (selected && selectedIds.includes(selected._id)) setSelected(null);
      setSelectedIds([]);
      loadContacts();
      addToast('Messages supprimés', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  async function handleBulkArchive() {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map(id => api.put(`/contact/${id}`, { status: 'archived' })));
      setSelectedIds([]);
      loadContacts();
      addToast('Messages archivés', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  async function handleBulkMarkRead() {
    if (!selectedIds.length) return;
    try {
      await Promise.all(selectedIds.map(id => api.put(`/contact/${id}`, { status: 'read' })));
      setSelectedIds([]);
      loadContacts();
      addToast('Marqués comme lus', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  function getTimeLabel(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 86400000 && d.getDate() === now.getDate())
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (diff < 604800000)
      return d.toLocaleDateString('fr-FR', { weekday: 'short' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  function getAvatarColor(name) {
    const colors = ['#4285f4','#ea4335','#fbbc04','#34a853','#9334e6','#e8710a','#1a73e8','#d93025'];
    return colors[(name || '').charCodeAt(0) % colors.length];
  }

  return (
    <div className="gm-container">
      {/* Sidebar — Folders */}
      <aside className="gm-sidebar">
        <nav className="gm-folders">
          {FOLDERS.map(f => {
            const count = f.value === '' ? (pagination.total || contacts.length)
              : f.value === 'unread' ? unreadCount
              : f.value === 'replied' ? repliedCount
              : f.value === 'starred' ? starredCount : null;
            return (
              <button key={f.value}
                className={`gm-folder ${statusFilter === f.value ? 'active' : ''}`}
                onClick={() => { setStatusFilter(f.value); setPagination(p => ({ ...p, page: 1 })); setSelected(null); }}>
                <i className={f.icon}></i>
                <span className="gm-folder-label">{f.label}</span>
                {count > 0 && <span className="gm-folder-count">{count}</span>}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main area */}
      <div className="gm-main">
        {/* Toolbar */}
        <div className="gm-toolbar">
          <div className="gm-toolbar-left">
            <label className="gm-checkbox-wrap" title="Sélectionner tout">
              <input type="checkbox" checked={displayedContacts.length > 0 && selectedIds.length === displayedContacts.length} onChange={toggleSelectAll} />
              <i className="fas fa-caret-down" style={{ fontSize: '.65rem', marginLeft: '2px', color: 'var(--text-lighter)' }}></i>
            </label>
            {selectedIds.length > 0 ? (
              <div className="gm-bulk-actions">
                <button className="gm-toolbar-btn" onClick={handleBulkArchive} title="Archiver">
                  <i className="fas fa-archive"></i>
                </button>
                <button className="gm-toolbar-btn" onClick={handleBulkDelete} title="Supprimer">
                  <i className="fas fa-trash-alt"></i>
                </button>
                <button className="gm-toolbar-btn" onClick={handleBulkMarkRead} title="Marquer comme lu">
                  <i className="fas fa-envelope-open"></i>
                </button>
                <span className="gm-bulk-label">{selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}</span>
              </div>
            ) : (
              <button className="gm-toolbar-btn" onClick={() => loadContacts()} title="Actualiser">
                <i className="fas fa-redo-alt"></i>
              </button>
            )}
          </div>
          <div className="gm-search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Rechercher dans les messages..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="gm-search-clear" onClick={() => setSearchQuery('')}><i className="fas fa-times"></i></button>}
          </div>
          <div className="gm-toolbar-right">
            <span className="gm-page-info">{displayedContacts.length > 0 ? `1–${displayedContacts.length}` : '0'} sur {pagination.total || 0}</span>
            <button className="gm-toolbar-btn" disabled={pagination.page <= 1} onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}>
              <i className="fas fa-chevron-left"></i>
            </button>
            <button className="gm-toolbar-btn" disabled={pagination.page >= pagination.pages} onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}>
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Content split: list + reading pane */}
        <div className="gm-content">
          {/* Messages list */}
          <div className={`gm-list ${selected ? 'gm-list-collapsed' : ''}`}>
            {loading ? (
              <div className="gm-loading"><i className="fas fa-spinner fa-spin"></i></div>
            ) : displayedContacts.length === 0 ? (
              <div className="gm-empty">
                <i className="far fa-envelope-open"></i>
                <p>{searchQuery ? 'Aucun résultat' : statusFilter === 'starred' ? 'Aucun message suivi' : 'Aucun message'}</p>
              </div>
            ) : (
              displayedContacts.map(c => {
                const isUnread = c.status === 'unread';
                const isStarred = starredIds.includes(c._id);
                const isSelected = selected?._id === c._id;
                const isChecked = selectedIds.includes(c._id);
                return (
                  <div key={c._id}
                    className={`gm-row ${isUnread ? 'gm-row-unread' : ''} ${isSelected ? 'gm-row-active' : ''} ${isChecked ? 'gm-row-checked' : ''}`}
                    onClick={() => selectContact(c)}>
                    <div className="gm-row-actions" onClick={e => e.stopPropagation()}>
                      <input type="checkbox" checked={isChecked} onChange={e => toggleSelect(c._id, e)} />
                      <button className={`gm-star ${isStarred ? 'active' : ''}`} onClick={e => toggleStar(c._id, e)}>
                        <i className={isStarred ? 'fas fa-star' : 'far fa-star'}></i>
                      </button>
                    </div>
                    <div className="gm-row-sender">{c.name}</div>
                    <div className="gm-row-content">
                      <span className="gm-row-subject">{c.subject}</span>
                      <span className="gm-row-separator"> — </span>
                      <span className="gm-row-snippet">{c.message?.slice(0, 80)}</span>
                    </div>
                    <div className="gm-row-meta">
                      {c.replies?.length > 0 && <span className="gm-reply-badge"><i className="fas fa-reply"></i></span>}
                      {c.status === 'replied' && <span className="gm-sent-badge"><i className="fas fa-check-double"></i></span>}
                      <span className="gm-row-date">{getTimeLabel(c.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reading pane */}
          {selected && (
            <div className="gm-reading-pane">
              <div className="gm-thread-header">
                <button className="gm-back-btn" onClick={() => setSelected(null)}><i className="fas fa-arrow-left"></i></button>
                <h2 className="gm-thread-subject">{selected.subject}</h2>
                <div className="gm-thread-actions">
                  <button className="gm-toolbar-btn" onClick={() => updateStatus(selected._id, 'archived')} title="Archiver"><i className="fas fa-archive"></i></button>
                  <button className="gm-toolbar-btn" onClick={() => handleDelete(selected._id)} title="Supprimer"><i className="fas fa-trash-alt"></i></button>
                  <button className={`gm-star ${starredIds.includes(selected._id) ? 'active' : ''}`}
                    onClick={e => toggleStar(selected._id, e)} title="Suivre">
                    <i className={starredIds.includes(selected._id) ? 'fas fa-star' : 'far fa-star'}></i>
                  </button>
                </div>
              </div>

              <div className="gm-thread-body">
                <div className="gm-email">
                  <div className="gm-email-header">
                    <div className="gm-email-avatar" style={{ background: getAvatarColor(selected.name) }}>
                      {selected.name?.charAt(0).toUpperCase()}
                    </div>
                    <div className="gm-email-from">
                      <div className="gm-email-fromline">
                        <strong>{selected.name}</strong>
                        <span className="gm-email-addr">&lt;{selected.email}&gt;</span>
                      </div>
                      <div className="gm-email-toline">
                        à <strong>moi</strong>
                        <span className="gm-email-date">{new Date(selected.createdAt).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="gm-email-body"><p>{selected.message}</p></div>
                </div>

                {(selected.replies || []).map((reply, i) => (
                  <div key={i} className="gm-email gm-email-reply">
                    <div className="gm-email-header">
                      <div className="gm-email-avatar gm-email-avatar-admin"><i className="fas fa-user-shield"></i></div>
                      <div className="gm-email-from">
                        <div className="gm-email-fromline">
                          <strong>{reply.author || 'Admin AECC'}</strong>
                          <span className="gm-email-badge">Admin</span>
                        </div>
                        <div className="gm-email-toline">
                          à <strong>{selected.name}</strong>
                          <span className="gm-email-date">{new Date(reply.createdAt).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="gm-email-body"><p>{reply.message}</p></div>
                  </div>
                ))}
              </div>

              <div className="gm-reply-section">
                {!showReplyBox ? (
                  <button className="gm-reply-trigger" onClick={() => setShowReplyBox(true)}>
                    <i className="fas fa-reply"></i> Répondre
                  </button>
                ) : (
                  <form className="gm-compose" onSubmit={handleReply}>
                    <div className="gm-compose-header">
                      <span className="gm-compose-to">
                        <i className="fas fa-reply"></i> Réponse à <strong>{selected.name}</strong> &lt;{selected.email}&gt;
                      </span>
                      <button type="button" className="gm-compose-close" onClick={() => setShowReplyBox(false)}>
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <textarea className="gm-compose-body" value={replyText} onChange={e => setReplyText(e.target.value)}
                      placeholder="Rédigez votre réponse..." rows="5" autoFocus></textarea>
                    <div className="gm-compose-toolbar">
                      <button type="submit" className="gm-send-btn" disabled={replying || !replyText.trim()}>
                        {replying ? <><i className="fas fa-spinner fa-spin"></i> Envoi...</> : <>Envoyer <i className="fas fa-paper-plane"></i></>}
                      </button>
                      <div className="gm-status-actions">
                        <button type="button" className={`gm-status-btn ${selected.status === 'archived' ? 'active' : ''}`}
                          onClick={() => updateStatus(selected._id, 'archived')} title="Archiver">
                          <i className="fas fa-archive"></i>
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==================== LIVE CHAT TAB ==================== */
function LiveChat() {
  const { addToast } = useToast();
  const { confirm } = useConfirm();
  const [chats, setChats] = useState([]);
  const [chatPagination, setChatPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [chatLoading, setChatLoading] = useState(true);
  const [chatStatusFilter, setChatStatusFilter] = useState('');
  const [selectedChat, setSelectedChat] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  useEffect(() => { loadChats(); }, [chatPagination.page, chatStatusFilter]);

  useEffect(() => {
    if (selectedChat && selectedChat.status === 'active') {
      pollRef.current = setInterval(async () => {
        try {
          const data = await api.get(`/chat/${selectedChat._id}`);
          if (data.data) setSelectedChat(data.data);
        } catch { /* ignore */ }
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [selectedChat?._id, selectedChat?.status]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages]);

  async function loadChats(page = chatPagination.page) {
    setChatLoading(true);
    try {
      let url = `/chat?page=${page}&limit=20`;
      if (chatStatusFilter) url += `&status=${chatStatusFilter}`;
      const data = await api.get(url);
      setChats(data.data || []);
      setChatPagination(p => ({ ...p, ...(data.pagination || {}), page }));
    } catch { setChats([]); }
    setChatLoading(false);
  }

  async function selectChat(c) {
    try {
      const data = await api.get(`/chat/${c._id}`);
      setSelectedChat(data.data || c);
    } catch { setSelectedChat(c); }
    setAdminReply('');
  }

  async function handleAdminReply(e) {
    e.preventDefault();
    if (!adminReply.trim() || !selectedChat) return;
    setSendingReply(true);
    try {
      const data = await api.post(`/chat/${selectedChat._id}/admin-reply`, { message: adminReply.trim() });
      setSelectedChat(data.data);
      setAdminReply('');
      addToast('Message envoyé', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
    setSendingReply(false);
  }

  async function handleCloseChat(id) {
    if (!(await confirm('Fermer cette conversation ?', 'Fermeture', 'warning'))) return;
    try {
      const data = await api.put(`/chat/${id}/close`);
      setSelectedChat(data.data);
      loadChats();
      addToast('Conversation fermée', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  async function handleDeleteChat(id) {
    if (!(await confirm('Supprimer cette conversation ?', 'Suppression'))) return;
    try {
      await api.delete(`/chat/${id}`);
      if (selectedChat?._id === id) setSelectedChat(null);
      loadChats();
      addToast('Conversation supprimée', 'success');
    } catch (err) { addToast(err.message || 'Erreur', 'error'); }
  }

  const activeCount = chats.filter(c => c.status === 'active').length;
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;
    const q = searchQuery.toLowerCase();
    return chats.filter(c =>
      c.visitorName?.toLowerCase().includes(q) || c.visitorEmail?.toLowerCase().includes(q) ||
      c.messages?.some(m => m.message?.toLowerCase().includes(q))
    );
  }, [chats, searchQuery]);

  function getTimeLabel(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    if ((now - d) < 86400000 && d.getDate() === now.getDate())
      return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  }

  return (
    <div className="gm-container">
      <aside className="gm-sidebar">
        <nav className="gm-folders">
          <button className={`gm-folder ${chatStatusFilter === '' ? 'active' : ''}`}
            onClick={() => { setChatStatusFilter(''); setChatPagination(p => ({ ...p, page: 1 })); setSelectedChat(null); }}>
            <i className="fas fa-comments"></i>
            <span className="gm-folder-label">Toutes</span>
            <span className="gm-folder-count">{chatPagination.total || chats.length}</span>
          </button>
          <button className={`gm-folder ${chatStatusFilter === 'active' ? 'active' : ''}`}
            onClick={() => { setChatStatusFilter('active'); setChatPagination(p => ({ ...p, page: 1 })); setSelectedChat(null); }}>
            <span className="gm-status-dot" style={{ background: '#34a853' }}></span>
            <span className="gm-folder-label">Actives</span>
            {activeCount > 0 && <span className="gm-folder-count">{activeCount}</span>}
          </button>
          <button className={`gm-folder ${chatStatusFilter === 'closed' ? 'active' : ''}`}
            onClick={() => { setChatStatusFilter('closed'); setChatPagination(p => ({ ...p, page: 1 })); setSelectedChat(null); }}>
            <i className="fas fa-times-circle"></i>
            <span className="gm-folder-label">Fermées</span>
          </button>
        </nav>
      </aside>

      <div className="gm-main">
        <div className="gm-toolbar">
          <div className="gm-toolbar-left">
            <button className="gm-toolbar-btn" onClick={() => loadChats()} title="Actualiser"><i className="fas fa-redo-alt"></i></button>
          </div>
          <div className="gm-search-bar">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Rechercher dans les conversations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            {searchQuery && <button className="gm-search-clear" onClick={() => setSearchQuery('')}><i className="fas fa-times"></i></button>}
          </div>
          <div className="gm-toolbar-right">
            <span className="gm-page-info">{filteredChats.length} conversation{filteredChats.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        <div className="gm-content">
          <div className={`gm-list ${selectedChat ? 'gm-list-collapsed' : ''}`}>
            {chatLoading ? (
              <div className="gm-loading"><i className="fas fa-spinner fa-spin"></i></div>
            ) : filteredChats.length === 0 ? (
              <div className="gm-empty"><i className="fas fa-comments"></i><p>{searchQuery ? 'Aucun résultat' : 'Aucune conversation'}</p></div>
            ) : (
              filteredChats.map(c => {
                const lastMsg = c.messages?.[c.messages.length - 1];
                return (
                  <div key={c._id}
                    className={`gm-row ${selectedChat?._id === c._id ? 'gm-row-active' : ''} ${c.status === 'active' ? 'gm-row-unread' : ''}`}
                    onClick={() => selectChat(c)}>
                    <div className="gm-row-actions">
                      <span className="gm-status-dot" style={{ background: c.status === 'active' ? '#34a853' : '#9aa0a6' }}></span>
                    </div>
                    <div className="gm-row-sender">{c.visitorName || 'Visiteur'}</div>
                    <div className="gm-row-content">
                      <span className="gm-row-subject">{c.visitorEmail || 'Chat'}</span>
                      <span className="gm-row-separator"> — </span>
                      <span className="gm-row-snippet">{lastMsg?.message?.slice(0, 60) || '...'}</span>
                    </div>
                    <div className="gm-row-meta">
                      <span className="gm-reply-badge"><i className="fas fa-comment-dots"></i> {c.messages?.length || 0}</span>
                      <span className="gm-row-date">{getTimeLabel(c.lastMessageAt || c.createdAt)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {selectedChat && (
            <div className="gm-reading-pane">
              <div className="gm-thread-header">
                <button className="gm-back-btn" onClick={() => setSelectedChat(null)}><i className="fas fa-arrow-left"></i></button>
                <h2 className="gm-thread-subject">
                  {selectedChat.visitorName || 'Visiteur'}
                  {selectedChat.visitorEmail && <span className="gm-thread-email"> — {selectedChat.visitorEmail}</span>}
                </h2>
                <div className="gm-thread-actions">
                  <span className={`gm-chat-status ${selectedChat.status}`}>
                    <span className="gm-status-dot" style={{ background: selectedChat.status === 'active' ? '#34a853' : '#9aa0a6' }}></span>
                    {selectedChat.status === 'active' ? 'Active' : 'Fermée'}
                  </span>
                  {selectedChat.status === 'active' && (
                    <button className="gm-toolbar-btn" onClick={() => handleCloseChat(selectedChat._id)} title="Fermer"><i className="fas fa-times-circle"></i></button>
                  )}
                  <button className="gm-toolbar-btn" onClick={() => handleDeleteChat(selectedChat._id)} title="Supprimer"><i className="fas fa-trash-alt"></i></button>
                </div>
              </div>

              <div className="gm-chat-thread">
                {(selectedChat.messages || []).map((msg, i) => (
                  <div key={i} className={`gm-chat-msg gm-chat-msg-${msg.sender}`}>
                    <div className="gm-chat-msg-avatar">
                      {msg.sender === 'user' && (selectedChat.visitorName?.charAt(0).toUpperCase() || 'V')}
                      {msg.sender === 'bot' && <i className="fas fa-robot"></i>}
                      {msg.sender === 'admin' && <i className="fas fa-user-shield"></i>}
                    </div>
                    <div className="gm-chat-msg-bubble">
                      <div className="gm-chat-msg-head">
                        <strong>{msg.sender === 'user' ? selectedChat.visitorName : msg.sender === 'bot' ? 'Bot AECC' : 'Admin'}</strong>
                        <time>{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</time>
                      </div>
                      <p>{msg.message}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {selectedChat.status === 'active' ? (
                <form className="gm-chat-input" onSubmit={handleAdminReply}>
                  <input type="text" value={adminReply} onChange={e => setAdminReply(e.target.value)} placeholder="Répondre au visiteur..." />
                  <button type="submit" disabled={sendingReply || !adminReply.trim()} className="gm-send-btn">
                    {sendingReply ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                  </button>
                </form>
              ) : (
                <div className="gm-chat-closed"><i className="fas fa-lock"></i> Conversation fermée</div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
