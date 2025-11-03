import React, { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, GraduationCap, BookOpen } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import '../theme.css'

import 'react-phone-input-2/lib/style.css'
import 'flag-icons/css/flag-icons.min.css'
import PhoneInput from 'react-phone-input-2'



// For TypeScript type safety
interface Certificate {
  name: string
  issuer: string
  certificateLink: string
  issuedDate: string
  certificateImage?: File | string
}

interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  role: 'student' | 'trainer'
  education: string
  experience: string
  certificates: Certificate[]
  dob: string
  bio: string
  resume: File | string | null // can be file or URL
  phone: string
}


const Register: React.FC = () => {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [searchParams] = useSearchParams()
  const defaultRole = (searchParams.get('role') || 'student') as string

  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole as 'student'| 'trainer',
    // Trainer-specific fields
    education: '', // e.g., "M.A. in English"
    certificates: [],
    experience: '', // e.g., "5 years teaching English"
    dob: '',
    bio: '',
    resume: null,
    phone: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }


    const addCertificate = (certificate: Certificate) => {
    setFormData(prev => ({
      ...prev,
      certificates: [...(prev.certificates || []), certificate],
    }))
  }



  const removeCertificate = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index),
    }))
  }

  const handleCertificateChange = (index: number, field: string, value: string) => {
    const newCerts = [...formData.certificates]
    newCerts[index][field as keyof typeof newCerts[0]] = value
    setFormData(prev => ({ ...prev, certificates: newCerts }))
  }

  // Simple validation function
  const validatePhoneNumber = (phone: string) => {
    const cleanedPhone = phone.replace(/\s|-/g, ''); // remove spaces & dashes
    const phoneRegex = /^[0-9]{10,15}$/; // allows only digits, between 10 and 15
    return phoneRegex.test(cleanedPhone);
  };

  // Calculate max allowed DOB (user must be 18+)
  const today = new Date()
  const maxDOB = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
  const maxDOBString = maxDOB.toISOString().split('T')[0] // yyyy-mm-dd


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      setLoading(false)
      return
    }

    // Trainer age validation
    if (formData.role === 'trainer') {
      const dob = new Date(formData.dob)
      const age = today.getFullYear() - dob.getFullYear()
      const hasBirthdayPassed =
        today.getMonth() > dob.getMonth() ||
        (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate())

      const actualAge = hasBirthdayPassed ? age : age - 1

      if (actualAge < 18) {
        setError('Trainer must be at least 18 years old.')
        setLoading(false)
        return
      }

      
      if (!validatePhoneNumber(formData.phone)) {
        setError("Please enter a valid phone number (10–15 digits).");
        return;
      }
    }


    const experienceYears = parseInt(formData.experience) || 0;
    // Ensure every certificateImage is a string before sending
    const sanitizedCertificates = (formData.certificates || []).map(cert => ({
      ...cert,
      certificateImage:
        typeof cert.certificateImage === 'string'
          ? cert.certificateImage
          : '', // convert {} -> ''
    }))


    // Convert resume to base64 if it's a File
    let resumeData = ''
    if (formData.resume instanceof File) {
      resumeData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = error => reject(error)
        reader.readAsDataURL(formData.resume as Blob) // converts file to base64
      })
    } else if (typeof formData.resume === 'string') {
      resumeData = formData.resume
    }


  const result = await register({
    name: formData.name,
    email: formData.email,
    password: formData.password,
    role: formData.role,
    profile: {
      phone: formData.phone, // 👈 always included
      ...(formData.role === 'trainer' && {
        education: formData.education,
        teachingExperienceDetails: formData.experience,
        experience: experienceYears,
        certifications: sanitizedCertificates,
        dob: formData.dob,
        bio: formData.bio,
        resume: resumeData,
      }),
    },
  })


  // console.log('Submitting register data:', JSON.stringify({
  //   ...formData,
  //   certificates: sanitizedCertificates
  // }, null, 2))



    if (result?.success) {
    if (formData.role === 'student') {
      navigate('/student')
    } else if (formData.role === 'trainer') {
      setError(
      'Your registration has been received! An admin will review and verify your details before you can log in.'
    )
      setTimeout(() => navigate('/login'), 3000) // redirect them back to login instead of trainer dashboard
    }
  } else {
    setError(result?.error || 'Registration failed')
  }
    setLoading(false)
  }

  return (
    <div
      className="min-h-screen bg-pale flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 bg-[#2D274B]"
      // style={{
      //   background: `linear-gradient(180deg, #F5F3FF, #EAEFFE)`,
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
          className="absolute top-44 right-20 w-24 h-24 rounded-full"
          style={{
            background: '#9787F3',
            opacity: 0.06,
            animation: 'floaty 6s ease-in-out infinite',
            animationDelay: '1.8s',
          }}
        />
      </div>

      {/*Changing css for main card here  */}
      <div className="w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto relative z-10 p-4 sm:p-8">
        <div className="text-center mb-8">
          {/* change css for text */}
          <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-[#9787F3] mb-2 text-center">
            Join LearnILmWorld 🌎
          </h1>
          <p className="text-base font-bold sm:text-base md:text-lg text-[#9787F3]">
            Start your Learning Journey today
          </p>
        </div>

        <div className="glass-effect rounded-2xl p-8 shadow-2xl bg-white/80 backdrop-blur">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
              <div className="flex items-center gap-2">
                ⚠️ <span>{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-base font-bold  text-[#2D274B] mb-3">
                I want to join as :
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition bg-gray-100 ${
                    formData.role === 'student'
                      ? 'border-[#9787F3] bg-[rgba(151,135,243,0.06)]'
                      : 'border-gray-200 hover:border-[#9787F3]'
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={formData.role === 'student'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <BookOpen className="h-6 w-6 text-[#9787F3] mr-3" />
                  <div>
                    <div className="font-semibold text-[#2D274B]">Student</div>
                    <div className="text-sm font-bold text-[#4B437C]">Start your learning journey</div>
                  </div>
                </label>

                <label
                  className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition bg-gray-100 ${
                    formData.role === 'trainer'
                      ? 'border-[#9787F3] bg-[rgba(151,135,243,0.06)]'
                      : 'border-gray-200 hover: hover:border-[#9787F3]'
                  }`}
                >
                  {/* Trainer form */}
                  <input
                    type="radio"
                    name="role"
                    value="trainer"
                    checked={formData.role === 'trainer'}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <GraduationCap className="h-6 w-6 text-[#9787F3] mr-3" />
                  <div>
                    <div className="font-semibold text-[#2D274B]">Trainer</div>
                    <div className="text-sm font-bold text-[#4B437C]">Be a Teacher </div>
                  </div>
                </label>
              </div>
            </div>

            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-[#2D274B] mb-2"
              >
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] h-5 w-5" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[#2D274B] mb-2"
              >
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] h-5 w-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[#2D274B] mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] h-5 w-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] hover:text-[#4B437C]"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-[#2D274B] mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] h-5 w-5" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(s => !s)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#8C83C9] hover:text-[#4B437C]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Phone Number (shown for all users) */}
            <div>
              <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                Phone Number
              </label>
              <div className="w-full">
                <PhoneInput
                  country={'in'} // default country code
                  value={formData.phone}
                  onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                  inputStyle={{
                    width: '100%',
                    borderRadius: '0.75rem',
                    border: '2px solid #e5e7eb',
                    padding: '12px 14px 12px 52px',
                    fontSize: '16px',
                  }}
                  buttonStyle={{
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                  dropdownStyle={{ maxHeight: '200px' }}
                  enableSearch={true}
                />
              </div>
            </div>


            {formData.role === 'trainer' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Education
                  </label>
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleChange}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                    placeholder="Enter your education"
                  />
                </div>


                 {/* Phone Number */}
                {/* <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Phone Number
                  </label>
                  <div className="w-full">
                    <PhoneInput
                      country={'in'} // default country code
                      value={formData.phone}
                      onChange={(phone) => setFormData(prev => ({ ...prev, phone }))}
                      inputStyle={{
                        width: '100%',
                        borderRadius: '0.75rem',
                        border: '2px solid #e5e7eb',
                        padding: '12px 14px 12px 52px',
                        fontSize: '16px',
                      }}
                      buttonStyle={{
                        border: 'none',
                        backgroundColor: 'transparent',
                      }}
                      dropdownStyle={{ maxHeight: '200px' }}
                      enableSearch={true}
                    />
                    </div>
                </div> */}

                <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Teaching Experience
                  </label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                    placeholder="E.g., 5 years teaching English"
                  />
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    max={maxDOBString}
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  />
                </div>

                {/* Bio / Description */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Short Bio / Pitch
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe your teaching style, experience, or motivation..."
                    className="w-full pl-4 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  />
                </div>

                {/* Resume upload */}
                <div>
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Resume (PDF or link)
                  </label>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setFormData(prev => ({ ...prev, resume: file }));
                    }}
                    className="w-full pl-4 pr-4 py-2 border-2 border-gray-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  />
                  <p className="text-sm text-[#6B64A1] mt-1">Or paste a link instead:</p>
                  <input
                    type="text"
                    placeholder="https://example.com/myresume.pdf"
                    onChange={e => setFormData(prev => ({ ...prev, resume: e.target.value }))}
                    className="w-full pl-4 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9787F3] focus:border-[#9787F3] transition-all duration-300"
                  />
                </div>

                <div className="space-y-3 ">
                  <label className="block text-sm font-semibold text-[#2D274B] mb-2">
                    Certificates
                  </label>
                  {formData.certificates.map((cert, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-100 p-4 rounded-xl mb-6">
                      <input
                        type="text"
                        placeholder="Certificate Name"
                        value={cert.name}
                        onChange={e => handleCertificateChange(index, 'name', e.target.value)}
                        className="pl-2 py-2 border rounded-xl"
                      />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const dataUrl = reader.result as string;
                                const newCerts = [...formData.certificates];
                                newCerts[index].certificateImage = dataUrl; // store Base64 string
                                setFormData(prev => ({ ...prev, certificates: newCerts }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="pl-2 py-2 border rounded-xl"
                        />


                       <input
                        type="text"
                        placeholder="Issued By (Issuer Name)"
                        value={cert.issuer}
                        onChange={e => handleCertificateChange(index, 'issuer', e.target.value)}
                        className="pl-2 py-2 border rounded-xl"
                      />
                      <input
                        type="text"
                        placeholder="Certificate Link"
                        value={cert.certificateLink}
                        onChange={e => handleCertificateChange(index, 'certificateLink', e.target.value)}
                        className="pl-2 py-2 border rounded-xl"
                      />
                      <input
                        type="date"
                        value={cert.issuedDate}
                        onChange={e => handleCertificateChange(index, 'issuedDate', e.target.value)}
                        className="pl-2 py-2 border rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={() => removeCertificate(index)}
                          className="mt-2 px-3 py-1.5 text-sm font-semibold rounded-lg transition-all duration-200"
                          style={{
                            backgroundColor: 'rgba(255, 0, 0, 0.08)', // soft red tint background
                            color: '#E74C3C', // vibrant red text
                            }}
                            onMouseEnter={e => ((e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 0, 0, 0.15)')}
                            onMouseLeave={e => ((e.target as HTMLButtonElement).style.backgroundColor = 'rgba(255, 0, 0, 0.08)')}
                          >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addCertificate({ name: '',
                    issuer: '', certificateLink: '', issuedDate: '',certificateImage: '', })}
                    className="font-semibold mt-2"
                    style={{ color: '#9787F3' }}

                  >
                    + Add Certificate
                  </button>
                </div>
              </>
            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center text-base sm:text-lg py-3 rounded-xl font-semibold text-[#2D274B] hover:opacity-90 transition"
              style={{ backgroundColor: '#CBE56A' }}

            >
              {loading ? (
                <div className="loading-dots">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              ) : (
                <>
                  Create Account <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#4B437C] font-bold">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-bold hover:underline"
                style={{ color: '#9787F3' }}
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
