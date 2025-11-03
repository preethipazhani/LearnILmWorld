import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Filter,
  Star,
  Globe,
  Clock,
  User,
  MapPin,
  ChevronDown,
  X,
  Play,
  Heart
} from 'lucide-react'
import axios from 'axios'
import { motion } from 'framer-motion'

/** Trainer types: demoVideo optional */
interface Trainer {
  _id: string
  name?: string
  email?: string
  profile?: {
    bio?: string
    languages?: string[]
    trainerLanguages?: Array<{
      language?: string
      proficiency?: string
      teachingLevel?: string[]
    }>
    experience?: number
    hourlyRate?: number
    avatar?: string
    imageUrl?: string         // <-- primary image field from your schema
    location?: string
    specializations?: string[]
    isAvailable?: boolean
    averageRating?: number
    totalBookings?: number
    demoVideo?: string // optional demo video URL (YouTube or MP4)
  }
  stats?: {
    rating?: number
    totalSessions?: number
  }
}

const Trainer: React.FC = () => {
  // ---------- hooks (always declared in same order) ----------
  const [trainers, setTrainers] = useState<Trainer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    language: '',
    minRate: '',
    maxRate: '',
    experience: '',
    specialization: '',
    rating: '',
    sortBy: 'rating'
  })
  // which trainer is currently showing a player (id) — only one at a time
  const [openVideoId, setOpenVideoId] = useState<string | null>(null)

  // local favorites state (UI-only example)
  const [favorites, setFavorites] = useState<Record<string, boolean>>({})

  // ref for video element map (not used for attaching listeners here, but handy)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  // ---------- helpers (pure functions) ----------
  const parseNumber = (val: string | number | undefined, fallback = 0) => {
    if (val === undefined || val === null || val === '') return fallback
    const n = Number(val)
    return Number.isFinite(n) ? n : fallback
  }

  const getRating = useCallback((t: Trainer): number => {
    const s = t?.stats?.rating
    const p = t?.profile?.averageRating
    const rv = typeof s === 'number' && !Number.isNaN(s) ? s : (typeof p === 'number' && !Number.isNaN(p) ? p : 0)
    return rv
  }, [])

  const isYouTube = (url?: string) => {
    if (!url) return false
    return url.includes('youtube.com') || url.includes('youtu.be')
  }
  const toYouTubeEmbed = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        const id = url.split('youtu.be/')[1].split(/[?&]/)[0]
        return `https://www.youtube.com/embed/${id}`
      }
      const u = new URL(url)
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
      return url
    } catch {
      return url
    }
  }

  // ---------- data fetching ----------
  useEffect(() => {
    let mounted = true
    const fetchTrainers = async () => {
      try {
        const response = await axios.get('/api/users/trainers')
        let data = Array.isArray(response.data) ? response.data : []
       
        // Keep only verified trainers
        data = data.filter(trainer => trainer.profile.verificationStatus === 'verified')
        
        if (mounted) setTrainers(data)
      } catch (error) {
        console.error('Failed to fetch trainers:', error)
        if (mounted) setTrainers([])
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchTrainers()
    return () => { mounted = false }
  }, [])

  // ---------- derived filtered list (stable hooks) ----------
  const filteredTrainers = useMemo(() => {
    try {
      let list = (Array.isArray(trainers) ? trainers.slice() : []).filter(Boolean) as Trainer[]
      const q = (searchTerm || '').trim().toLowerCase()

      if (q) {
        list = list.filter(trainer => {
          if (!trainer) return false
          const name = (trainer.name || '').toLowerCase()
          const bio = (trainer.profile?.bio || '').toLowerCase()
          const languages = Array.isArray(trainer.profile?.languages) ? trainer.profile!.languages!.map(l => (l || '').toLowerCase()) : []
          const trainerLangs = Array.isArray(trainer.profile?.trainerLanguages) ? trainer.profile!.trainerLanguages!.map(tl => (tl.language || '').toLowerCase()) : []
          const specializations = Array.isArray(trainer.profile?.specializations) ? trainer.profile!.specializations!.map(s => (s || '').toLowerCase()) : []
          return (
            name.includes(q) ||
            bio.includes(q) ||
            languages.some(lang => lang.includes(q)) ||
            trainerLangs.some(lang => lang.includes(q)) ||
            specializations.some(spec => spec.includes(q))
          )
        })
      }

      // Language filter
      if (filters.language && filters.language.trim() !== '') {
        const langQ = filters.language.trim().toLowerCase()
        list = list.filter(trainer => {
          const langs = Array.isArray(trainer.profile?.languages) ? trainer.profile!.languages!.map(l => (l || '').toLowerCase()) : []
          const tlangs = Array.isArray(trainer.profile?.trainerLanguages) ? trainer.profile!.trainerLanguages!.map(tl => (tl.language || '').toLowerCase()) : []
          return langs.some(l => l.includes(langQ)) || tlangs.some(l => l.includes(langQ))
        })
      }

      // Price range
      if (filters.minRate !== '') {
        const min = parseNumber(filters.minRate, 0)
        list = list.filter(trainer => parseNumber(trainer.profile?.hourlyRate, 0) >= min)
      }
      if (filters.maxRate !== '') {
        const max = parseNumber(filters.maxRate, Infinity)
        list = list.filter(trainer => parseNumber(trainer.profile?.hourlyRate, 0) <= max)
      }

      // Experience filter
      if (filters.experience !== '') {
        const minExp = parseNumber(filters.experience, 0)
        list = list.filter(trainer => parseNumber(trainer.profile?.experience, 0) >= minExp)
      }

      // Specialization filter
      if (filters.specialization && filters.specialization.trim() !== '') {
        const specQ = filters.specialization.trim().toLowerCase()
        list = list.filter(trainer => {
          const specs = Array.isArray(trainer.profile?.specializations) ? trainer.profile!.specializations!.map(s => (s || '').toLowerCase()) : []
          return specs.some(s => s.includes(specQ))
        })
      }

      // Rating filter
      if (filters.rating !== '') {
        const minRating = parseNumber(filters.rating, 0)
        list = list.filter(trainer => getRating(trainer) >= minRating)
      }

      // Sorting
      const sorted = list.slice()
      switch (filters.sortBy) {
        case 'rating':
          sorted.sort((a, b) => getRating(b) - getRating(a))
          break
        case 'price_low':
          sorted.sort((a, b) => parseNumber(a.profile?.hourlyRate, 0) - parseNumber(b.profile?.hourlyRate, 0))
          break
        case 'price_high':
          sorted.sort((a, b) => parseNumber(b.profile?.hourlyRate, 0) - parseNumber(a.profile?.hourlyRate, 0))
          break
        case 'experience':
          sorted.sort((a, b) => parseNumber(b.profile?.experience, 0) - parseNumber(a.profile?.experience, 0))
          break
        default:
          break
      }

      return sorted
    } catch (err) {
      console.error('filtering error', err)
      return []
    }
  }, [trainers, searchTerm, filters, getRating])

  // ---------- stable callbacks ----------
  const clearFilters = useCallback(() => {
    setFilters({
      language: '',
      minRate: '',
      maxRate: '',
      experience: '',
      specialization: '',
      rating: '',
      sortBy: 'rating'
    })
    setSearchTerm('')
  }, [])

  const toggleVideo = useCallback((id: string) => {
    setOpenVideoId(prev => (prev === id ? null : id))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // ---------- loading UI early return (hooks declared above) ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-pale-top, #f5f7fb)' }}>
        <div className="loading-dots">
          <div></div><div></div><div></div><div></div>
        </div>
      </div>
    )
  }

  // ---------- render ----------
  return (
    <div className="min-h-screen bg-pale" style={{ background: `linear-gradient(180deg,var(--bg-pale-top),var(--bg-pale-bottom))` }}>
      {/* Floating decorative orbs (kept) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-16 left-8 w-28 h-28 rounded-full" style={{ background: 'var(--brand-teal)', opacity: 0.06, animation: 'floaty 6s ease-in-out infinite' }} />
        <div className="absolute top-40 right-12 w-20 h-20 rounded-full" style={{ background: '#9787F3', opacity: 0.06, animation: 'floaty 6s ease-in-out infinite', animationDelay: '1.8s' }} />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 rounded-full" style={{ background: 'var(--accent-orange)', opacity: 0.04, animation: 'floaty 6s ease-in-out infinite', animationDelay: '3.2s' }} />
      </div>

      {/* Header (smaller) */}
      <header className="relative z-10 bg-white bg-opacity-90 backdrop-blur-lg border-b border-white border-opacity-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <Link to="/" className="flex items-center">
              <div className="text-2xl md:text-3xl font-[Good Vibes] font-extrabold tracking-wide relative inline-flex items-center">
    {/* LEARN */}
    <span className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-lg">
      LEARN
    </span>

    {/* Rotating Globe */}
    <motion.span
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      className="inline-block mx-1 text-3xl"
    >
      🌎
    </motion.span>

    {/* SPHERE */}
    <span className="bg-gradient-to-r from-black via-gray-800 to-gray-700 bg-clip-text text-transparent drop-shadow-lg">
      SPHERE
    </span>

    {/* Optional subtle shine */}
    <motion.div
      className="absolute top-0 left-0 w-full h-full bg-white/20 rounded-full blur-xl pointer-events-none"
      animate={{ x: [-200, 200] }}
      transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
    />
  </div>

            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
         {/* Page title (single-line hero) */}
        <div className="text-center mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 break-keep">
            Find Your Perfect Language Trainer
          </h1>
          {/* Description below the hero line */}
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Connect with expert language trainers from around the world. Start your journey to fluency today.
          </p>
        </div>

        {/* Search + Filters (moved up) */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-4xl px-0">
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search trainers by name, language, or specialization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)] focus:border-[var(--brand-teal)] transition-all duration-200 text-lg"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowFilters(s => !s)}
                  className="flex items-center px-4 py-3 bg-[var(--brand-teal)] text-white rounded-xl hover:bg-[var(--brand-teal)]/90 transition-all duration-200 font-semibold"
                  aria-expanded={showFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  <ChevronDown className={`h-4 w-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </button>

                <button
                  onClick={clearFilters}
                  className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
                >
                  Clear All
                </button>
              </div>
            </div>

            {showFilters && (
              // reduced width + removed background for the filters panel
              <div className="mt-4 p-4 rounded-xl animate-slide-down max-w-2xl mx-auto">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                    <input
                      type="text"
                      placeholder="e.g., English, Spanish"
                      value={filters.language}
                      onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Price ($/hr)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.minRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, minRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Max Price ($/hr)</label>
                    <input
                      type="number"
                      placeholder="100"
                      value={filters.maxRate}
                      onChange={(e) => setFilters(prev => ({ ...prev, maxRate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Experience (years)</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={filters.experience}
                      onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
                    <input
                      type="text"
                      placeholder="e.g., Business, Exam Prep"
                      value={filters.specialization}
                      onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Min Rating</label>
                    <select
                      value={filters.rating}
                      onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    >
                      <option value="">Any Rating</option>
                      <option value="4.5">4.5+ Stars</option>
                      <option value="4.0">4.0+ Stars</option>
                      <option value="3.5">3.5+ Stars</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Sort By</label>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--brand-teal)]"
                    >
                      <option value="rating">Highest Rated</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="experience">Most Experienced</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button onClick={clearFilters} className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium">
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-lg text-gray-600">
            Found <span className="font-bold text-[var(--brand-teal)]">{filteredTrainers.length}</span> trainers
          </p>
        </div>

        {/* Trainers Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredTrainers.map((trainer, index) => {
            const id = trainer._id || `trainer-${index}`

            // PREFER imageUrl (primary) then avatar - uses your schema's imageUrl field.
            const avatar = trainer.profile?.imageUrl || trainer.profile?.avatar || ''

            const rating = getRating(trainer) || 0
            const reviews = parseNumber(trainer.profile?.totalBookings, 0)

            // languages fallback
            const languagesList = (Array.isArray(trainer.profile?.trainerLanguages) && trainer.profile!.trainerLanguages!.length > 0)
              ? trainer.profile!.trainerLanguages!.slice(0, 3).map(tl => tl.language || '')
              : (Array.isArray(trainer.profile?.languages) ? trainer.profile!.languages!.slice(0, 3) : [])

            const demoUrl = trainer.profile?.demoVideo
            const showingVideo = openVideoId === id && !!demoUrl

            return (
              <article
                key={id}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-200 transform hover:scale-105 ring-1 ring-gray-50 flex flex-col"
                style={{ minHeight: 360 }}
              >
                {/* Demo video / poster (stays at top) */}
                {demoUrl ? (
                  <div className="mb-4 relative rounded-lg overflow-hidden bg-gray-100">
                    {!showingVideo ? (
                      <>
                        <div className="w-full h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden">
                          {avatar ? (
                            <img src={avatar} alt={trainer.name || 'Trainer'} className="w-full h-full object-cover brightness-80" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                          )}
                        </div>

                        <button
                          onClick={() => toggleVideo(id)}
                          className="absolute inset-0 flex items-center justify-center"
                          aria-label="Play demo"
                        >
                          <div className="bg-white/95 hover:bg-white p-3 rounded-full shadow-2xl flex items-center justify-center border border-white">
                            <Play className="h-6 w-6 text-[var(--brand-teal)]" />
                          </div>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-full h-44 bg-black">
                          {isYouTube(demoUrl) ? (
                            <iframe
                              title={`demo-${id}`}
                              src={`${toYouTubeEmbed(demoUrl)}?autoplay=0&rel=0`}
                              allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                              className="w-full h-full"
                              frameBorder="0"
                              allowFullScreen
                            />
                          ) : (
                            <video
                              ref={el => { videoRefs.current[id] = el }}
                              src={demoUrl}
                              controls
                              playsInline
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>

                        <button
                          onClick={() => setOpenVideoId(null)}
                          className="absolute top-3 right-3 bg-white/90 hover:bg-white rounded-full p-1 shadow"
                          aria-label="Close video"
                        >
                          <X className="h-4 w-4 text-gray-700" />
                        </button>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="mb-4 w-full h-44 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                    {avatar ? (
                      <img src={avatar} alt={trainer.name || 'Trainer'} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </div>
                )}

                {/* Trainer details (price moved up) */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-[var(--brand-teal)] rounded-lg flex items-center justify-center mr-3 overflow-hidden flex-shrink-0">
                      {avatar ? (
                        <img src={avatar} alt={trainer.name || 'Trainer'} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-white" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{trainer.name || 'Unnamed Trainer'}</h3>
                      <div className="flex items-center text-sm text-gray-600 mt-1 gap-3">
                        <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-sm">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">{rating.toFixed(1)}</span>
                        </div>
                        <span className="text-sm text-gray-500">({reviews} reviews)</span>
                      </div>
                    </div>
                  </div>

                  {/* PRICE: only shown up here */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 bg-[var(--brand-teal)] text-white rounded-full font-semibold">${parseNumber(trainer.profile?.hourlyRate, 25)}/hr</div>
                  </div>
                </div>

                {/* languages */}
                <div className="mb-3 flex flex-wrap gap-2">
                  {languagesList.map((language, idx) => (
                    <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                      {language || '—'}
                    </span>
                  ))}
                </div>

                {/* bio (moved below filters per request; kept short) */}
                <p className="text-gray-600 mb-4 line-clamp-3 flex-1">
                  {trainer.profile?.bio || 'Experienced language trainer helping students achieve fluency through personalized lessons.'}
                </p>

                {/* stats */}
                <div className="flex items-center gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-[var(--brand-teal)]" />
                    <span>{parseNumber(trainer.profile?.experience, 5)}+ years</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-[var(--brand-teal)]" />
                    <span>{trainer.profile?.location || 'Online'}</span>
                  </div>
                </div>

                {/* Bottom CTAs: only heart, View Profile, Book Now */}
                <div className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => toggleFavorite(id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${favorites[id] ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    aria-pressed={!!favorites[id]}
                    aria-label={favorites[id] ? 'Unfavorite' : 'Add to favorites'}
                  >
                    <Heart className="h-4 w-4" />
                    <span className="sr-only">Favorite</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <Link to={`/register`} className="px-3 py-2 bg-[var(--brand-teal)] text-white rounded-md text-sm hover:brightness-95 transition">Sign in to book</Link>
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        {/* no results */}
        {filteredTrainers.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">No trainers found</h3>
            <p className="text-gray-600 mb-8">Try adjusting your search criteria or filters</p>
            <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
          </div>
        )}
      </main>
    </div>
  )
}

export default Trainer
