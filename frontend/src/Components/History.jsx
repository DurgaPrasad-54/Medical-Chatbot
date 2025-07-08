import {useState, useEffect} from 'react'
import {useNavigate} from 'react-router-dom'

const History = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    fetchHistory()
  }, [navigate])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/history', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setHistory(data.history || [])
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
        } else {
          setError(data.message || 'Error fetching history')
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteHistory = async () => {
    if (!window.confirm('Are you sure you want to delete all chat history?')) {
      return
    }

    setDeleteLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/history', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()

      if (response.ok) {
        setHistory([])
        alert('History deleted successfully')
      } else {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token')
          navigate('/login')
        } else {
          setError(data.message || 'Error deleting history')
        }
      }
    } catch (error) {
      setError('Network error. Please try again.')
      console.error('Error:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  const goToChat = () => {
    navigate('/chat')
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString()
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1>Chat History</h1>
        </div>
        <div className="loading">Loading history...</div>
      </div>
    )
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <h1>Chat History</h1>
        <div className="header-buttons">
          <button onClick={goToChat} className="btn">Back to Chat</button>
          {history.length > 0 && (
            <button 
              onClick={handleDeleteHistory} 
              disabled={deleteLoading}
              className="btn delete-btn"
            >
              {deleteLoading ? 'Deleting...' : 'Clear History'}
            </button>
          )}
          <button onClick={handleLogout} className="btn">Logout</button>
        </div>
      </div>

      <div className="history-content">
        {error && <div className="error-message">{error}</div>}
        
        {history.length === 0 ? (
          <div className="no-history">
            <p>No chat history found. Start a conversation to see your history here.</p>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item, index) => (
              <div key={item._id || index} className="history-item">
                <div className="history-timestamp">
                  {formatDate(item.createdAt)}
                </div>
                <div className="history-query">
                  <strong>You: </strong>
                  {item.query}
                </div>
                <div className="history-response">
                  <strong>MedChat: </strong>
                  {item.response}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default History