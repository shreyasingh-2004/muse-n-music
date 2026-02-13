import { useState, useRef, useCallback, useEffect } from 'react';

export interface RecordedNote {
  id: string;
  note: string;
  frequency: number;
  velocity: number;
  startTime: number;
  endTime: number;
  duration: number;
  keyCode: string;
}

export const useRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordedNotes, setRecordedNotes] = useState<RecordedNote[]>([]);

  const recordingStartTimeRef = useRef<number>(0);
  const noteStartTimesRef = useRef<Map<string, { startTime: number; note: string; velocity: number }>>(new Map());
  const audioContextRef = useRef<AudioContext | null>(null);
  const playbackTimeoutsRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());

  // Initialize audio context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  // Note to frequency mapping
  const noteToFrequency = (note: string): number => {
    const frequencies: { [key: string]: number } = {
      'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13,
      'E4': 329.63, 'F4': 349.23, 'F#4': 369.99, 'G4': 392.00,
      'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
      'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25,
      'E5': 659.25, 'F5': 698.46, 'F#5': 739.99, 'G5': 783.99,
      'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
    };
    return frequencies[note] || 440;
  };

  // Get note from keyCode
  // const getNoteFromKeyCode = (keyCode: string): string | null => {
  //   const keyMap: { [key: string]: string } = {
  //     'KeyA': 'C4', 'KeyW': 'C#4', 'KeyS': 'D4', 'KeyE': 'D#4',
  //     'KeyD': 'E4', 'KeyF': 'F4', 'KeyT': 'F#4', 'KeyG': 'G4',
  //     'KeyY': 'G#4', 'KeyH': 'A4', 'KeyU': 'A#4', 'KeyJ': 'B4',
  //     'KeyK': 'C5'
  //   };
  //   return keyMap[keyCode] || null;
  // };

  // Start recording
  const startRecording = useCallback(() => {
    setRecordedNotes([]);
    noteStartTimesRef.current.clear();
    setIsRecording(true);
    recordingStartTimeRef.current = Date.now();
    console.log('🎙️ Recording started');
  }, []);

  // Stop recording
  const stopRecording = useCallback(() => {
    setIsRecording(false);

    // Handle any notes still being held
    noteStartTimesRef.current.forEach((value, keyCode) => {
      const endTime = Date.now() - recordingStartTimeRef.current;
      const duration = endTime - value.startTime;

      const recordedNote: RecordedNote = {
        id: `${keyCode}-${value.startTime}`,
        note: value.note,
        frequency: noteToFrequency(value.note),
        velocity: value.velocity,
        startTime: value.startTime,
        endTime: endTime,
        duration: Math.max(duration, 50),
        keyCode: keyCode
      };

      setRecordedNotes(prev => [...prev, recordedNote]);
    });

    noteStartTimesRef.current.clear();
    console.log(`💾 Recording stopped. Captured ${recordedNotes.length} notes`);
  }, [recordedNotes.length]);

  // Record note start
  const recordNoteStart = useCallback((note: string, keyCode: string, velocity = 0.8) => {
    if (!isRecording) return;

    const currentTime = Date.now() - recordingStartTimeRef.current;
    noteStartTimesRef.current.set(keyCode, {
      startTime: currentTime,
      note: note,
      velocity: velocity
    });

    console.log(`🎵 Note started: ${note} at ${currentTime}ms`);
  }, [isRecording]);

  // Record note end
  const recordNoteEnd = useCallback((keyCode: string) => {
    if (!isRecording) return;

    const noteData = noteStartTimesRef.current.get(keyCode);
    if (!noteData) return;

    const endTime = Date.now() - recordingStartTimeRef.current;
    const duration = endTime - noteData.startTime;

    const recordedNote: RecordedNote = {
      id: `${keyCode}-${noteData.startTime}`,
      note: noteData.note,
      frequency: noteToFrequency(noteData.note),
      velocity: noteData.velocity,
      startTime: noteData.startTime,
      endTime: endTime,
      duration: Math.max(duration, 50),
      keyCode: keyCode
    };

    setRecordedNotes(prev => [...prev, recordedNote]);
    noteStartTimesRef.current.delete(keyCode);

    console.log(`🎵 Note ended: ${noteData.note} duration: ${duration}ms`);
  }, [isRecording]);

  // Clear all timeouts
  const clearAllTimeouts = useCallback(() => {
    playbackTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    playbackTimeoutsRef.current.clear();
  }, []);

  // Play a single note using Web Audio API
  const playNoteAudio = useCallback((frequency: number, duration: number, velocity: number) => {
    if (!audioContextRef.current) return;

    const ctx = audioContextRef.current;
    const now = ctx.currentTime;

    // Main oscillator
    const osc1 = ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc1.frequency.value = frequency;

    // Harmonic oscillator
    const osc2 = ctx.createOscillator();
    osc2.type = 'triangle';
    osc2.frequency.value = frequency * 2;

    // Sub oscillator
    const osc3 = ctx.createOscillator();
    osc3.type = 'sine';
    osc3.frequency.value = frequency * 0.5;

    // Filter
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2000;
    filter.Q.value = 2;

    // Gain envelope
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(velocity * 0.25, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    // Connect
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    // Play
    osc1.start(now);
    osc2.start(now);
    osc3.start(now);

    osc1.stop(now + duration);
    osc2.stop(now + duration);
    osc3.stop(now + duration);
  }, []);

  // Play recording
  const playRecording = useCallback(() => {
    if (recordedNotes.length === 0 || isPlaying) return;

    clearAllTimeouts();

    if (audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }

    setIsPlaying(true);

    const sortedNotes = [...recordedNotes].sort((a, b) => a.startTime - b.startTime);
    const totalDuration = Math.max(...sortedNotes.map(n => n.startTime + n.duration));

    console.log(`▶️ Playback started: ${sortedNotes.length} notes`);

    // Schedule each note
    sortedNotes.forEach((note) => {
      // Schedule note start
      const startTimeout = setTimeout(() => {
        playNoteAudio(note.frequency, note.duration / 1000, note.velocity);

        // Dispatch event for visual feedback
        window.dispatchEvent(new CustomEvent('playbackNoteStart', {
          detail: { keyCode: note.keyCode, note: note.note }
        }));

        console.log(`▶️ Playing: ${note.note} at ${note.startTime}ms`);
      }, note.startTime);

      playbackTimeoutsRef.current.add(startTimeout);

      // Schedule note end for visual feedback
      const endTimeout = setTimeout(() => {
        window.dispatchEvent(new CustomEvent('playbackNoteEnd', {
          detail: { keyCode: note.keyCode }
        }));
      }, note.startTime + note.duration);

      playbackTimeoutsRef.current.add(endTimeout);
    });

    // Schedule playback end
    const stopTimeout = setTimeout(() => {
      setIsPlaying(false);
      console.log('⏹️ Playback finished');
    }, totalDuration + 100);

    playbackTimeoutsRef.current.add(stopTimeout);

  }, [recordedNotes, isPlaying, clearAllTimeouts, playNoteAudio]);

  // Stop playback
  const stopPlayback = useCallback(() => {
    clearAllTimeouts();
    setIsPlaying(false);
    console.log('⏹️ Playback stopped');

    // Dispatch end events for all active notes
    window.dispatchEvent(new CustomEvent('playbackEnded'));
  }, [clearAllTimeouts]);

  // Export as JSON
  const exportRecording = useCallback(() => {
    if (recordedNotes.length === 0) {
      alert('No notes to export!');
      return;
    }

    const totalDuration = Math.max(...recordedNotes.map(n => n.startTime + n.duration));

    const exportData = {
      version: '1.0.0',
      name: `Harmony Recording ${new Date().toLocaleString()}`,
      createdAt: new Date().toISOString(),
      bpm: 120,
      totalDuration,
      noteCount: recordedNotes.length,
      notes: recordedNotes.map(n => ({
        note: n.note,
        frequency: n.frequency,
        startTimeMs: n.startTime,
        durationMs: n.duration,
        velocity: n.velocity,
        keyCode: n.keyCode
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `harmony-recording-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log(`💾 Exported ${recordedNotes.length} notes`);
  }, [recordedNotes]);

  // Clear recording
  const clearRecording = useCallback(() => {
    setRecordedNotes([]);
    noteStartTimesRef.current.clear();
    clearAllTimeouts();
    setIsPlaying(false);
    console.log('🧹 Recording cleared');
  }, [clearAllTimeouts]);

  return {
    // State
    isRecording,
    isPlaying,
    recordedNotes,

    // Recording controls
    startRecording,
    stopRecording,
    recordNoteStart,
    recordNoteEnd,

    // Playback controls
    playRecording,
    stopPlayback,

    // Export controls
    exportRecording,
    clearRecording
  };
};