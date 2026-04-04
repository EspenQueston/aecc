import { useState, useEffect, useRef } from 'react';
import { api } from '../../services/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState(() => sessionStorage.getItem('aecc_chat_id') || '');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState('active');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages when chat is open
  useEffect(() => {
    if (open && chatId && status === 'active') {
      pollRef.current = setInterval(async () => {
        try {
          const data = await api.get(`/chat/${chatId}`);
          if (data.data) {
            setMessages(data.data.messages || []);
            setStatus(data.data.status);
          }
        } catch { /* ignore poll errors */ }
      }, 5000);
    }
    return () => clearInterval(pollRef.current);
  }, [open, chatId, status]);

  async function startChat() {
    try {
      const data = await api.post('/chat/start', { conversationId: chatId || undefined });
      if (data.data) {
        setChatId(data.data._id);
        sessionStorage.setItem('aecc_chat_id', data.data._id);
        setMessages(data.data.messages || []);
        setStatus(data.data.status);
      }
    } catch { /* ignore */ }
  }

  function handleOpen() {
    setOpen(true);
    if (!chatId) {
      startChat();
    } else {
      // Reload existing conversation
      api.get(`/chat/${chatId}`).then(data => {
        if (data.data) {
          setMessages(data.data.messages || []);
          setStatus(data.data.status);
        } else {
          startChat();
        }
      }).catch(() => startChat());
    }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!input.trim() || sending || !chatId) return;
    setSending(true);
    try {
      const data = await api.post(`/chat/${chatId}/message`, { message: input.trim() });
      if (data.data) {
        setMessages(data.data.messages || []);
        setStatus(data.data.status);
      }
      setInput('');
    } catch { /* ignore */ }
    setSending(false);
  }

  function handleNewChat() {
    sessionStorage.removeItem('aecc_chat_id');
    setChatId('');
    setMessages([]);
    setStatus('active');
    startChat();
  }

  if (!open) {
    return (
      <button className="chat-widget-btn" onClick={handleOpen} title="Chat avec l'AECC">
        <i className="fas fa-comments"></i>
      </button>
    );
  }

  return (
    <div className="chat-widget">
      <div className="chat-widget-header">
        <div className="chat-widget-header-info">
          <div className="chat-widget-avatar"><i className="fas fa-robot"></i></div>
          <div>
            <strong>AECC Chat</strong>
            <span className="chat-widget-status">{status === 'active' ? 'En ligne' : 'Conversation fermée'}</span>
          </div>
        </div>
        <div className="chat-widget-header-actions">
          {status === 'closed' && (
            <button onClick={handleNewChat} title="Nouvelle conversation"><i className="fas fa-plus"></i></button>
          )}
          <button onClick={() => setOpen(false)} title="Fermer"><i className="fas fa-times"></i></button>
        </div>
      </div>

      <div className="chat-widget-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg chat-msg-${msg.sender}`}>
            <div className="chat-msg-bubble">
              {msg.sender === 'bot' && <span className="chat-msg-label"><i className="fas fa-robot"></i> Bot</span>}
              {msg.sender === 'admin' && <span className="chat-msg-label"><i className="fas fa-shield-alt"></i> Admin</span>}
              <p>{msg.message}</p>
              <span className="chat-msg-time">{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {status === 'active' ? (
        <form onSubmit={handleSend} className="chat-widget-input">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Écrivez votre message..."
            maxLength={2000}
          />
          <button type="submit" disabled={sending || !input.trim()}>
            {sending ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
          </button>
        </form>
      ) : (
        <div className="chat-widget-closed">
          <p>Cette conversation est terminée.</p>
          <button className="btn btn-primary btn-sm" onClick={handleNewChat}>Nouvelle conversation</button>
        </div>
      )}
    </div>
  );
}
