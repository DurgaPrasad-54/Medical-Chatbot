import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu, FiPlus, FiTrash2, FiLogOut,
  FiSend, FiMoreHorizontal, FiX
} from 'react-icons/fi';
import { MdMedicalServices } from 'react-icons/md';
import './Chat.css';

const Chat = () => {
  const token = localStorage.getItem('token');
  const API_URL = import.meta.env.VITE_API_URL;
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  if(!token){
    navigate('/login');
    return null; 
  }

  useEffect(() => {
    
    if (!token) return navigate('/login');
    fetchHistory();

    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showSidebar &&
        window.innerWidth < 768 &&
        !e.target.closest('.sidebar') &&
        !e.target.closest('.icon-btn')
      ) {
        setShowSidebar(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSidebar]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
    } catch (err) {
      console.error('Fetch history error:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userMessage = { type: 'user', text: query };
    setMessages((prev) => [...prev, userMessage]);
    setQuery('');
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();

      if (res.ok) {
        const aiMessage = { type: 'ai', text: data.response };
        setMessages((prev) => [...prev, aiMessage]);
        fetchHistory();
      } else if (res.status === 401) {
        navigate('/login');
      } else {
        setError(data.message || 'Something went wrong');
      }
    } catch {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setQuery('');
    setError('');
    if (window.innerWidth < 768) setShowSidebar(false); // ✅ Close on mobile
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/history`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory([]);
        setMessages([]);
        if (window.innerWidth < 768) setShowSidebar(false); // ✅ Close on mobile
      }
    } catch {
      alert('Network error occurred');
    }
  };

  const handleDeleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this chat?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const deletedItem = history.find((item) => item._id === id);
        setHistory((prev) => prev.filter((item) => item._id !== id));

        if (
          deletedItem &&
          messages.length >= 2 &&
          messages[0].text === deletedItem.query &&
          messages[1].text === deletedItem.response
        ) {
          setMessages([]);
        }

        if (window.innerWidth < 768) setShowSidebar(false); // ✅ Close on mobile
      }
    } catch {
      alert('Network error occurred');
    }
  };

  const handleHistoryClick = (item) => {
    setMessages([
      { type: 'user', text: item.query },
      { type: 'ai', text: item.response },
    ]);
    if (window.innerWidth < 768) setShowSidebar(false); // ✅ Close on mobile
  };

  return (
    <div className="app-layout">
      <div className="mobile-header">
        <button className="icon-btn" onClick={() => setShowSidebar(!showSidebar)}>
          {showSidebar ? <FiX /> : <FiMenu />}
        </button>
        <div className="mobile-title">
          <MdMedicalServices />
          <span>MedChat</span>
        </div>
      </div>

      <aside className={`sidebar ${showSidebar ? 'show' : ''}`}>
        <div className="sidebar-header">
          <MdMedicalServices />
          <span>MedChat</span>
        </div>

        <button onClick={handleNewChat} className="btn">
          <FiPlus /> New Chat
        </button>
        <button onClick={handleClearHistory} className="btn danger">
          <FiTrash2 /> Clear History
        </button>

        <div className="history-list">
          {history.length === 0 ? (
            <p>No chat history</p>
          ) : (
            history.map((item) => (
              <div key={item._id} className="history-item" onClick={() => handleHistoryClick(item)}>
                <span>{item.query.slice(0, 25)}...</span>
                <button className="delete-btn" onClick={(e) => handleDeleteItem(item._id, e)}>
                  <FiTrash2 />
                </button>
              </div>
            ))
          )}
        </div>

        <button onClick={handleLogout} className="btn logout">
          <FiLogOut /> Logout
        </button>
      </aside>

      <main className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h3>Welcome to MedChat</h3>
              <p>Ask your medical questions to begin</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                <div className="content">
                  <div className="text">{msg.text}</div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message ai">
              <div className="content typing">
                <FiMoreHorizontal /> Thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your medical query..."
          />
          <button type="submit" disabled={loading || !query.trim()}>
            <FiSend />
          </button>
        </form>

        {error && <div className="error">{error}</div>}
      </main>
      
    </div>
  );
};

export default Chat;
