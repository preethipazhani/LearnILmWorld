import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth, User } from '../contexts/AuthContext'
import '../theme.css' // ensure theme is imported (or import once in index.tsx)


interface LoginResult {
  success: boolean
  user?: User
  error?: string
  data?: any
}

const Login: React.FC = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const extractUserObject = (result: any) => {
    if (!result || typeof result !== 'object') return null

    // Common shapes:
    // { user: {...}, success: true }
    // { data: { user: {...} } }
    // { data: {...userProps...} }
    // { user: {...} } or directly user object
    if ('user' in result && result.user) return result.user
    if ('data' in result) {
      if (result.data?.user) return result.data.user
      // if data itself looks like a user object
      return result.data
    }
    // fallback when login returns the user directly
    return result
  }

  const getRoleFromObject = (userObj: any) => {
    if (!userObj) return ''
    // role could be in different keys or nested
    return (
      userObj.role ??
      userObj.roleName ??
      userObj?.user?.role ??
      // roles array case
      (Array.isArray(userObj.roles) && userObj.roles[0]) ??
      ''
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  try {
    const result = await login(formData.email, formData.password)
    console.log('Login result:', result)

    if (!result.success) {
      // show the exact message from backend
      setError(result.error || 'Login failed. Please check credentials.')
      return
    }

    // pull user object if needed
    const userObj = result.user || result.data || result

    const role = (
      userObj?.role ||
      userObj?.roleName ||
      (Array.isArray(userObj?.roles) && userObj.roles[0]) ||
      ''
    ).toString().toLowerCase()

    //  After successful login
    const redirectPath = localStorage.getItem('redirectAfterLogin');

    if (redirectPath) {
      localStorage.removeItem('redirectAfterLogin');
      navigate(redirectPath, { replace: true });
    } else if (role.includes('student')) {
      navigate('/student', { replace: true });
    } else if (role.includes('trainer') || role.includes('educator')) {
      navigate('/trainer', { replace: true });
    } else if (role.includes('admin')) {
      navigate('/admin', { replace: true });
    } else {
      navigate('/main', { replace: true });
    }
  } catch (err: any) {
    console.error('Login error', err)
    setError(err?.response?.data?.message || err?.message || 'Login failed')
  } finally {
    setLoading(false)
  }
}



   return (
    <div
      className="min-h-screen flex items-center justify-center py-12 bg-[#dc8d33]"
      // style={{
      //   background: 'linear-gradient(180deg, #F5F3FF, #EAEFFE)',
      // }}
    >
      {/* Decorative orbs */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-20 left-10 w-32 h-32 rounded-full"
          style={{
            background: '#9787F3',
            opacity: 0.06,
            animation: 'floaty 6s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-44 right-16 w-24 h-24 rounded-full"
          style={{
            background: '#9787F3',
            opacity: 0.06,
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '1.8s',
          }}
        />
        <div
          className="absolute bottom-24 left-1/4 w-40 h-40 rounded-full"
          style={{
            background: '#CBE56A',
            opacity: 0.04,
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '3.2s',
          }}
        />
      </div>

      <div className="max-w-md w-full mx-4 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-[#2D274B] mb-2">Welcome Back</h1>
          <p className="text-[#2D274B] text-lg font-extrabold">Sign in to Continue your Learning Journey</p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl bg-white/80 backdrop-blur">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center gap-2">⚠️ <span>{error}</span></div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" aria-live="polite">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-base font-semibold text-[#2D274B] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9787F3] h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-base font-semibold text-[#2D274B] mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#9787F3] h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] hover:text-[#4B437C] transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password */}
            <div className="text-right mt-2">
              <Link
                to="/forget-password"
                className="text-sm font-semibold hover:underline"
                style={{ color: '#2D274B' }}
              >
                Forgot Password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center text-base sm:text-lg py-3 rounded-xl font-semibold text-[#2D274B] hover:opacity-90 transition"
              style={{ backgroundColor: '#CBE56A' }}
              aria-disabled={loading}
            >
              {loading ? (
                <div className="loading-dots" aria-hidden>
                  <div></div><div></div><div></div><div></div>
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#4B437C] font-bold">
              Don't have an account? {' '}
              <Link to="/register" className="font-bold hover:underline" style={{ color: '#2D274B' }}>
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
