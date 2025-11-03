import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../theme.css'

const ForgotPassword: React.FC = () => {
  const { forgotPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      await forgotPassword(email)
      setMessage('Password reset link sent to your email.')
    } catch (err: any) {
      console.error(err)
      setError(err?.response?.data?.message || err?.message || 'Failed to send reset link.')
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
          <h1 className="text-4xl font-bold text-[#9787F3] mb-2">Forgot Password</h1>
          <p className="text-[#9787F3] text-lg font-bold">Enter your email to receive a password reset link</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl bg-white/80 backdrop-blur">
          {message && (
            <div className="bg-green-50 border-2 border-green-200 font-bold text-green-700 px-4 py-3 rounded-xl mb-6">
              <span>{message}</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 font-bold rounded-xl mb-6">
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-[#2D274B]700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9787F3] h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#CBE56A] font-bold disabled:opacity-50 rounded-xl disabled:cursor-not-allowed flex items-center justify-center text-lg py-3 "
              aria-disabled={loading}
            >
              {loading ? (
                <div className="loading-dots" aria-hidden>
                  <div></div><div></div><div></div><div></div>
                </div>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#2D274B] font-bold">
              Remember your password?{' '}
              <Link to="/login" className="font-semibold" style={{ color: '#2D274B' }}>
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword
