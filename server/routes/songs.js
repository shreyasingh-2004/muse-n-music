// server/routes/songs.js - CORRECTED VERSION
const express = require('express');
const router = express.Router(); // FIXED: Use express.Router()
const auth = require('../middleware/auth');
const Song = require('../models/Song');
const User = require('../models/User');

// TEST ROUTE - No auth required
router.get('/test', (req, res) => {
  res.json({ message: 'Songs route is working!' });
});

// Create song - with auth
router.post('/', auth, async (req, res) => {
  try {
    const song = new Song({
      ...req.body,
      userId: req.userId,
      username: req.username
    });

    await song.save();
    res.status(201).json({ success: true, song });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get user's songs
router.get('/my-songs', auth, async (req, res) => {
  try {
    const songs = await Song.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ success: true, songs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get public songs
router.get('/public', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const songs = await Song.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Song.countDocuments({ isPublic: true });

    res.json({
      success: true,
      songs,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single song
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Increment play count
    song.plays += 1;
    await song.save();

    // Update user's total plays
    await User.findByIdAndUpdate(song.userId, {
      $inc: { totalPlays: 1 }
    });

    res.json({ success: true, song });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update song
router.put('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== 'userId') {
        song[key] = req.body[key];
      }
    });

    await song.save();
    res.json({ success: true, song });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete song
router.delete('/:id', auth, async (req, res) => {
  try {
    const song = await Song.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });

    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Decrement user's song count
    await User.findByIdAndUpdate(req.userId, {
      $inc: { totalSongs: -1 }
    });

    res.json({ success: true, message: 'Song deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Like a song
router.post('/:id/like', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    song.likes += 1;
    await song.save();

    res.json({ success: true, likes: song.likes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;