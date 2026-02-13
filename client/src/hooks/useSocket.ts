// client/src/hooks/useSocket.ts
import { useEffect, useRef, useState } from 'react';
import io, { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

interface Message {
  type: 'system' | 'user';
  userId?: string;
  username?: string;
  message: string;
  timestamp: number;
}

interface NotePlayedData {
  userId: string;
  note: string;
  instrument: string;
  timestamp: number;
}

interface UserJoinedData {
  userId: string;
  username: string;
  timestamp: number;
}

interface UserLeftData {
  userId: string;
  timestamp: number;
}

interface NewMessageData {
  userId: string;
  username: string;
  message: string;
  timestamp: number;
}

export const useSocket = (roomId?: string) => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<string[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [lastNote, setLastNote] = useState<NotePlayedData | null>(null);

  useEffect(() => {
    // Connect to Socket.io server
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to WebSocket server');
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from WebSocket server');
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setIsConnected(false);
    });

    // User joined event
    socketRef.current.on('user-joined', (data: UserJoinedData) => {
      setUsers(prev => [...prev, data.userId]);
      setMessages(prev => [...prev, {
        type: 'system',
        message: `👤 ${data.username || 'Anonymous'} joined the room`,
        timestamp: data.timestamp
      }]);
    });

    // User left event
    socketRef.current.on('user-left', (data: UserLeftData) => {
      setUsers(prev => prev.filter(id => id !== data.userId));
      setMessages(prev => [...prev, {
        type: 'system',
        message: `👋 User left: ${data.userId.slice(0, 8)}`,
        timestamp: data.timestamp
      }]);
    });

    // Note played event
    socketRef.current.on('note-played', (data: NotePlayedData) => {
      setLastNote(data);
      console.log('🎹 Note played by other:', data);
    });

    // New message event
    socketRef.current.on('new-message', (data: NewMessageData) => {
      setMessages(prev => [...prev, {
        type: 'user',
        userId: data.userId,
        username: data.username,
        message: data.message,
        timestamp: data.timestamp
      }]);
    });

    // Cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []); // Empty dependency array - run once

  // Auto-join room when roomId changes and socket is connected
  useEffect(() => {
    if (roomId && socketRef.current?.connected) {
      joinRoom(roomId, 'Anonymous'); // You might want to get username from props or context
    }

    // Cleanup when roomId changes or component unmounts
    return () => {
      if (roomId && socketRef.current?.connected) {
        leaveRoom(roomId);
        // Clear room-specific state
        setUsers([]);
        setMessages([]);
        setLastNote(null);
      }
    };
  }, [roomId]);

  const joinRoom = (roomId: string, username: string) => {
    if (socketRef.current) {
      socketRef.current.emit('join-room', { roomId, username });
    }
  };

  const playNote = (roomId: string, note: string, instrument: string = 'piano') => {
    if (socketRef.current) {
      socketRef.current.emit('play-note', { roomId, note, instrument });
    }
  };

  const sendMessage = (roomId: string, message: string, username: string) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { roomId, message, username });
    }
  };

  const leaveRoom = (roomId: string) => {
    if (socketRef.current) {
      socketRef.current.emit('leave-room', roomId);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  return {
    socket: socketRef.current,
    isConnected,
    users,
    messages,
    lastNote,
    joinRoom,
    playNote,
    sendMessage,
    leaveRoom,
    clearMessages
  };
};