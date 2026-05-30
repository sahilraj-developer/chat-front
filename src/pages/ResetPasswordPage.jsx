import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import toast from 'react-hot-toast'

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [verifying, setVerifying] = useState(true)

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        toast.error('Invalid reset link')
        navigate('/login')
        return
      }

      try {
        const response = await axios.get(`/api/auth/verify-reset-token?token=${token}`)
        if (response.data.success) {
          setTokenValid(true)
        } else {
          toast.error(response.data.message)
          navigate('/login')
        }
      } catch {
        toast.error('Invalid or expired reset link')
        navigate('/login')
      } finally {
        setVerifying(false)
      }
    }

    verifyToken()
  }, [token, navigate])

  const handleResetPassword = async (e) => {
    e.preventDefault()

    if (!newPassword || !confirmPassword) {
      toast.error('All fields are required')
      return
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    try {
      const response = await axios.post('/api/auth/reset-password', {
        token,
        newPassword
      })

      if (response.data.success) {
        toast.success('Password reset successfully!')
        navigate('/login')
      } else {
        toast.error(response.data.message)
      }
    } catch {
      toast.error('Failed to reset password')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center'>
        <div className='text-white text-xl'>Verifying reset link...</div>
      </div>
    )
  }

  if (!tokenValid) {
    return null
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4'>
      <form onSubmit={handleResetPassword} className="border-2 border-purple-500/50 bg-white/10 backdrop-blur-xl text-white p-8 flex flex-col gap-6 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="font-bold text-3xl bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Reset Password
        </h2>

        {/* New Password */}
        <div className="relative">
          <div className="flex items-center">
            <input
              onChange={(e) => setNewPassword(e.target.value)}
              value={newPassword}
              type={showPassword ? "text" : "password"}
              className="flex-1 p-3 border border-purple-400/50 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-300 transition"
              placeholder='New Password'
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 text-purple-300 hover:text-purple-400 transition"
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <div className="flex items-center">
            <input
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
              type={showConfirmPassword ? "text" : "password"}
              className="flex-1 p-3 border border-purple-400/50 bg-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-300 transition"
              placeholder='Confirm Password'
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 text-purple-300 hover:text-purple-400 transition"
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
        </div>

        {/* Password Match Indicator */}
        {newPassword && confirmPassword && (
          <div className="text-sm">
            {newPassword === confirmPassword ? (
              <span className="text-green-400">✓ Passwords match</span>
            ) : (
              <span className="text-red-400">✗ Passwords do not match</span>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || newPassword !== confirmPassword}
          className="py-3 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-lg cursor-pointer font-medium transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className='text-sm text-gray-400 text-center'>
          Back to <span onClick={() => navigate('/login')} className='font-medium text-purple-400 cursor-pointer hover:text-purple-300 transition'>Login</span>
        </p>
      </form>
    </div>
  )
}

export default ResetPasswordPage
