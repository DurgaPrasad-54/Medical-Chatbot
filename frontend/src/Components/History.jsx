import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Chat.css'; // Reuse the same styles

const History = () => {
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    } else {
      fetchHistory();
    }
  }, [navigate]);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(data.history || []);
      } else {
        alert(data.message || 'Failed to fetch history');
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleDeleteSingle = async (id) => {
    if (!window.confirm('Delete this conversation?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/history/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setHistory(history.filter(item => item._id !== id));
      } else {
        alert(data.message || 'Failed to delete conversation');
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/history', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        alert('History cleared successfully');
        setHistory([]);
      } else {
        alert(data.message || 'Failed to clear history');
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      alert('Network error. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Chat History</h2>
        <button className="btn" onClick={() => navigate('/chat')}>← Back to Chat</button>
        <button className="btn" onClick={handleClearAll}>Clear All History</button>

        <div className="chat-history-list">
          {history.length === 0 ? (
            <p className="no-history">No chats found</p>
          ) : (
            history.map((item, index) => (
              <div key={item._id || index} className="history-item">
                <div
                  className="history-text"
                  onClick={() =>
                    navigate('/chat', {
                      state: {
                        query: item.query,
                        response: item.response,
                      },
                    })
                  }
                >
                  🗨 {item.query.length > 40 ? item.query.slice(0, 40) + '...' : item.query}
                </div>
                <button className="delete-icon" onClick={() => handleDeleteSingle(item._id)}>🗑</button>
              </div>
            ))
          )}
        </div>

        <button className="btn logout" onClick={handleLogout}>Logout</button>
      </aside>

      <main className="chat-main">
        <div className="welcome-message">
          <p>Select a chat from the sidebar to view or continue the conversation.</p>
        </div>
      </main>
    </div>
  );
};

export default History;
