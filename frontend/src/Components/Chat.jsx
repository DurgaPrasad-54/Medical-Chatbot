import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const Chat = () => {
  const [messages, setMessages] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError('')

    // Add user message to chat
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
        // Add AI response to chat
        const aiMessage = { type: 'ai', text: data.response }
        setMessages(prev => [...prev, aiMessage])
        setQuery('')
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
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const goToHistory = () => {
    navigate('/history')
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h1>MedChat Assistant</h1>
        <div className="header-buttons">
          <button onClick={goToHistory} className="btn">History</button>
          <button onClick={handleLogout} className="btn">Logout</button>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <p>Welcome to MedChat! Ask me any medical or health-related questions.</p>
          </div>
        ) : (
          messages.map((message, index) => (
            <div key={index} className={`message ${message.type}`}>
              <div className="message-content">
                {message.type === 'user' ? (
                  <strong>You: </strong>
                ) : (
                  <strong>MedChat: </strong>
                )}
                {message.text}
              </div>
            </div>
          ))
        )}
        {loading && (
          <div className="message ai">
            <div className="message-content">
              <strong>MedChat: </strong>
              <span>Thinking...</span>
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
  )
}

export default Chat