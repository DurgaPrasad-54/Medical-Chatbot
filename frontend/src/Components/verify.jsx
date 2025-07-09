import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Verify = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    
    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      navigate('/');
    }
  }, [navigate]);

  const showMessage = (text, type = 'info') => {
    setMessage(text);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      showMessage('Please enter the OTP', 'error');
      return;
    }

    if (!/^\d{4,6}$/.test(otp)) {
      showMessage('Enter a valid numeric OTP', 'error');
      return;
    }

    setLoading(true);
    setMessage('');

    const tempToken = localStorage.getItem('tempToken');

    try {
      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`,
        },
        body: JSON.stringify({ otp: parseInt(otp) }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.removeItem('tempToken');
        showMessage('OTP verified successfully!', 'success');
        setTimeout(() => {
          navigate('/chat');
        }, 1500);
      } else {
        showMessage(data.message || 'Invalid OTP', 'error');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="inner">
        <form className="form" onSubmit={handleVerifyOTP}>
          <h1 className="medchat-h1">Verify OTP</h1>

          <div className="email-container">
            <input
              className="inp"
              type="text"
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              disabled={loading}
              aria-describedby={message ? 'message' : undefined}
            />

            <button
              type="submit"
              className="btn"
              disabled={loading || !otp.trim()}
              aria-describedby={loading ? 'loading-text' : undefined}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  <span id="loading-text">Verifying...</span>
                </>
              ) : (
                'Verify OTP'
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

export default Verify;
