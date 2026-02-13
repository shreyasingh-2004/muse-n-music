// client/src/components/Piano/RealisticPiano.tsx
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {Volume2, Mic, Play, Download, Maximize2,  Moon, Sun, Info} from 'lucide-react';

// Professional piano key configuration
const WHITE_KEYS = [
    { note: 'C4', code: 'KeyA', label: 'A', keyLabel: 'A', width: '12.5%' },
    { note: 'D4', code: 'KeyS', label: 'S', keyLabel: 'S', width: '12.5%' },
    { note: 'E4', code: 'KeyD', label: 'D', keyLabel: 'D', width: '12.5%' },
    { note: 'F4', code: 'KeyF', label: 'F', keyLabel: 'F', width: '12.5%' },
    { note: 'G4', code: 'KeyG', label: 'G', keyLabel: 'G', width: '12.5%' },
    { note: 'A4', code: 'KeyH', label: 'H', keyLabel: 'H', width: '12.5%' },
    { note: 'B4', code: 'KeyJ', label: 'J', keyLabel: 'J', width: '12.5%' },
    { note: 'C5', code: 'KeyK', label: 'K', keyLabel: 'K', width: '12.5%' }
];

const BLACK_KEYS = [
    { note: 'C#4', code: 'KeyW', label: 'W', keyLabel: 'W', position: '9.375%', width: '6.25%' },
    { note: 'D#4', code: 'KeyE', label: 'E', keyLabel: 'E', position: '21.875%', width: '6.25%' },
    { note: 'F#4', code: 'KeyT', label: 'T', keyLabel: 'T', position: '46.875%', width: '6.25%' },
    { note: 'G#4', code: 'KeyY', label: 'Y', keyLabel: 'Y', position: '59.375%', width: '6.25%' },
    { note: 'A#4', code: 'KeyU', label: 'U', keyLabel: 'U', position: '71.875%', width: '6.25%' }
];

