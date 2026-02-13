// client/src/pages/LibraryPage.tsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Music, Play, Heart, Eye, Clock, Search } from 'lucide-react';
import { songsAPI } from '../services/api';

interface Song {
  _id: string;
  title: string;
  description: string;
  username: string;
  duration: number;
  plays: number;
  likes: number;
  tags: string[];
  createdAt: string;
}

export default function LibraryPage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, my, public

  useEffect(() => {
    loadSongs();
  }, [filter]);

  const loadSongs = async () => {
    try {
      let response;
      if (filter === 'my') {
        response = await songsAPI.getMySongs();
      } else {
        response = await songsAPI.getPublicSongs();
      }
      setSongs(response.data.songs || []);
    } catch (error) {
      console.error('Failed to load songs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(search.toLowerCase()) ||
    song.description.toLowerCase().includes(search.toLowerCase()) ||
    song.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white">Song Library</h1>
              <p className="text-gray-400 mt-2">
                Browse and play your saved creations
              </p>
            </div>
            <Link
              to="/"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2"
            >
              <Music size={18} />
              Back to Piano
            </Link>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search songs, tags, or descriptions..."
                className="w-full pl-12 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                All Songs
              </button>
              <button
                onClick={() => setFilter('my')}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  filter === 'my'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                My Songs
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSongs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Music size={32} className="text-gray-600" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No songs found</h3>
            <p className="text-gray-400 mb-6">
              {search
                ? 'Try a different search term'
                : filter === 'my'
                ? 'You haven\'t created any songs yet'
                : 'No public songs available'}
            </p>
            {filter === 'my' && (
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
              >
                Create Your First Song
              </Link>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSongs.map((song) => (
              <div
                key={song._id}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-colors group"
              >
                {/* Song Header */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-1">
                        {song.title}
                      </h3>
                      <p className="text-gray-400 text-sm">
                        By {song.username}
                      </p>
                    </div>
                    <button className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
                      <Play size={18} className="text-green-400" />
                    </button>
                  </div>

                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {song.description || 'No description'}
                  </p>

                  {/* Tags */}
                  {song.tags && song.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {song.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-800 text-gray-300 text-xs rounded"
                        >
                          {tag}
                        </span>
                      ))}
                      {song.tags.length > 3 && (
                        <span className="px-2 py-1 bg-gray-800 text-gray-500 text-xs rounded">
                          +{song.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Eye size={14} />
                        <span>{song.plays}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Heart size={14} />
                        <span>{song.likes}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-400">
                        <Clock size={14} />
                        <span>{formatDuration(song.duration)}</span>
                      </div>
                    </div>
                    <span className="text-gray-500 text-xs">
                      {formatDate(song.createdAt)}
                    </span>
                  </div>
                </div>

                {/* Hover Actions */}
                <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-800 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                    Play
                  </button>
                  <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm font-medium rounded-lg transition-colors">
                    Edit
                  </button>
                  <button className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}