// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const CURRENT_YEAR = new Date().getFullYear();

const LanguageSchema = new mongoose.Schema({
  language: { type: String, trim: true, required: true },
  proficiency: { type: String, enum: ['Native', 'Fluent'], default: 'Fluent' },
  teachingLevel: [{ type: String, trim: true }]
}, { _id: false });

const CertificationSchema = new mongoose.Schema({
  name: { type: String, trim: true, required: true },
  issuer: { type: String, trim: true, default: '' },
  year: {
    type: Number,
    validate: {
      validator: function (v) {
        if (v === undefined || v === null) return true;
        return Number.isInteger(v) && v >= 1950 && v <= CURRENT_YEAR;
      },
      message: props => `Certification year must be between 1950 and ${CURRENT_YEAR}`
    },
    default: null
  },
  // New fields for trainer verification
  certificateLink: { type: String, trim: true, default: '' },
  issuedDate: { type: Date, default: null },
  certificateImage: { type: String, trim: true, default: '' }
}, { _id: false });

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  startTime: { type: String, default: null },
  endTime: { type: String, default: null },
  available: { type: Boolean, default: false }
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
  password: { type: String, required: true, minlength: 8 },
  role: { type: String, enum: ['student', 'trainer', 'admin'], required: true },
  profile: {
    // basic
    bio: { type: String, trim: true, default: '' },

    dob: { type: Date, default: null },

    resume: { type: String, trim: true, default: '' }, // (can be a file URL or link)

    // primary image URL (single) - used for trainers & students
    imageUrl: { type: String, trim: true, default: '' },

    // already-existing avatar (kept for compatibility)
    avatar: { type: String, trim: true, default: '' },

    // student-specific fields (students + trainers can have these; optional)
    highestQualification: { type: String, trim: true, default: '' },
    collegeName: { type: String, trim: true, default: '' },

    // languages as array of strings for simple UI usage
    languages: [{ type: String, trim: true }],

    // richer trainer languages (optional)
    trainerLanguages: { type: [LanguageSchema], default: [] },

    experience: { type: Number, min: 0, default: 0 },
    hourlyRate: { type: Number, min: 0, default: 25 },

    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },

    // list of specializations
    specializations: { type: [String], default: [] },

    certifications: { type: [CertificationSchema], default: [] },
    availability: { type: [AvailabilitySchema], default: [] },

    demoVideo: { type: String, trim: true, default: '' },
    profileImages: { type: [String], default: [] },

    // Map of social links - can be updated by sending plain object from frontend
    socialMedia: { type: Map, of: String, default: {} },

    teachingStyle: { type: String, trim: true, default: 'Conversational' },
    studentAge: { type: [String], default: [] },

    isAvailable: { type: Boolean, default: true },
    totalBookings: { type: Number, default: 0 },
    averageRating: { type: Number, default: 5.0 },

    // trainer verification–related fields
    education: { type: String, trim: true, default: '' },
    teachingExperienceDetails: { type: String, trim: true, default: '' },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verificationNotes: { type: String, trim: true, default: '' },
    // for re register after 6 months
    rejectionDate: { type: Date, default: null },
  },
  isActive: { type: Boolean, default: true },
  //  isVerified: { type: Boolean, default: false }, // new field
  stats: {
    totalSessions: { type: Number, default: 0 },
    completedSessions: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    rating: { type: Number, default: 5.0 }
  }
}, { timestamps: true });

// Hash password before save (only when modified)
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Instance method for comparing password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Ensure full availability array (helper)
userSchema.methods.ensureFullAvailability = function () {
  const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const existing = (this.profile?.availability || []).reduce((acc, a) => { acc[a.day] = a; return acc; }, {});
  this.profile = this.profile || {};
  this.profile.availability = ALL_DAYS.map(d => {
    if (existing[d]) return existing[d];
    return { day: d, startTime: null, endTime: null, available: false };
  });
  return this;
};

export default mongoose.model('User', userSchema);
