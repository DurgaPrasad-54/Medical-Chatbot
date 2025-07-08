// Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('tempToken', data.token); // temporarily store token
        localStorage.setItem('userEmail', email);       // store email for verification
        navigate('/verify');
      } else {
        setMessage(data.message || 'Error sending OTP');
      }
    } catch (err) {
      console.error(err);
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main">
      <div className="inner">
        <form className="form" onSubmit={handleSendOTP}>
          <h1>MedChat Login</h1>
          <div className="email-container">
            <input
              className="inp"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default Login;
