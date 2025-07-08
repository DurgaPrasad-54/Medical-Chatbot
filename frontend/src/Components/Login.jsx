import {useState} from 'react'
import {useNavigate} from 'react-router-dom'

const Login = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [tempToken, setTempToken] = useState('')
  const navigate = useNavigate()

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setOtpSent(true)
        setTempToken(data.token)
        setMessage('OTP sent successfully! Check your email.')
      } else {
        setMessage(data.message || 'Error sending OTP')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('http://localhost:5000/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tempToken}`
        },
        body: JSON.stringify({ otp: parseInt(otp) }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem('token', data.token)
        setMessage('Login successful!')
        navigate('/chat')
      } else {
        setMessage(data.message || 'Invalid OTP')
      }
    } catch (error) {
      setMessage('Network error. Please try again.')
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='main'>
      <div className='inner'>
        <form className='form'>
          <h1>MedChat Login</h1>
          
          {!otpSent ? (
            <div className='email-container'>
              <input 
                className='inp' 
                type="email" 
                placeholder='Enter your email' 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
              <button 
                type='submit' 
                className='btn'
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          ) : (
            <div className='otp-container'>
              <input 
                className='inp' 
                type="text" 
                placeholder='Enter your OTP' 
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required 
              />
              <button 
                type='submit' 
                className='btn'
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button 
                type='button' 
                className='btn'
                onClick={() => {
                  setOtpSent(false)
                  setOtp('')
                  setMessage('')
                }}
              >
                Back to Email
              </button>
            </div>
          )}
          
          {message && <p className="message">{message}</p>}
        </form>
      </div>
    </div>
  )
}

export default Login