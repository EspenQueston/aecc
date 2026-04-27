import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    if (open && chatId && status === 'active' && !sending) {
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
  }, [open, chatId, status, sending]);

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
    
    const userMsg = input.trim();
    setInput('');
    setSending(true);

    // Optimistic UI update
    const tempBotMsgId = 'temp-'+Date.now();
    setMessages(prev => [
      ...prev, 
      { sender: 'user', message: userMsg, createdAt: new Date().toISOString() },
      { sender: 'bot', message: '', _id: tempBotMsgId, isStreaming: true }
    ]);

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['x-auth-token'] = token;

      const response = await fetch(`/api/chat/${chatId}/message`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ message: userMsg })
      });

      if (!response.ok) throw new Error('Request failed');

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let botText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
            if (line.startsWith('data: ') && line !== 'data: [DONE]') {
              try {
                const data = JSON.parse(line.slice(6));
                if (data.text) {
                  botText += data.text;
                  setMessages(prev => prev.map(m => 
                    m._id === tempBotMsgId ? { ...m, message: botText } : m
                  ));
                }
              } catch (e) {}
            }
          }
        }
        
        // Refresh final state from backend after streaming
        const finalData = await api.get(`/chat/${chatId}`);
        if (finalData.data) {
           setMessages(finalData.data.messages || []);
           setStatus(finalData.data.status);
        }
      } else {
        // Fallback for non-streaming response (e.g. transfer to agent)
        const data = await response.json();
        if (data.data) {
          setMessages(data.data.messages || []);
          setStatus(data.data.status);
        }
      }
    } catch (err) { 
      setMessages(prev => prev.filter(m => m._id !== tempBotMsgId));
    } finally {
      setSending(false);
    }
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
          <div key={msg._id || i} className={`chat-msg chat-msg-${msg.sender}`}>
            <div className="chat-msg-bubble">
              {msg.sender === 'bot' && <span className="chat-msg-label"><i className="fas fa-robot"></i> Bot</span>}
              {msg.sender === 'admin' && <span className="chat-msg-label"><i className="fas fa-shield-alt"></i> Admin</span>}
              {msg.sender === 'user' ? (
                <p>{msg.message}</p>
              ) : (
                <div className={`chat-msg-markdown ${msg.isStreaming ? 'streaming' : ''}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.message || (msg.isStreaming ? '...' : '')}</ReactMarkdown>
                </div>
              )}
              {msg.createdAt && <span className="chat-msg-time">{new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>}
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
            disabled={sending}
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
