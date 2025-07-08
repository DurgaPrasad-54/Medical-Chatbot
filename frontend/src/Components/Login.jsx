import {useState} from 'react'
import {Link, useNavigate} from 'react-router-dom'


const Login = () => {


  return (
    <div className='main'>
        <div className='inner'>
            <form className='form'>
                <h1>MedChat Login</h1>
                <div className='email-container'>
                    <input className='inp' type="email" placeholder='Enter your email' name="email" required />
                    <button type='submit' className='btn'>Send OTP</button>
                    <p></p>
                </div>
                <div className='otp-container'>
                    <input className='inp' type="text" placeholder='Enter your OTP' name="otp" required />
                    <button type='submit' className='btn'>Verify OTP</button>
                </div>

            </form>
                
        </div>
    </div>
  )
}

export default Login