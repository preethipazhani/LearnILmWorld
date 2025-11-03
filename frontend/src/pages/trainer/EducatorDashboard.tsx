// src/pages/EducatorDashboard.jsx
import React, { useState, useEffect } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import {
  Home, Users, Calendar, DollarSign, User, Star,
  Video, Globe, LogOut, Menu, X, Plus, Clock,
  MessageSquare, Award, BookOpen, Edit3, Trash2
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'

/* -------------------------
   Trainer sub-pages (all inside same file)
   - TrainerHome
   - TrainerSessions
   - TrainerStudents
   - TrainerReviews
   - TrainerProfile
   ------------------------- */

/* ---------- TrainerHome ---------- */
const TrainerHome = () => {
  const [stats, setStats] = useState({
    totalSessions: 0,
    completedSessions: 0,
    totalEarnings: 0,
    averageRating: 5.0,
    totalStudents: 0,
    upcomingSessions: 0
  })
  const [recentBookings, setRecentBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      const [sessionsRes, bookingsRes, userRes] = await Promise.all([
        axios.get('/api/sessions/my-sessions'),
        axios.get('/api/bookings/trainer-bookings'),
        axios.get('/api/auth/me')
      ])
      const sessions = Array.isArray(sessionsRes.data) ? sessionsRes.data : []
      const bookings = Array.isArray(bookingsRes.data) ? bookingsRes.data : []
      const userData = userRes.data || {}

      setStats({
        totalSessions: sessions.length,
        completedSessions: sessions.filter(s => s.status === 'completed').length,
        upcomingSessions: sessions.filter(s => s.status === 'scheduled').length,
        totalEarnings: userData.stats?.totalEarnings || 0,
        averageRating: userData.stats?.rating || 5.0,
        totalStudents: new Set(bookings.map(b => b.student?._id || b.studentId)).size
      })
      setRecentBookings(bookings.slice(0, 5))
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots">
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome back, Trainer!</h2>
        <p className="text-gray-600 text-lg">Manage your sessions and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-6">
        <StatCard icon={<BookOpen className="h-6 w-6 text-white" />} value={stats.totalSessions} label="Total Sessions" />
        <StatCard icon={<Calendar className="h-6 w-6 text-gray-700" />} value={stats.upcomingSessions} label="Upcoming" />
        <StatCard icon={<Star className="h-6 w-6 text-gray-700" />} value={stats.completedSessions} label="Completed" />
        <StatCard icon={<DollarSign className="h-6 w-6 text-gray-700" />} value={`$${stats.totalEarnings}`} label="Total Earnings" />
        <StatCard icon={<Users className="h-6 w-6 text-white" />} value={stats.totalStudents} label="Students" />
        <StatCard icon={<Award className="h-6 w-6 text-gray-700" />} value={stats.averageRating} label="Rating" />
      </div>

      {/* Recent Bookings */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Recent Bookings</h3>
          <Link to="/trainer/students" className="text-accent hover:text-accent-dark font-medium">View All Students</Link>
        </div>

        {recentBookings.length > 0 ? (
          <div className="space-y-4">
            {recentBookings.map((booking) => (
              <div key={booking._id || booking.id} className="p-4 bg-white bg-opacity-50 rounded-xl flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent to-soft-coral rounded-xl flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{booking.studentName || booking.student?.name}</div>
                    <div className="text-gray-600">${booking.amount} • {new Date(booking.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No bookings yet</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* Small helper StatCard component */
const StatCard = ({ icon, value, label }) => (
  <div className="glass-effect rounded-2xl p-6 shadow-xl text-center">
    <div className="w-12 h-12 bg-gradient-to-br from-accent to-soft-coral rounded-xl flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <div className="text-2xl font-bold text-gray-900">{value}</div>
    <div className="text-gray-600">{label}</div>
  </div>
)

/* ---------- TrainerSessions ---------- */
const TrainerSessions = () => {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchSessions() }, [])

  const fetchSessions = async () => {
    try {
      const res = await axios.get('/api/sessions/my-sessions')
      setSessions(Array.isArray(res.data) ? res.data : [])
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }

  const updateSessionStatus = async (sessionId, status) => {
    try {
      await axios.put(`/api/sessions/${sessionId}/status`, { status })
      fetchSessions()
    } catch (err) {
      console.error('Failed to update session status:', err)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots"><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Sessions</h2>
          <Link to="/trainer/students" className="btn-primary">Create New Session</Link>
        </div>

        {sessions.length > 0 ? (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session._id || session.id} className="p-6 bg-white bg-opacity-50 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                    <p className="text-gray-600">{(session.students || []).length} student(s) • {session.duration} minutes</p>
                    <p className="text-sm text-gray-500">{new Date(session.scheduledDate).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium mb-2 ${
                      session.status === 'completed' ? 'bg-green-100 text-green-800' :
                      session.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                      session.status === 'active' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>{session.status}</div>

                    <div className="flex space-x-2">
                      {session.status === 'scheduled' && (
                        <button onClick={() => updateSessionStatus(session._id || session.id, 'active')} className="btn-primary btn-sm">Start Session</button>
                      )}

                      {session.status === 'active' && (
                        <>
                          <a href={session.jitsiLink} target="_blank" rel="noreferrer" className="btn-primary btn-sm flex items-center">
                            <Video className="h-4 w-4 mr-2" /> Join
                          </a>
                          <button onClick={() => updateSessionStatus(session._id || session.id, 'completed')} className="btn-secondary btn-sm">End Session</button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {session.description && <p className="text-gray-600 mb-4">{session.description}</p>}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" /> Duration: {session.duration} minutes
                    {session.language && <><span className="mx-2">•</span> Language: {session.language}</>}
                    {session.level && <><span className="mx-2">•</span> Level: {session.level}</>}
                  </div>
                  <div>Jitsi Room: {session.jitsiRoomName}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions yet</h3>
            <p className="text-gray-600 mb-6">Create your first session with your students</p>
            <Link to="/trainer/students" className="btn-primary">View Students</Link>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- TrainerStudents ---------- */
const TrainerStudents = () => {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedBookings, setSelectedBookings] = useState([])
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    duration: 60,
    language: '',
    level: 'beginner',
    scheduledDate: '',
    scheduledTime: ''
  })

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings/trainer-bookings')
      setBookings(Array.isArray(res.data) ? res.data.filter(b => b.paymentStatus === 'completed') : [])
    } catch (err) {
      console.error('Failed to fetch bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSession = async (e) => {
    e.preventDefault()
    if (selectedBookings.length === 0) {
      alert('Please select at least one student')
      return
    }
    try {
      const scheduledDateTime = new Date(`${sessionData.scheduledDate}T${sessionData.scheduledTime}`)
      await axios.post('/api/sessions', {
        ...sessionData,
        bookingIds: selectedBookings,
        scheduledDate: scheduledDateTime.toISOString()
      })
      setShowCreateModal(false)
      setSelectedBookings([])
      setSessionData({ title: '', description: '', duration: 60, language: '', level: 'beginner', scheduledDate: '', scheduledTime: '' })
      fetchBookings()
    } catch (err) {
      console.error('Failed to create session:', err)
      alert('Failed to create session')
    }
  }

  const toggleBookingSelection = (bookingId) => {
    setSelectedBookings(prev => prev.includes(bookingId) ? prev.filter(id => id !== bookingId) : [...prev, bookingId])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots"><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Students</h2>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center">
            <Plus className="h-5 w-5 mr-2" /> Create Session
          </button>
        </div>

        {bookings.length > 0 ? (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking._id || booking.id} className="p-6 bg-white bg-opacity-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-accent to-soft-coral rounded-xl flex items-center justify-center mr-4">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{booking.studentName || booking.student?.name}</div>
                      <div className="text-gray-600">{booking.student?.email}</div>
                      <div className="text-sm text-gray-500">Booked on {new Date(booking.createdAt).toLocaleDateString()} • ${booking.amount}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium mb-2 ${booking.sessionId ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                      {booking.sessionId ? 'Session Created' : 'Awaiting Session'}
                    </div>

                    {!booking.sessionId && (
                      <label className="flex items-center cursor-pointer">
                        <input type="checkbox" checked={selectedBookings.includes(booking._id || booking.id)} onChange={() => toggleBookingSelection(booking._id || booking.id)} className="mr-2" />
                        <span className="text-sm text-gray-600">Select for session</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students yet</h3>
            <p className="text-gray-600">Students will appear here after they book sessions with you</p>
          </div>
        )}
      </div>

      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create New Session</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-6 w-6" /></button>
            </div>

            <form onSubmit={handleCreateSession} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Students ({selectedBookings.length})</label>
                <div className="text-sm text-gray-600">
                  {selectedBookings.length === 0 ? 'Please select students from the list above' : `${selectedBookings.length} student(s) selected`}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">Session Title</label>
                  <input id="title" type="text" value={sessionData.title} onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))} className="input-field" placeholder="e.g., English Conversation Practice" required />
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-700 mb-2">Duration (minutes)</label>
                  <select id="duration" value={sessionData.duration} onChange={(e) => setSessionData(prev => ({ ...prev, duration: parseInt(e.target.value, 10) }))} className="input-field">
                    <option value={30}>30 minutes</option>
                    <option value={60}>60 minutes</option>
                    <option value={90}>90 minutes</option>
                    <option value={120}>120 minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea id="description" value={sessionData.description} onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))} className="input-field" rows={3} placeholder="Describe what you'll cover in this session..." />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="language" className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <input id="language" type="text" value={sessionData.language} onChange={(e) => setSessionData(prev => ({ ...prev, language: e.target.value }))} className="input-field" placeholder="e.g., English, Spanish" />
                </div>

                <div>
                  <label htmlFor="level" className="block text-sm font-semibold text-gray-700 mb-2">Level</label>
                  <select id="level" value={sessionData.level} onChange={(e) => setSessionData(prev => ({ ...prev, level: e.target.value }))} className="input-field">
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="scheduledDate" className="block text-sm font-semibold text-gray-700 mb-2">Session Date</label>
                  <input id="scheduledDate" type="date" value={sessionData.scheduledDate} onChange={(e) => setSessionData(prev => ({ ...prev, scheduledDate: e.target.value }))} className="input-field" min={new Date().toISOString().split('T')[0]} required />
                </div>

                <div>
                  <label htmlFor="scheduledTime" className="block text-sm font-semibold text-gray-700 mb-2">Session Time</label>
                  <input id="scheduledTime" type="time" value={sessionData.scheduledTime} onChange={(e) => setSessionData(prev => ({ ...prev, scheduledTime: e.target.value }))} className="input-field" required />
                </div>
              </div>

              <div className="flex space-x-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={selectedBookings.length === 0} className="flex-1 btn-primary disabled:opacity-50">Create Session</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- TrainerReviews ---------- */
const TrainerReviews = () => {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0, ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } })

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    try {
      const res = await axios.get('/api/reviews/trainer-reviews')
      const reviewsData = Array.isArray(res.data) ? res.data : []
      setReviews(reviewsData)

      const totalReviews = reviewsData.length
      const averageRating = totalReviews > 0 ? reviewsData.reduce((s, r) => s + (r.rating || 0), 0) / totalReviews : 0
      const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      reviewsData.forEach(r => { const rInt = Math.round(r.rating || 0); if (ratingDistribution[rInt] !== undefined) ratingDistribution[rInt]++ })

      setStats({ averageRating: Math.round(averageRating * 10) / 10, totalReviews, ratingDistribution })
    } catch (err) {
      console.error('Failed to fetch reviews:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots"><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass-effect rounded-2xl p-8 shadow-xl text-center">
          <div className="text-5xl font-bold text-accent mb-2">{stats.averageRating}</div>
          <div className="flex justify-center mb-2">
            {[...Array(5)].map((_, i) => (<Star key={i} className={`h-6 w-6 ${i < Math.floor(stats.averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
          </div>
          <div className="text-gray-600">Average Rating</div>
          <div className="text-sm text-gray-500 mt-2">{stats.totalReviews} total reviews</div>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-xl">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Rating Distribution</h3>
          <div className="space-y-3">
            {[5,4,3,2,1].map(rating => (
              <div key={rating} className="flex items-center">
                <span className="w-8 text-sm font-medium">{rating}</span>
                <Star className="h-4 w-4 text-yellow-400 fill-current mx-2" />
                <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
                  <div className="bg-accent h-2 rounded-full" style={{ width: `${stats.totalReviews > 0 ? (stats.ratingDistribution[rating] / stats.totalReviews) * 100 : 0}%` }} />
                </div>
                <span className="text-sm text-gray-600 w-8">{stats.ratingDistribution[rating]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">All Reviews</h3>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map(review => (
              <div key={review._id || review.id} className="p-6 bg-white bg-opacity-50 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-soft-coral rounded-full flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">{review.studentName || review.student?.name}</div>
                      <div className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (<Star key={i} className={`h-4 w-4 ${i < (review.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}
                  </div>
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reviews yet</h3>
            <p className="text-gray-600">Reviews from students will appear here after completed sessions</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ---------- TrainerProfile (form) ---------- */
const TrainerProfile = () => {
  const { user, updateProfile } = useAuth()
  const CURRENT_YEAR = new Date().getFullYear()

  const defaultProfile = {
    bio: user?.profile?.bio || '',
    imageUrl: user?.profile?.imageUrl || '',
    avatar: user?.profile?.avatar || '',
    languages: Array.isArray(user?.profile?.languages) ? [...user.profile.languages] : [],
    trainerLanguages: Array.isArray(user?.profile?.trainerLanguages) ? [...user.profile.trainerLanguages] : [],
    experience: user?.profile?.experience ?? 0,
    hourlyRate: user?.profile?.hourlyRate ?? 25,
    phone: user?.profile?.phone || '',
    location: user?.profile?.location || '',
    specializations: Array.isArray(user?.profile?.specializations) ? [...user.profile.specializations] : [],
    certifications: Array.isArray(user?.profile?.certifications) 
      ? user.profile.certifications.map(cert => ({
          name: cert.name || '',
          issuer: cert.issuer || '',
          year: cert.year || null,
          certificateImage: cert.certificateImage || '',
          certificateLink: cert.certificateLink || ''
        }))
      : [],
    availability: Array.isArray(user?.profile?.availability) ? [...user.profile.availability] : [],
    profileImages: Array.isArray(user?.profile?.profileImages) ? [...user.profile.profileImages] : [],
    socialMedia: {
      instagram: (user?.profile?.socialMedia && (user.profile.socialMedia.get ? user.profile.socialMedia.get('instagram') : user.profile.socialMedia.instagram)) || '',
      youtube: (user?.profile?.socialMedia && (user.profile.socialMedia.get ? user.profile.socialMedia.get('youtube') : user.profile.socialMedia.youtube)) || '',
      linkedin: (user?.profile?.socialMedia && (user.profile.socialMedia.get ? user.profile.socialMedia.get('linkedin') : user.profile.socialMedia.linkedin)) || ''
    },
    teachingStyle: user?.profile?.teachingStyle || 'Conversational',
    studentAge: Array.isArray(user?.profile?.studentAge) ? [...user.profile.studentAge] : [],
    demoVideo: user?.profile?.demoVideo || '',
    isAvailable: user?.profile?.isAvailable ?? true,
    totalBookings: user?.profile?.totalBookings ?? 0,
    averageRating: user?.profile?.averageRating ?? 5.0,
  }

  const certFields = [
    { key: 'name', type: 'text', placeholder: 'Certification Name' },
    { key: 'issuer', type: 'text', placeholder: 'Issuer' },
    { key: 'year', type: 'number', placeholder: 'Year', min: 1950, max: CURRENT_YEAR },
    { key: 'certificateLink', type: 'url', placeholder: 'https://certificate-link.com' }
  ]


  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profile: defaultProfile
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [newLanguage, setNewLanguage] = useState('')
  const [newSpecialization, setNewSpecialization] = useState('')
  const [newStudentAge, setNewStudentAge] = useState('')
  const [newProfileImage, setNewProfileImage] = useState('')

  useEffect(() => {
    // ensure availability has 7 days (preserve existing)
    const ALL_DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday']
    const existing = (formData.profile.availability || []).reduce((acc, a) => { if (a && a.day) acc[a.day] = a; return acc }, {})
    const availability = ALL_DAYS.map(d => existing[d] || { day: d, startTime: null, endTime: null, available: false })
    if ((formData.profile.availability || []).length < 7) {
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, availability } }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* --- Generic handlers --- */
  const handleChange = (e:any) => {
    const { name, value, type, checked } = e.target
    if (name.startsWith('profile.socialMedia.')) {
      const key = name.split('.')[2]
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, socialMedia: { ...prev.profile.socialMedia, [key]: value } } }))
      return
    }
    if (name.startsWith('profile.')) {
      const key = name.replace('profile.', '')
      const parsed = (key === 'experience' || key === 'hourlyRate') ? (parseFloat(value) || 0) : value
      setFormData(prev => ({ ...prev, profile: { ...prev.profile, [key]: parsed } }))
      return
    }
    // top-level fields (name, email)
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const addToArray = (field:any, value:unknown) => {
    if (!value) return
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: [...(prev.profile[field] || []), value] } }))
  }
  const removeFromArray = (field:any, index:number) => {
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: (prev.profile[field] || []).filter((_, i) => i !== index) } }))
  }

  const updateObjectInArray = (field, index, subfield, value) => {
    setFormData(prev => {
      const arr = Array.isArray(prev.profile[field]) ? [...prev.profile[field]] : []
      arr[index] = { ...arr[index], [subfield]: value }
      return { ...prev, profile: { ...prev.profile, [field]: arr } }
    })
  }

  const addComplexToArray = (field, obj) => {
    setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: [...(prev.profile[field] || []), obj] } }))
  }

  const updateTrainerLangLevels = (index, value) => {
    const levels = String(value).split(',').map(s => s.trim()).filter(Boolean)
    updateObjectInArray('trainerLanguages', index, 'teachingLevel', levels)
  }

  const updateAvailability = (index, subfield, value) => {
    setFormData(prev => {
      const arr = Array.isArray(prev.profile.availability) ? [...prev.profile.availability] : []
      arr[index] = { ...arr[index], [subfield]: value }
      // if available turned off, clear times
      if (subfield === 'available' && !value) { arr[index].startTime = null; arr[index].endTime = null }
      return { ...prev, profile: { ...prev.profile, availability: arr } }
    })
  }

  const updateCertYear = (index, value) => {
    const year = value ? parseInt(value, 10) : null
    updateObjectInArray('certifications', index, 'year', year)
  }

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files && e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl = reader.result as string
        setFormData(prev => ({
          ...prev,
          profile: {
            ...prev.profile,
            imageUrl: dataUrl
          }
        }))
      }
      reader.readAsDataURL(file)
    }
  
    const handleRemoveImage = () => {
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          imageUrl: ''
        }
      }))
    }

  const handleSubmit = async (e:any) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    // local validation for cert years
    const badCert = (formData.profile.certifications || []).some(c => c.year && (c.year < 1950 || c.year > CURRENT_YEAR))
    if (badCert) {
      setError(`Certification year must be between 1950 and ${CURRENT_YEAR}`)
      setLoading(false); return
    }

    try {

      if (!user) {
      setError('User not found')
      setLoading(false)
      return
    }
    
       const updatedProfile = {
      ...user.profile,       // existing fields
      ...formData.profile    // updated fields from form
    }

      const result = await updateProfile({ 
      ...formData, 
      profile: updatedProfile 
    }) // expects updateProfile from context to return { success, error? }

      if (result?.success) setSuccess('Profile updated successfully!')
      else setError(result?.error || 'Failed to update profile')
    } catch (err) {
      console.error(err); setError('Failed to update profile')
    } finally { setLoading(false) }
  }

  // prefer imageUrl (primary) > avatar > first profileImages > empty
  const getPrimaryImage = () => {
    return formData.profile?.imageUrl || formData.profile?.avatar || (Array.isArray(formData.profile?.profileImages) && formData.profile.profileImages[0]) || ''
  }

  return (
    <div className="space-y-8">
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
          
        </div>

         {/* Image: preview + URL + file upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Profile image</label>

            <div className="flex items-start gap-4">
              <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border">
                {formData.profile.imageUrl ? (
                  // preview (base64 or remote url)
                  // eslint-disable-next-line jsx-a11y/img-redundant-alt
                  <img src={formData.profile.imageUrl} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xs text-slate-500 px-2 text-center">No image</div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="url"
                  id="profile.imageUrl"
                  name="profile.imageUrl"
                  value={formData.profile.imageUrl}
                  onChange={handleChange}
                  placeholder="Paste image URL (or upload below)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0ea5a3] focus:border-[#0ea5a3] transition-all duration-300 font-medium"
                />

                <div className="flex gap-2 items-center">
                  <label className="cursor-pointer inline-block">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <span className="px-4 py-2 rounded-lg bg-gray-100 border font-medium text-sm hover:bg-gray-200">Upload image</span>
                  </label>

                  {formData.profile.imageUrl && (
                    <button type="button" onClick={handleRemoveImage} className="px-4 py-2 rounded-lg bg-red-50 border text-red-600 text-sm hover:bg-red-100">
                      Remove
                    </button>
                  )}
                </div>

                <div className="text-xs text-slate-500">Tip: Paste an image URL or upload a file. Upload uses a local base64 preview — to persist, your updateProfile should accept image data or you should upload to storage and save resulting URL.</div>
              </div>
            </div>
          </div>

        {success && <div className="bg-green-50 border-2 border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6">{success}</div>}
        {error && <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Basic Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name</label>
                <input name="name" value={formData.name} onChange={handleChange} className="input-field" required />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                <input name="email" type="email" value={formData.email} className="input-field bg-gray-50" disabled />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                <input name="profile.phone" value={formData.profile.phone} onChange={handleChange} className="input-field" placeholder="+1 (555) 123-4567" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <input name="profile.location" value={formData.profile.location} onChange={handleChange} className="input-field" placeholder="City, Country" />
              </div>

              
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bio</label>
              <textarea name="profile.bio" value={formData.profile.bio} onChange={handleChange} className="input-field" rows={4} placeholder="Tell students about yourself..." />
            </div>
          </div>


          {/* Resume Upload */}
          {/* <div className="mt-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Upload Resume (PDF)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                const reader = new FileReader()
                reader.onload = () => {
                  const dataUrl = reader.result as string
                  setFormData(prev => ({
                    ...prev,
                    profile: { ...prev.profile, resume: dataUrl }
                  }))
                }
                reader.readAsDataURL(file)
              }}
              className="input-field"
            />
            {formData.profile.resume && (
              <div className="mt-2">
                <a href={formData.profile.resume} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  View Uploaded Resume
                </a>
                <button
                  type="button"
                  className="ml-2 text-red-600"
                  onClick={() => setFormData(prev => ({ ...prev, profile: { ...prev.profile, resume: '' } }))}
                >
                  Remove
                </button>
              </div>
            )}
          </div> */}


          {/* Teaching Info */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Teaching Information</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Years of Experience</label>
                <input type="number" name="profile.experience" value={formData.profile.experience} onChange={handleChange} className="input-field" min={0} step={0.5} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Hourly Rate ($)</label>
                <input type="number" name="profile.hourlyRate" value={formData.profile.hourlyRate} onChange={handleChange} className="input-field" min={1} step={1} />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Teaching Style</label>
                <select name="profile.teachingStyle" value={formData.profile.teachingStyle} onChange={handleChange} className="input-field">
                  <option>Conversational</option>
                  <option>Grammar-focused</option>
                  <option>Immersive</option>
                  <option>Business-oriented</option>
                  <option>Exam Preparation</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Is Available for New Bookings</label>
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={!!formData.profile.isAvailable} onChange={(e) => setFormData(prev => ({ ...prev, profile: { ...prev.profile, isAvailable: e.target.checked } }))} />
                  <span>Yes</span>
                </label>
              </div>
            </div>

            {/* Languages */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Languages</label>
              <ul className="space-y-2 mb-4">
                {(formData.profile.languages || []).map((lang, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    {lang}
                    <button type="button" onClick={() => removeFromArray('languages', idx)} className="text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
              <div className="flex">
                <input type="text" value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} className="input-field flex-1 mr-2" placeholder="Add new language" />
                <button type="button" onClick={() => { addToArray('languages', newLanguage); setNewLanguage('') }} className="btn-primary">Add</button>
              </div>
            </div>

            {/* Specializations */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Specializations</label>
              <ul className="space-y-2 mb-4">
                {(formData.profile.specializations || []).map((spec, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">{spec}
                    <button type="button" onClick={() => removeFromArray('specializations', idx)} className="text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
              <div className="flex">
                <input type="text" value={newSpecialization} onChange={(e) => setNewSpecialization(e.target.value)} className="input-field flex-1 mr-2" placeholder="Add new specialization" />
                <button type="button" onClick={() => { addToArray('specializations', newSpecialization); setNewSpecialization('') }} className="btn-primary">Add</button>
              </div>
            </div>

            {/* Student Age */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Student Age Groups</label>
              <ul className="space-y-2 mb-4">
                {(formData.profile.studentAge || []).map((age, idx) => (
                  <li key={idx} className="flex items-center justify-between bg-gray-100 p-2 rounded">{age}
                    <button type="button" onClick={() => removeFromArray('studentAge', idx)} className="text-red-600">Remove</button>
                  </li>
                ))}
              </ul>
              <div className="flex">
                <input type="text" value={newStudentAge} onChange={(e) => setNewStudentAge(e.target.value)} className="input-field flex-1 mr-2" placeholder="Add new age group (e.g., Kids)" />
                <button type="button" onClick={() => { addToArray('studentAge', newStudentAge); setNewStudentAge('') }} className="btn-primary">Add</button>
              </div>
            </div>

            {/* Trainer Languages (complex) */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Trainer Languages</label>
              {(formData.profile.trainerLanguages || []).map((tl, idx) => (
                <div key={idx} className="bg-gray-100 p-4 rounded mb-4 space-y-2">
                  <input type="text" value={tl.language || ''} onChange={(e) => updateObjectInArray('trainerLanguages', idx, 'language', e.target.value)} className="input-field" placeholder="Language" />
                  <select value={tl.proficiency || 'Fluent'} onChange={(e) => updateObjectInArray('trainerLanguages', idx, 'proficiency', e.target.value)} className="input-field">
                    <option value="Native">Native</option>
                    <option value="Fluent">Fluent</option>
                  </select>
                  <input type="text" value={(tl.teachingLevel || []).join(', ')} onChange={(e) => updateTrainerLangLevels(idx, e.target.value)} className="input-field" placeholder="Teaching Levels (comma-separated)" />
                  <button type="button" onClick={() => removeFromArray('trainerLanguages', idx)} className="text-red-600">Remove</button>
                </div>
              ))}
              <button type="button" onClick={() => addComplexToArray('trainerLanguages', { language: '', proficiency: 'Fluent', teachingLevel: [] })} className="btn-primary">Add Trainer Language</button>
            </div>

            {/* Certifications */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Certifications</label>
              {(formData.profile.certifications || []).map((cert, idx) => (
                <div key={idx} className="bg-gray-100 p-4 rounded mb-4 space-y-2">
                  
                  {certFields.map(f => (
                    <input
                      key={f.key}
                      type={f.type}
                      value={cert[f.key] ?? ''}
                      placeholder={f.placeholder}
                      min={f.min}
                      max={f.max}
                      onChange={(e) => {
                        const val = f.type === 'number' ? parseInt(e.target.value, 10) || null : e.target.value
                        updateObjectInArray('certifications', idx, f.key, val)
                      }}
                      className="input-field"
                    />
                  ))}

                  {/* Certificate Image */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Certificate Image</label>
                    <input type="file" accept="image/*" onChange={(e) => {
                      const file = e.target.files?.[0]; if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => updateObjectInArray('certifications', idx, 'certificateImage', reader.result as string);
                      reader.readAsDataURL(file);
                    }} className="input-field" />
                    {cert.certificateImage && <img src={cert.certificateImage} alt="Cert" className="w-32 h-32 mt-2 object-cover rounded border" />}
                  </div>

                  <button type="button" onClick={() => removeFromArray('certifications', idx)} className="text-red-600">Remove</button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => addComplexToArray  ('certifications', {
                    name: '',
                    issuer: '',
                    year: null,
                    certificateImage: '',
                    certificateLink: ''
                  })
                }
                className="btn-primary"
              >
                Add Certification
              </button>
            </div>


            {/* Availability */}
            <div className="mt-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
              {(formData.profile.availability || []).map((av, idx) => (
                <div key={String(av.day || idx)} className="bg-gray-100 p-4 rounded mb-4 space-y-2">
                  <div className="font-medium capitalize">{av.day}</div>
                  <label className="flex items-center"><input type="checkbox" checked={!!av.available} onChange={(e) => updateAvailability(idx, 'available', e.target.checked)} className="mr-2" /> Available</label>
                  {av.available && (
                    <div className="flex items-center space-x-2">
                      <input type="time" value={av.startTime || ''} onChange={(e) => updateAvailability(idx, 'startTime', e.target.value)} className="input-field" />
                      <span>to</span>
                      <input type="time" value={av.endTime || ''} onChange={(e) => updateAvailability(idx, 'endTime', e.target.value)} className="input-field" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Media & Social */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Media & Social Links</h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Demo Video URL (YouTube)</label>
                <input type="url" name="profile.demoVideo" value={formData.profile.demoVideo} onChange={handleChange} className="input-field" placeholder="https://www.youtube.com/watch?v=..." />
              </div>

              

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram URL</label>
                <input type="url" name="profile.socialMedia.instagram" value={formData.profile.socialMedia.instagram} onChange={handleChange} className="input-field" placeholder="https://instagram.com/username" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube URL</label>
                <input type="url" name="profile.socialMedia.youtube" value={formData.profile.socialMedia.youtube} onChange={handleChange} className="input-field" placeholder="https://youtube.com/channel/..." />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">LinkedIn URL</label>
                <input type="url" name="profile.socialMedia.linkedin" value={formData.profile.socialMedia.linkedin} onChange={handleChange} className="input-field" placeholder="https://linkedin.com/in/username" />
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">{loading ? 'Updating...' : 'Update Profile'}</button>
            <button type="button" onClick={() => { setFormData({ name: user?.name || '', email: user?.email || '', profile: defaultProfile }); setSuccess(''); setError('') }} className="btn-ghost">Reset</button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ---------- Root Dashboard (sidebar + routes) ---------- */
const EducatorDashboard = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/trainer', icon: Home },
    { name: 'Sessions', href: '/trainer/sessions', icon: Calendar },
    { name: 'Students', href: '/trainer/students', icon: Users },
    { name: 'Reviews', href: '/trainer/reviews', icon: Star },
    { name: 'Profile', href: '/trainer/profile', icon: User }
  ]

  // added string type
  const isActive = (path: string) => {
    if (path === '/trainer') return location.pathname === '/trainer' || location.pathname === '/trainer/'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-soft-green via-cream to-soft-coral">
      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white bg-opacity-90 backdrop-blur-lg border-r border-white border-opacity-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between p-6 border-b border-white border-opacity-30">
          <Link to="/" className="flex items-center">
                                <div>
                                    <div className="text-lg font-semibold">LEARN🌎SPHERE</div>
                                    
                                  </div>
                              </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700"><X className="h-6 w-6" /></button>
        </div>

        <div className="p-6">
          <nav className="space-y-2">
            {navigation.map(item => (
              <Link key={item.name} to={item.href} className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`} onClick={() => setSidebarOpen(false)}>
                <item.icon className="h-5 w-5 mr-3" /> {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-white border-opacity-30">
          <button onClick={logout} className="flex items-center w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-300">
            <LogOut className="h-5 w-5 mr-3" /> Sign Out
          </button>
        </div>
      </div>

      <div className="lg:pl-64">
        <div className="bg-white bg-opacity-90 backdrop-blur-lg border-b border-white border-opacity-30 px-6 py-4">
          <div className="flex items-center justify-between">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-gray-500 hover:text-gray-700"><Menu className="h-6 w-6" /></button>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">Rating: <span className="font-semibold text-accent">{user?.stats?.rating || 5.0}</span></div>
              <div className="text-sm text-gray-600">Earnings: <span className="font-semibold text-accent">${user?.stats?.totalEarnings || 0}</span></div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <Routes>
            <Route index element={<TrainerHome />} />
            <Route path="sessions" element={<TrainerSessions />} />
            <Route path="students" element={<TrainerStudents />} />
            <Route path="reviews" element={<TrainerReviews />} />
            <Route path="profile" element={<TrainerProfile />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default EducatorDashboard