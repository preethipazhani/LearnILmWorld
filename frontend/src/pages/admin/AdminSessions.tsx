import React, { useState, useEffect } from 'react'
import { Calendar, Clock, Trash2, Video, Edit3, Plus } from 'lucide-react'
import axios from 'axios'

interface Trainer {
  _id: string
  name: string
  email: string
  profile?: string
}

interface Student {
  _id: string
  name: string
  email: string
}

interface Booking {
  _id: string
  student: Student
  paymentStatus: string
}

interface Session {
  _id: string
  title: string
  description?: string
  scheduledDate: string
  duration: number
  language?: string
  level?: string
  trainer?: Trainer
  students?: Student[]
  bookings?: Booking[]
  jitsiLink?: string
  maxStudents?: number
}

const AdminSessions: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingSession, setEditingSession] = useState<Session | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  // -------------------- STATE --------------------
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    maxStudents: 10,
    language: '',
    level: '',
    scheduledDate: '',
    trainerId: '',
    bookingIds: [] as string[],
  })

  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    duration: 60,
    maxStudents: 10,
    language: '',
    level: '',
    scheduledDate: '',
    trainerId: '',
    bookingIds: [] as string[],
  })


  useEffect(() => {
    fetchSessions()
    fetchTrainers()
  }, [])

  const token = localStorage.getItem('token')
  const axiosConfig = { headers: { Authorization: `Bearer ${token}` } }

  // Fetch sessions
  const fetchSessions = async () => {
    setLoading(true)
    try {
      const res = await axios.get('/api/admin/sessions', axiosConfig)
      setSessions(Array.isArray(res.data) ? res.data : [])
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch sessions.')
    } finally {
      setLoading(false)
    }
  }

  // Fetch trainers
  const fetchTrainers = async () => {
    try {
      const res = await axios.get('/api/admin/trainers', axiosConfig)
      setTrainers(res.data || [])
    } catch (err) {
      console.error('Error fetching trainers:', err)
    }
  }

  // Fetch bookings for selected trainer
  const fetchBookingsByTrainer = async (trainerId: string) => {
    try {
      const res = await axios.get(`/api/admin/bookings/trainer/${trainerId}`, axiosConfig)
      setBookings(res.data || [])
    } catch (err) {
      console.error('Error fetching bookings:', err)
    }
  }

  // Handle Create Session
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await axios.post('/api/admin/sessions', formData, axiosConfig)
      alert('Session created successfully!')
      setFormData({
        title: '',
        description: '',
        duration: 60,
        maxStudents: 10,
        language: '',
        level: '',
        scheduledDate: '',
        trainerId: '',
        bookingIds: [],
      })
      fetchSessions()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to create session.')
    }
  }

  // Handle Edit (modal)
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession) return
    try {
      await axios.put(`/api/admin/sessions/${editingSession._id}`, editFormData, axiosConfig)
      alert('Session updated successfully!')
      setEditingSession(null)
      setShowEditModal(false)
      fetchSessions()
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to update session.')
    }
  }

  // Handle Delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return
    try {
      await axios.delete(`/api/admin/sessions/${id}`, axiosConfig)
      fetchSessions()
    } catch (err) {
      console.error(err)
      alert('Failed to delete session')
    }
  }

  // Fetch bookings when trainer changes
  useEffect(() => {
    if (formData.trainerId) fetchBookingsByTrainer(formData.trainerId)
  }, [formData.trainerId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="loading-dots"><div></div><div></div><div></div><div></div></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>
  }

  return (
    <div className="space-y-10 max-w-[1200px] mx-auto">
      {/* CREATE FORM (Always visible) */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Plus className="h-6 w-6 text-[#0ea5a3]" /> Create New Session
        </h2>

        <form onSubmit={handleCreate} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Title"
            className="w-full border p-2 rounded"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <textarea
            placeholder="Description"
            className="w-full border p-2 rounded"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="flex gap-4">
            <input
              type="number"
              placeholder="Duration (min)"
              className="border p-2 rounded w-1/2"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: +e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Max Students"
              className="border p-2 rounded w-1/2"
              value={formData.maxStudents}
              onChange={(e) => setFormData({ ...formData, maxStudents: +e.target.value })}
              required
            />
          </div>

          <div className="flex gap-4">
            <input
              type="text"
              placeholder="Language"
              className="border p-2 rounded w-1/2"
              value={formData.language}
              onChange={(e) => setFormData({ ...formData, language: e.target.value })}
            />
            <select
              className="border p-2 rounded w-1/2"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              required
            >
              <option value="">Select Level</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          <input
            type="datetime-local"
            className="w-full border p-2 rounded"
            value={formData.scheduledDate}
            min={new Date().toISOString().slice(0, 16)} // prevents past dates
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />

          <select
            className="w-full border p-2 rounded"
            value={formData.trainerId}
            onChange={(e) => setFormData({ ...formData, trainerId: e.target.value, bookingIds: [] })}
            required
          >
            <option value="">Select Trainer</option>
            {trainers.map((trainer) => (
              <option key={trainer._id} value={trainer._id}>
                {trainer.name} ({trainer.email})
              </option>
            ))}
          </select>

          {bookings.length > 0 && (
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-700">
                Select Students (Completed Payments Only)
              </label>
              <div className="max-h-40 overflow-y-auto border p-2 rounded flex flex-col gap-2">
                {bookings.map((b) => (
                  <label key={b._id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.bookingIds.includes(b._id)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...formData.bookingIds, b._id]
                          : formData.bookingIds.filter((id) => id !== b._id)
                        setFormData({ ...formData, bookingIds: updated })
                      }}
                    />
                    <span>{b.student?.name} ({b.student?.email})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            type="submit"
            className="px-6 py-2 rounded-md bg-[#0ea5a3] text-white hover:bg-[#0d8b89] mt-4 self-end"
          >
            Create Session
          </button>
        </form>
      </div>

      {/* ALL SESSIONS */}
      <div className="glass-effect rounded-2xl p-8 shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">All Sessions</h2>

        {sessions.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No sessions found</h3>
            <p className="text-gray-600 mb-6">No sessions have been scheduled yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sessions.map((session) => (
              <div key={session._id} className="p-6 bg-white/50 rounded-xl shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{session.title}</h3>
                    <p className="text-gray-600 text-sm mb-1">
                      Trainer: {session.trainer?.name || 'N/A'} • {session.students?.length || 0} student(s)
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(session.scheduledDate).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingSession(session)
                        setEditFormData({
                          title: session.title,
                          description: session.description || '',
                          duration: session.duration,
                          maxStudents: session.maxStudents || 10,
                          language: session.language || '',
                          level: session.level || '',
                          scheduledDate: session.scheduledDate.split('.')[0],
                          trainerId: session.trainer?._id || '',
                          bookingIds: session.bookings?.map((b) => b._id) || [],
                        })
                        setShowEditModal(true)
                      }}
                      className="p-2 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    {session.jitsiLink && (
                      <a
                        href={session.jitsiLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 flex items-center"
                      >
                        <Video className="h-4 w-4" />
                      </a>
                    )}

                    <button
                      onClick={() => handleDelete(session._id)}
                      className="p-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {session.description && (
                  <p className="text-gray-700 mb-3">{session.description}</p>
                )}

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Duration: {session.duration} min
                    {session.language && <>• {session.language}</>}
                    {session.level && <>• {session.level}</>}
                    {session.maxStudents && <>• Max: {session.maxStudents}</>}
                  </div>
                  <div>
                    Jitsi Room:{' '}
                    {session.jitsiLink ? session.jitsiLink.split('/').pop() : 'N/A'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-8">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-[600px] mx-auto">
            <h3 className="text-2xl font-semibold mb-4">Edit Session</h3>
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <input
                type="text"
                placeholder="Title"
                className="w-full border p-2 rounded"
                value={editFormData.title}
                onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="w-full border p-2 rounded"
                value={editFormData.description}
                onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
              />
              <div className="flex gap-4">
                <input
                  type="number"
                  placeholder="Duration (min)"
                  className="border p-2 rounded w-1/2"
                  value={editFormData.duration}
                  onChange={(e) => setEditFormData({ ...editFormData, duration: +e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Max Students"
                  className="border p-2 rounded w-1/2"
                  value={editFormData.maxStudents}
                  onChange={(e) => setEditFormData({ ...editFormData, maxStudents: +e.target.value })}
                />
              </div>

              
              <div className="flex gap-4">
                <input
                  type="text"
                  placeholder="Language"
                  className="border p-2 rounded w-1/2"
                  value={editFormData.language}
                  onChange={(e) => setEditFormData({ ...editFormData, language: e.target.value })}
                />
                <select
                  className="border p-2 rounded w-1/2"
                  value={editFormData.level}
                  onChange={(e) => setEditFormData({ ...editFormData, level: e.target.value })}
                >
                  <option value="">Select Level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <input
                type="datetime-local"
                className="w-full border p-2 rounded"
                value={editFormData.scheduledDate}
                onChange={(e) => setEditFormData({ ...editFormData, scheduledDate: e.target.value })}
                required
              />

              <select
                className="w-full border p-2 rounded"
                value={editFormData.trainerId}
                onChange={(e) => setEditFormData({ ...editFormData, trainerId: e.target.value })}
                required
              >
                <option value="">Select Trainer</option>
                {trainers.map((trainer) => (
                  <option key={trainer._id} value={trainer._id}>
                    {trainer.name} ({trainer.email})
                  </option>
                ))}
              </select>


              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSession(null)
                    setShowEditModal(false)
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0ea5a3] text-white rounded-md hover:bg-[#0d8b89]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminSessions
