// server/models/Song.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  note: String,
  velocity: Number,
  timestamp: Number,
  duration: Number
});

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  notes: [noteSchema],
  duration: {
    type: Number,
    default: 0
  },
  bpm: {
    type: Number,
    default: 120
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  username: {
    type: String,
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [String],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp before saving
songSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Song', songSchema);