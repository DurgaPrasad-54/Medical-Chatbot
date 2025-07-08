import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/chat');
    }
  }, [navigate]);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      showMessage('Please enter your email address', 'error');
      return;
    }

    if (!validateEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tempToken', data.token);
        localStorage.setItem('userEmail', email.trim().toLowerCase());
        showMessage('OTP sent successfully! Check your email.', 'success');
        setTimeout(() => {
          navigate('/verify');
        }, 1500);
      } else {
        showMessage(data.message || 'Failed to send OTP. Please try again.', 'error');
      }
    } catch (err) {
      console.error('Login error:', err);
      showMessage('Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="inner">
        <form className="form" onSubmit={handleSendOTP}>

          
          <h1 className='medchat-h1'>Welcome to MedChat</h1>
          
          <div className="email-container">
            <input
              id="email"
              className="inp"
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={loading}
              aria-describedby={message ? "message" : undefined}
            />
            
            <button 
              type="submit" 
              className="btn" 
              disabled={loading || !email.trim()}
              aria-describedby={loading ? "loading-text" : undefined}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  <span id="loading-text">Sending OTP...</span>
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
          
          {message && (
            <div 
              id="message"
              className={`message ${messageType}`}
              role="alert"
              aria-live="polite"
            >
              {message}
            </div>
          )}
          
        </form>
      </div>
    </div>
  );
};

export default Login;