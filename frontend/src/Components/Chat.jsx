import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './Chat.css'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [history, setHistory] = useState([])
  const [showSidebar, setShowSidebar] = useState(window.innerWidth >= 768)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    } else {
      fetchHistory()
    }

    const handleResize = () => {
      setShowSidebar(window.innerWidth >= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [navigate])

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev)
  }

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/history', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        setHistory(data.history || [])
      } else {
        console.error(data.message)
      }
    } catch (err) {
      console.error('Failed to fetch history:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    setError('')
    const userMessage = { type: 'user', text: query }
    setMessages(prev => [...prev, userMessage])

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()

      if (response.ok) {
        const aiMessage = { type: 'ai', text: data.response }
        setMessages(prev => [...prev, aiMessage])
        setQuery('')
        fetchHistory()
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
        } else {
          setError(data.message || 'Error getting response')
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleClearHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history?')) return
    try {
      const token = localStorage.getItem('token')
      const res = await fetch('http://localhost:5000/history', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await res.json()
      if (res.ok) {
        alert('History cleared')
        setHistory([])
        setMessages([])
      } else {
        alert(data.message || 'Failed to clear history.')
      }
    } catch (err) {
      alert('Network error.')
    }
  }

  const handleHistoryClick = (item) => {
    setMessages([
      { type: 'user', text: item.query },
      { type: 'ai', text: item.response }
    ])
  }

  const handleNewChat = () => {
    setMessages([])
  }

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="toggle-sidebar-btn" onClick={toggleSidebar}>
          {showSidebar ? 'Hide Menu' : '☰ Menu'}
        </button>
      </div>

      {/* Sidebar */}
      {showSidebar && (
        <div className="sidebar">
          <h2>MedChat</h2>
          <button className="btn" onClick={handleNewChat}>+ New Chat</button>
          <button className="btn" onClick={handleClearHistory}>Clear History</button>
          <div className="chat-history-list">
            {history.length === 0 ? (
              <p className="no-history">No chats yet</p>
            ) : (
              history.map((item, index) => (
                <div
                  key={item._id || index}
                  className="history-item"
                  onClick={() => handleHistoryClick(item)}
                >
                  🗨 {item.query.length > 30 ? item.query.slice(0, 30) + '...' : item.query}
                </div>
              ))
            )}
          </div>
          <button className="btn logout" onClick={handleLogout}>Logout</button>
        </div>
      )}

      {/* Main Chat */}
      <div className="chat-main">
        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <p>Welcome to MedChat! Ask me any medical or health-related questions.</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.type}`}>
                <div className="message-content">
                  <strong>{message.type === 'user' ? 'You' : 'MedChat'}: </strong>
                  {message.text}
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="message ai">
              <div className="message-content">
                <strong>MedChat: </strong>Thinking...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="chat-input-form">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a medical question..."
            className="chat-input"
            disabled={loading}
          />
          <button type="submit" disabled={loading || !query.trim()} className="btn">
            {loading ? 'Sending...' : 'Send'}
          </button>
        </form>
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  )
}

export default Chat
