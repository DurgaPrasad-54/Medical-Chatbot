// Verify.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Verify = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const tempToken = localStorage.getItem('tempToken');

    try {
      const response = await fetch('http://localhost:5000/verify', {
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
        navigate('/chat');
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    localStorage.removeItem('tempToken');
    localStorage.removeItem('userEmail');
    navigate('/');
  };

  return (
    <div className="main">
      <div className="inner">
        <form className="form" onSubmit={handleVerifyOTP}>
          <h1>Verify OTP</h1>
          <div className="otp-container">
            <input
              className="inp"
              type="text"
              placeholder="Enter your OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="btn" onClick={handleBack}>
              Back to Email
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Verify;
