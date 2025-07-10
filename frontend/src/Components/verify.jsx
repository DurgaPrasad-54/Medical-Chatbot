import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Verify = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const tempToken = localStorage.getItem('tempToken');
    if (!tempToken) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [resendCooldown]);

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

  const handleResendOTP = async () => {
    const email = localStorage.getItem('userEmail');
    if (!email) return;

    setResendLoading(true);
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tempToken', data.token);
        showMessage('OTP resent successfully!', 'success');
        setResendCooldown(30); // 30 second cooldown
      } else {
        showMessage(data.message || 'Failed to resend OTP.', 'error');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      showMessage('Network error. Please try again.', 'error');
    } finally {
      setResendLoading(false);
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
            />

            <p
              onClick={resendCooldown === 0 && !resendLoading ? handleResendOTP : undefined}
              className={`resend-link ${resendCooldown > 0 || resendLoading ? 'disabled' : ''}`}
            >
              {resendCooldown > 0
                ? `Resend OTP in ${resendCooldown}s`
                : resendLoading
                ? 'Resending...'
                : 'Resend OTP'}
            </p>

            <button
              type="submit"
              className="btn"
              disabled={loading || !otp.trim()}
            >
              {loading ? (
                <>
                  <div className="loading-spinner" />
                  <span>Verifying...</span>
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
          </div>

          {message && (
            <div
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
