import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'
import assets from '../assets/assets'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleForgotPassword = async (e) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/forgot-password', { email })

      if (response.data.success) {
        setEmailSent(true)
        toast.success('Reset link sent to your email!')
      } else {
        toast.error(response.data.message)
      }
    } catch {
      toast.error('Failed to send reset link')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center gap-8 sm:justify-evenly max-sm:flex-col p-4'>
      <img src={assets.logo_big} alt="" className="w-[350px] h-auto object-contain drop-shadow-2xl max-md:w-[250px]" />

      <form onSubmit={handleForgotPassword} className="border-2 border-purple-500/50 bg-white/10 backdrop-blur-xl text-white p-8 flex flex-col gap-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="font-bold text-3xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Forgot Password
        </h2>

        {!emailSent ? (
          <>
            <p className='text-gray-300 text-sm'>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              type="email"
              className="p-3 border border-purple-400/50 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-300 transition"
              placeholder='Enter your email'
              required
            />

            <button
              type="submit"
              disabled={loading}
              className="py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg cursor-pointer font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </>
        ) : (
          <div className='text-center py-4'>
            <p className='text-lg font-medium text-green-400 mb-2'>✓ Email Sent!</p>
            <p className='text-gray-300 text-sm mb-4'>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className='text-gray-400 text-sm mb-6'>
              Check your inbox and click the link to reset your password. The link will expire in 1 hour.
            </p>
            <button
              onClick={() => setEmailSent(false)}
              className='text-purple-400 hover:text-purple-300 transition text-sm font-medium'
            >
              Send another email
            </button>
          </div>
        )}

        <div className="flex flex-col gap-2 text-center">
          <p className='text-sm text-gray-400'>
            Remember your password? <span onClick={() => navigate('/login')} className='font-medium text-purple-400 cursor-pointer hover:text-purple-300 transition'>Login here</span>
          </p>
          <p className='text-sm text-gray-400'>
            Don't have an account? <span onClick={() => navigate('/login')} className='font-medium text-purple-400 cursor-pointer hover:text-purple-300 transition'>Sign up</span>
          </p>
        </div>
      </form>
    </div>
  )
}

export default ForgotPasswordPage
