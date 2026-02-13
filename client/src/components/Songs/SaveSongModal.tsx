// client/src/components/Songs/SaveSongModal.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Globe, Lock } from 'lucide-react';
import { songsAPI } from '../../services/api';

interface SaveSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  recordedNotes: any[];
  onSaveSuccess: () => void;
}

export default function SaveSongModal({ 
  isOpen, 
  onClose, 
  recordedNotes,
  onSaveSuccess 
}: SaveSongModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateDuration = () => {
    if (recordedNotes.length === 0) return 0;
    const lastNote = recordedNotes[recordedNotes.length - 1];
    return lastNote.timestamp + lastNote.duration;
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const songData = {
        title,
        description,
        notes: recordedNotes,
        duration: calculateDuration(),
        bpm: 120,
        isPublic,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      await songsAPI.createSong(songData);
      onSaveSuccess();
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setIsPublic(false);
      setTags('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save song');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-gray-900 rounded-2xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <Save className="text-blue-400" size={24} />
              <h2 className="text-2xl font-bold text-white">Save Your Song</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Song Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Amazing Melody"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your creation..."
                rows={3}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">
                Tags (comma separated)
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="piano, melody, chill"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center gap-3">
                {isPublic ? (
                  <Globe className="text-green-400" size={20} />
                ) : (
                  <Lock className="text-gray-400" size={20} />
                )}
                <div>
                  <p className="font-medium text-white">
                    {isPublic ? 'Public' : 'Private'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {isPublic 
                      ? 'Everyone can see and play your song'
                      : 'Only you can see this song'
                    }
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isPublic ? 'bg-green-500' : 'bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isPublic ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="bg-gray-800/30 p-4 rounded-lg">
              <p className="text-gray-400 text-sm">
                <span className="font-medium text-white">{recordedNotes.length}</span> notes • 
                <span className="font-medium text-white ml-2">
                  {(calculateDuration() / 1000).toFixed(1)}s
                </span>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || !title.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Song
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}