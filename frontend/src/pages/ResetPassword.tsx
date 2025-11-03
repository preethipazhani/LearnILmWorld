import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../theme.css'

const ResetPassword: React.FC = () => {
  const { resetPassword } = useAuth()
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    if (!token) {
      setError('Invalid reset link')
      setLoading(false)
      return
    }

    try {
      await resetPassword(token, password)
      setSuccess('Password reset successful! You can now log in.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || err?.message || 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen bg-pale flex items-center justify-center py-12 bg-[#2D274B]"
      // style={{
      //   background: `linear-gradient(180deg,var(--bg-pale-top),var(--bg-pale-bottom))`,
      // }}
    >

      {/* Decorative subtle orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full"
          style={{
            background: 'var(--brand-#9787F3)',
            opacity: 0.06,
            animation: 'floaty 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-44 right-16 w-24 h-24 rounded-full"
          style={{
            background: 'var(--#9787F3-mid)',
            opacity: 0.06,
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '1.8s',
          }}
        />
        <div
          className="absolute bottom-24 left-1/4 w-40 h-40 rounded-full"
          style={{
            background: 'var(--accent-orange)',
            opacity: 0.04,
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '3.2s',
          }}
        />
      </div>

      <div className="max-w-md w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#9787F3] mb-2">Reset Password</h1>
          <p className="text-[#9787F3] text-lg font-bold">Enter your new password below</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl  bg-white/80 backdrop-blur">
          {success && (
            <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">
              <span>{success}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-[#2D274B] mb-2">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9787F3]400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3 transition-all duration-300"
                  placeholder="Enter new password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#2D274B]400 hover:text-[#2D274B]600 transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CBE56A] rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-lg py-3"
              aria-disabled={loading}
            >
              {loading ? (
                <div className="loading-dots" aria-hidden>
                  <div></div><div></div><div></div><div></div>
                </div>
              ) : (
                <>
                  Reset Password
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#2D274B] font-bold">
              Remembered your password?{' '}
              <Link to="/login" className="font-bold hover:underline" style={{ color: '#9787F3' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