export default function PianoKeyboard() {
    const [activeKeys, setActiveKeys] = useState<Set<string>>(new Set());
    const [currentNote, setCurrentNote] = useState('');
    //   const [octave, setOctave] = useState(4);
    const [volume, setVolume] = useState(75);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedNotes, setRecordedNotes] = useState<any[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(true);
    const audioContextRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);

    // Initialize audio with realistic piano sound
    useEffect(() => {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        gainNodeRef.current = audioContextRef.current.createGain();
        gainNodeRef.current.connect(audioContextRef.current.destination);
        gainNodeRef.current.gain.value = volume / 100;

        return () => {
            audioContextRef.current?.close();
        };
    }, []);

    useEffect(() => {
        if (gainNodeRef.current) {
            gainNodeRef.current.gain.value = volume / 100;
        }
    }, [volume]);

    // Professional piano sound synthesis
    const playNote = (note: string, keyCode: string) => {
        if (!audioContextRef.current || !gainNodeRef.current) return;

        setActiveKeys(prev => new Set(prev).add(keyCode));
        setCurrentNote(note);

        const freq = noteToFrequency(note);
        const now = audioContextRef.current.currentTime;

        // Main oscillator - rich sawtooth for piano-like attack
        const osc1 = audioContextRef.current.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.value = freq;

        // Harmonic oscillator - adds richness
        const osc2 = audioContextRef.current.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = freq * 2;

        // Sub oscillator - adds depth
        const osc3 = audioContextRef.current.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = freq * 0.5;

        // Filter for realistic piano tone
        const filter = audioContextRef.current.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200;
        filter.Q.value = 2;

        // Volume envelope for natural decay
        const envelope = audioContextRef.current.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.25, now + 0.005);
        envelope.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        // Connect audio chain
        osc1.connect(filter);
        osc2.connect(filter);
        osc3.connect(filter);
        filter.connect(envelope);
        envelope.connect(gainNodeRef.current);

        // Start and stop
        osc1.start(now);
        osc2.start(now);
        osc3.start(now);

        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
        osc3.stop(now + 1.2);

        // Record if active
        if (isRecording) {
            setRecordedNotes(prev => [...prev, {
                note,
                timestamp: Date.now(),
                velocity: 0.8
            }]);
        }
    };

    const stopNote = (keyCode: string) => {
        setActiveKeys(prev => {
            const newSet = new Set(prev);
            newSet.delete(keyCode);
            return newSet;
        });
    };

    const noteToFrequency = (note: string): number => {
        const frequencies: { [key: string]: number } = {
            'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
            'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
            'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
            'C5': 523.25
        };
        return frequencies[note] || 440;
    };

    // Keyboard event listeners
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.repeat) return;
            const key = [...WHITE_KEYS, ...BLACK_KEYS].find(k => k.code === e.code);
            if (key) {
                e.preventDefault();
                playNote(key.note, key.code);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = [...WHITE_KEYS, ...BLACK_KEYS].find(k => k.code === e.code);
            if (key) {
                e.preventDefault();
                stopNote(key.code);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [isRecording]);

    // Toggle fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDarkMode
                ? 'bg-gradient-to-br from-slate-950 via-purple-950/90 to-slate-950'
                : 'bg-gradient-to-br from-slate-100 via-white to-slate-200'
            }`}>

            {/* Main Container */}
            <div className="relative max-w-7xl mx-auto px-4 py-8">

                {/* Premium Header */}
                <div className="flex justify-between items-center mb-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4"
                    >
                        {/* <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-yellow-600 rounded-2xl blur-2xl opacity-50" />
              <div className="relative bg-gradient-to-r from-amber-500 to-yellow-600 p-4 rounded-2xl shadow-2xl">
                <Music size={32} className="text-white" />
              </div>
            </div> */}
                        <div>
                            <h1 className={`text-4xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                Acoustic<span className="bg-gradient-to-r from-amber-500 to-yellow-600 bg-clip-text text-transparent"> Aura</span>
                            </h1>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Where creativity finds its rhythm
                            </p>
                        </div>
                    </motion.div>

                    {/* Theme Toggle */}
                    <motion.button
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`p-3 rounded-xl transition-all ${isDarkMode
                                ? 'bg-white/10 text-yellow-400 hover:bg-white/20'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                    </motion.button>
                </div>

                {/* Control Panel */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mb-8 p-6 rounded-2xl ${isDarkMode
                            ? 'bg-black/25 backdrop-blur-xl border border-white/10 shadow-xl'
                            : 'bg-white/80 backdrop-blur-xl border border-gray-300 shadow-xl'
                        }`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        {/* Recording Controls */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setIsRecording(!isRecording)}
                                className={`px-6 py-3 rounded-xl font-semibold flex items-center gap-3 transition-all ${isRecording
                                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30'
                                        : isDarkMode
                                            ? 'bg-white/10 text-white hover:bg-white/20'
                                            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                            >
                                <Mic size={20} />
                                <span className="hidden sm:inline">{isRecording ? 'Recording...' : 'Record'}</span>
                                {isRecording && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="w-2 h-2 bg-red-500 rounded-full"
                                    />
                                )}
                            </motion.button>

                            {recordedNotes.length > 0 && (
                                <>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setIsPlaying(!isPlaying)}
                                        className={`p-3 rounded-xl ${isDarkMode
                                                ? 'bg-green-600/90 text-white hover:bg-green-700'
                                                : 'bg-green-600 text-white hover:bg-green-700'
                                            }`}
                                    >
                                        <Play size={20} />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className={`p-3 rounded-xl ${isDarkMode
                                                ? 'bg-white/10 text-white hover:bg-white/20'
                                                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                            }`}
                                    >
                                        <Download size={20} />
                                    </motion.button>
                                </>
                            )}
                        </div>

                        {/* Octave Control
            <div className={`flex items-center rounded-xl p-1 ${
              isDarkMode ? 'bg-white/10' : 'bg-gray-200'
            }`}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOctave(Math.max(1, octave - 1))}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-300 text-gray-800'
                }`}
              >
                <SkipBack size={18} />
              </motion.button>
              <div className={`px-4 py-2 mx-1 rounded-lg font-semibold ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-white' 
                  : 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white'
              }`}>
                Octave {octave}
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setOctave(Math.min(7, octave + 1))}
                className={`p-2 rounded-lg transition-all ${
                  isDarkMode 
                    ? 'hover:bg-white/20 text-white' 
                    : 'hover:bg-gray-300 text-gray-800'
                }`}
              >
                <SkipForward size={18} />
              </motion.button>
            </div> */}

                        {/* Volume Control */}
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-xl ${isDarkMode ? 'bg-white/10' : 'bg-gray-200'
                            }`}>
                            <Volume2 size={20} className={isDarkMode ? 'text-white/70' : 'text-gray-700'} />
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={volume}
                                onChange={(e) => setVolume(parseInt(e.target.value))}
                                className="w-24 h-2 bg-white/30 rounded-lg appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-4 
                  [&::-webkit-slider-thumb]:h-4 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-gradient-to-r 
                  [&::-webkit-slider-thumb]:from-amber-500 
                  [&::-webkit-slider-thumb]:to-yellow-500 
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-amber-500/30
                  [&::-webkit-slider-thumb]:cursor-pointer
                  hover:[&::-webkit-slider-thumb]:scale-110
                  transition-all"
                            />
                            <span className={`font-medium w-8 ${isDarkMode ? 'text-white' : 'text-gray-800'
                                }`}>{volume}%</span>
                        </div>

                        {/* Utility Buttons */}
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={toggleFullscreen}
                                className={`p-3 rounded-xl ${isDarkMode
                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                            >
                                <Maximize2 size={18} />
                            </motion.button>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setShowShortcuts(!showShortcuts)}
                                className={`p-3 rounded-xl ${isDarkMode
                                        ? 'bg-white/10 text-white hover:bg-white/20'
                                        : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                                    }`}
                            >
                                <Info size={18} />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>

                {/* Current Note Display */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex justify-center mb-8"
                >
                    <div className={`px-8 py-4 rounded-2xl ${isDarkMode
                            ? 'bg-gradient-to-r from-amber-500/10 to-yellow-600/10 backdrop-blur-xl border border-amber-500/30'
                            : 'bg-gradient-to-r from-amber-500 to-yellow-600 shadow-xl'
                        }`}>
                        <p className={`text-sm ${isDarkMode ? 'text-amber-300' : 'text-white/90'}`}>Currently Playing</p>
                        <div className="flex items-center gap-4">
                            <span className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-white'}`}>
                                {currentNote || '—'}
                            </span>
                            {currentNote && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1 }}
                                    className="w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
                                />
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* REALISTIC PIANO KEYBOARD */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative mb-12"
                >
                    {/* Piano Body */}
                    <div className="relative">
                        {/* Piano Lid Shadow */}
                        <div className="absolute -top-4 left-0 right-0 h-8 bg-gradient-to-b from-black/30 to-transparent rounded-t-3xl" />

                        {/* Main Piano Body */}
                        <div className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8 rounded-3xl shadow-2xl border-t-4 border-gray-700">

                            {/* Piano Brand Plate */}
                            <div className="absolute top-4 left-8 flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                <span className="text-white/60 text-xs uppercase tracking-[0.3em] font-light">
                                    CONCERT PIANO
                                </span>
                            </div>

                            {/* Music Rack */}
                            <div className="absolute -top-12 right-12 w-48 h-8 bg-gradient-to-b from-gray-1000 to-gray-800 rounded-t-lg transform -skew-x-12 border-t border-gray-600 shadow-xl" />

                            {/* KEYBOARD SECTION - CRYSTAL CLEAR */}
                            <div className="relative h-80 mt-4">
                                {/* White Keys Background */}
                                <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-b from-gray-600 to-white rounded-b-2xl shadow-2xl" />

                                {/* White Keys */}
                                <div className="absolute inset-x-0 bottom-0 h-72 flex">
                                    {WHITE_KEYS.map((key, index) => (
                                        <div
                                            key={key.note}
                                            className="relative flex-1 h-full"
                                        >
                                            <motion.button
                                                whileTap={{ scale: 0.98 }}
                                                onMouseDown={() => playNote(key.note, key.code)}
                                                onMouseUp={() => stopNote(key.code)}
                                                onMouseLeave={() => stopNote(key.code)}
                                                className={`
                          absolute inset-0 w-full h-full
                          bg-gradient-to-b from-white to-gray-50
                          ${index < WHITE_KEYS.length - 1 ? 'border-r border-gray-300' : ''}
                          rounded-b-lg
                          transition-all duration-75
                          shadow-[0_8px_0_rgba(0,0,0,0.1),0_12px_20px_rgba(0,0,0,0.2)]
                          active:shadow-[0_4px_0_rgba(0,0,0,0.1),0_8px_15px_rgba(0,0,0,0.2)]
                          active:translate-y-1
                          ${activeKeys.has(key.code)
                                                        ? 'bg-gradient-to-b from-amber-50 to-amber-100 shadow-amber-500/30 border-amber-300'
                                                        : 'hover:bg-gradient-to-b hover:from-gray-50 hover:to-gray-100'
                                                    }
                        `}
                                            >
                                                {/* Key Label - ALWAYS VISIBLE */}
                                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center z-20">
                                                    <span className={`
                            block text-2xl font-bold
                            ${activeKeys.has(key.code)
                                                            ? 'text-amber-600 drop-shadow-lg'
                                                            : 'text-gray-700 drop-shadow-md'
                                                        }
                          `}>
                                                        {key.keyLabel}
                                                    </span>
                                                    <span className={`
                            text-xs font-medium
                            ${activeKeys.has(key.code)
                                                            ? 'text-amber-500'
                                                            : 'text-gray-500'
                                                        }
                          `}>
                                                        {key.note}
                                                    </span>
                                                </div>

                                                {/* Key Glow Effect */}
                                                {activeKeys.has(key.code) && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute inset-0 bg-gradient-to-t from-amber-500/20 to-transparent rounded-b-lg"
                                                    />
                                                )}
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>

                                {/* Black Keys - HIGHLY VISIBLE */}
                                <div className="absolute inset-x-0 top-0 h-48 flex justify-center">
                                    {BLACK_KEYS.map((key) => (
                                        <div
                                            key={key.note}
                                            className="absolute h-full"
                                            style={{
                                                left: key.position,
                                                width: key.width,
                                                zIndex: 30
                                            }}
                                        >
                                            <motion.button
                                                whileTap={{ scale: 0.95 }}
                                                onMouseDown={() => playNote(key.note, key.code)}
                                                onMouseUp={() => stopNote(key.code)}
                                                onMouseLeave={() => stopNote(key.code)}
                                                className={`
                          w-full h-full
                          bg-gradient-to-b from-gray-1100 via-gray-900 to-black

                          rounded-b-lg
                          transition-all duration-75
                          shadow-[0_8px_0_rgba(0,0,0,0.4),0_12px_20px_rgba(0,0,0,0.3)]
                          active:shadow-[0_4px_0_rgba(0,0,0,0.4),0_8px_15px_rgba(0,0,0,0.3)]
                          active:translate-y-1
                          ${activeKeys.has(key.code)
                                                        ? 'bg-gradient-to-b from-amber-700 via-amber-800 to-amber-900 shadow-amber-900/50'
                                                        : 'hover:bg-gradient-to-b hover:from-gray-700 hover:via-gray-800 hover:to-gray-900'
                                                    }
                        `}
                                            >
                                                {/* Black Key Label - CRYSTAL CLEAR */}
                                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center">
                                                    <span className={`
                            block text-xl font-bold
                            ${activeKeys.has(key.code)
                                                            ? 'text-amber-300 drop-shadow-lg'
                                                            : 'text-gray-300 drop-shadow-md'
                                                        }
                          `}>
                                                        {key.keyLabel}
                                                    </span>
                                                    <span className={`
                            text-xs font-medium
                            ${activeKeys.has(key.code)
                                                            ? 'text-amber-400'
                                                            : 'text-gray-500'
                                                        }
                          `}>
                                                        {key.note}
                                                    </span>
                                                </div>

                                                {/* Key Press Effect */}
                                                {activeKeys.has(key.code) && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        className="absolute inset-0 bg-gradient-to-t from-amber-500/30 to-transparent rounded-b-lg"
                                                    />
                                                )}
                                            </motion.button>
                                        </div>
                                    ))}
                                </div>

                                {/* Key Spacer Line */}
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-400 to-transparent" />
                            </div>

                            {/* Piano Pedals Section */}
                            <div className="flex justify-center gap-8 mt-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-lg" />
                                    <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Soft</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-lg" />
                                    <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Sostenuto</span>
                                </div>
                                <div className="flex flex-col items-center">
                                    <div className="w-8 h-8 bg-gradient-to-b from-amber-600 to-amber-800 rounded-full shadow-lg" />
                                    <span className={`text-xs mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>Damper</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Keyboard Shortcuts Panel - CLEAR AND VISIBLE */}
                <AnimatePresence>
                    {showShortcuts && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className={`fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 ${isDarkMode
                                    ? 'bg-gray-900/95 backdrop-blur-xl border border-white/20'
                                    : 'bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl'
                                } rounded-2xl p-6 shadow-2xl`}
                            style={{ width: '600px', maxWidth: '90vw' }}
                        >
                            <div className="flex justify-between items-center mb-4">
                                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                    🎹 Keyboard Shortcuts
                                </h3>
                                <button
                                    onClick={() => setShowShortcuts(false)}
                                    className={`p-1 rounded-lg ${isDarkMode ? 'hover:bg-white/10' : 'hover:bg-gray-200'
                                        }`}
                                >
                                    <span className={isDarkMode ? 'text-white/70' : 'text-gray-600'}>✕</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                {/* White Keys */}
                                <div>
                                    <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        White Keys
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {WHITE_KEYS.map(key => (
                                            <div
                                                key={key.code}
                                                className={`flex flex-col items-center p-2 rounded-lg ${isDarkMode ? 'bg-white/10' : 'bg-gray-100'
                                                    }`}
                                            >
                                                <span className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                                    {key.keyLabel}
                                                </span>
                                                <span className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {key.note}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Black Keys */}
                                <div>
                                    <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Black Keys
                                    </p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {BLACK_KEYS.map(key => (
                                            <div
                                                key={key.code}
                                                className={`flex flex-col items-center p-2 rounded-lg ${isDarkMode
                                                        ? 'bg-gradient-to-b from-gray-800 to-gray-900'
                                                        : 'bg-gradient-to-b from-gray-700 to-gray-800'
                                                    }`}
                                            >
                                                <span className="text-lg font-bold text-white">
                                                    {key.keyLabel}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {key.note}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-white/10' : 'border-gray-200'}`}>
                                <div className="flex justify-between text-sm">
                                    <div className="flex items-center gap-4">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Octave Up:</span>
                                        <span className={`px-2 py-1 font-mono rounded ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'
                                            }`}>→</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Octave Down:</span>
                                        <span className={`px-2 py-1 font-mono rounded ${isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200 text-gray-800'
                                            }`}>←</span>
                                    </div>
                                </div>
                            </div> */}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Recording Status Bar */}
                <AnimatePresence>
                    {isRecording && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="fixed bottom-8 right-8 z-40"
                        >
                            <div className="bg-gradient-to-r from-red-600 to-red-700 px-6 py-4 rounded-2xl shadow-2xl shadow-red-600/30 border border-red-400">
                                <div className="flex items-center gap-4">
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 1 }}
                                        className="w-3 h-3 bg-white rounded-full"
                                    />
                                    <span className="text-white font-medium">
                                        Recording • {recordedNotes.length} notes
                                    </span>
                                    <button
                                        onClick={() => setIsRecording(false)}
                                        className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-lg text-white text-sm transition-colors"
                                    >
                                        Stop
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
