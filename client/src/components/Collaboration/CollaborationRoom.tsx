// client/src/components/Collaboration/CollaborationRoom.tsx
import { useState } from 'react';
// import { motion } from 'framer-motion';
import { Users, MessageSquare, Send, Mic, Headphones } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { useAuth } from '../../context/AuthContext';

interface CollaborationRoomProps {
  roomId: string;
  onLeave: () => void;
}

export default function CollaborationRoom({ roomId, onLeave }: CollaborationRoomProps) {
  const [message, setMessage] = useState('');
  const { user } = useAuth();
  const { 
    isConnected, 
    users, 
    messages, 
    sendMessage,
    playNote 
  } = useSocket(roomId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && user) {
      sendMessage(roomId, message, user.username);
      setMessage('');
    }
  };

  const playSampleNote = () => {
    playNote(roomId, 'C4', 'piano');
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 to-black z-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white">Collaboration Room</h2>
            <div className="flex items-center gap-3 mt-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <p className="text-gray-400">
                Room: <span className="font-mono text-blue-400">{roomId}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onLeave}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
          >
            Leave Room
          </button>
        </div>

        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Users */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-blue-400" size={24} />
              <h3 className="text-xl font-semibold text-white">Users Online</h3>
              <span className="px-2 py-1 bg-blue-500 text-white text-sm rounded">
                {users.length}
              </span>
            </div>
            <div className="space-y-3">
              {users.map((userId) => (
                <div
                  key={userId}
                  className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg"
                >
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">
                      {userId.slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-white font-medium">User {userId.slice(0, 8)}</p>
                    <p className="text-gray-400 text-sm">Playing...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Center: Chat */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <MessageSquare className="text-purple-400" size={24} />
                <h3 className="text-xl font-semibold text-white">Live Chat</h3>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`p-3 rounded-lg ${msg.type === 'system' ? 'bg-gray-800/30' : 'bg-gray-800/50'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {msg.type === 'user' && (
                        <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">
                            {msg.username?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className={`font-medium ${msg.type === 'system' ? 'text-gray-400' : 'text-white'}`}>
                        {msg.type === 'system' ? 'System' : msg.username}
                      </span>
                      <span className="text-gray-500 text-sm">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className={`${msg.type === 'system' ? 'text-gray-400' : 'text-gray-300'}`}>
                      {msg.message}
                    </p>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                >
                  <Send size={18} />
                  Send
                </button>
              </form>
            </div>

            {/* Quick Controls */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              <button
                onClick={playSampleNote}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                <Mic className="text-green-400" size={24} />
                <div className="text-left">
                  <p className="text-white font-medium">Play Note</p>
                  <p className="text-gray-400 text-sm">C4 to room</p>
                </div>
              </button>
              <button
                onClick={() => playNote(roomId, 'E4', 'piano')}
                className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl transition-colors flex items-center justify-center gap-3"
              >
                <Headphones className="text-blue-400" size={24} />
                <div className="text-left">
                  <p className="text-white font-medium">Play Chord</p>
                  <p className="text-gray-400 text-sm">E Major</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}