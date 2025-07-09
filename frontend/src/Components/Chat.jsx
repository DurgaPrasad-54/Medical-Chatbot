import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu, FiPlus, FiTrash2, FiMessageSquare, FiLogOut,
  FiSend, FiUser, FiMoreHorizontal, FiActivity
} from 'react-icons/fi';
import { MdMedicalServices } from 'react-icons/md';
import { RiRobot2Line } from 'react-icons/ri';
import './Chat.css';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');
    fetchHistory();

    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/history', {
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
      const res = await fetch('http://localhost:5000/chat', {
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
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/history', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory([]);
        setMessages([]);
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
      const res = await fetch(`http://localhost:5000/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setHistory((prev) => prev.filter((item) => item._id !== id));
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
    if (window.innerWidth < 768) setShowSidebar(false);
  };

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="icon-btn" onClick={() => setShowSidebar(!showSidebar)}>
          <FiMenu />
        </button>
        <div className="mobile-title">
          <MdMedicalServices />
          <span>MedChat</span>
        </div>
      </div>

      {/* Sidebar */}
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
                <FiMessageSquare />
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

      {/* Chat Area */}
      <main className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              {/* <MdMedicalServices /> */}
              <h3>Welcome to MedChat</h3>
              <p>Ask your medical questions to begin</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`message ${msg.type}`}>
                <div className="avatar">{msg.type === 'user' ? <FiUser /> : <RiRobot2Line />}</div>
                <div className="content">
                  <div className="sender">{msg.type === 'user' ? 'You' : 'MedChat'}</div>
                  <div className="text">{msg.text}</div>
                </div>
              </div>
            ))
          )}

          {loading && (
            <div className="message ai">
              <div className="avatar">
                <RiRobot2Line />
              </div>
              <div className="content">
                <div className="sender">MedChat</div>
                <div className="text typing">
                  <FiMoreHorizontal /> Thinking...
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your medical query..."
          />
          <button type="submit" disabled={loading || !query.trim()}>
            {loading ? <FiActivity className="loading" /> : <FiSend />}
          </button>
        </form>

        {error && <div className="error"><FiActivity /> {error}</div>}
      </main>
    </div>
  );
};

export default Chat;
