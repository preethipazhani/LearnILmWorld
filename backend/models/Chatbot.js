// Chatbot.js - Update the schema
import mongoose from 'mongoose';

const chatbotSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  },
  userType: {
    type: String,
    enum: ['student', 'trainer', 'admin', 'guest'],
    default: 'guest'
  },
  language: {
    type: String,
    enum: ['en', 'de', 'fr', 'ja', 'es', 'sa', 'hi'],
    default: 'en'
  },
  conversation: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true
    },
    message: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  userContext: {
    name: {
      type: String,
      default: null
    },
    phone: String,
    email: {
      type: String,
      default: null,
      validate: {
        validator: function(v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: props => `${props.value} is not a valid email address!`
      }
    },
    userRole: String,
    learningGoal: String,
    targetLanguage: String,
    infoRequestCount: {
      type: Number,
      default: 0
    },
    isInfoComplete: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Chatbot', chatbotSchema);