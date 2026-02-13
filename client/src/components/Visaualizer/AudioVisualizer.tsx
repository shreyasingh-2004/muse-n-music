// client/src/components/Visualizer/AudioVisualizer.tsx
import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isPlaying: boolean;
  currentNote?: string;
}

export default function AudioVisualizer({ isPlaying, currentNote }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  // Fixed: Use AudioNode type which is the base class for all audio nodes
  const sourceRef = useRef<AudioNode | null>(null);

  useEffect(() => {
    // Only setup if we have a canvas and we're playing
    if (!canvasRef.current || !isPlaying) return;

    const setupAudio = async () => {
      try {
        // Create audio context - SUSPENDED by default
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Resume audio context (requires user interaction)
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
        
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 256;

        // Use a constant source for visualization without actual sound
        const constantSource = audioContextRef.current.createConstantSource();
        constantSource.offset.value = 0.1;
        
        constantSource.connect(analyserRef.current);
        sourceRef.current = constantSource; // Fixed: Now works with AudioNode type
        constantSource.start();

      } catch (error) {
        console.error('Failed to setup audio context:', error);
      }
    };

    setupAudio();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (sourceRef.current) {
        try {
          // Check if it's an AudioScheduledSourceNode (has start/stop methods)
          if ('stop' in sourceRef.current) {
            (sourceRef.current as AudioScheduledSourceNode).stop();
          }
        } catch (error) {
          console.error('Error stopping audio source:', error);
        }
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isPlaying]);

  useEffect(() => {
    if (!analyserRef.current || !canvasRef.current || !isPlaying) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const waveArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!analyserRef.current || !ctx || !isPlaying) return;

      // Get frequency data
      analyserRef.current.getByteFrequencyData(dataArray);
      // Get waveform data
      analyserRef.current.getByteTimeDomainData(waveArray);

      // Clear canvas with fade effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw waveform
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#3b82f6';
      ctx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = waveArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      ctx.stroke();

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 1.5;
      let barX = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] / 2;

        // Create gradient
        const gradient = ctx.createLinearGradient(0, canvas.height - barHeight, 0, canvas.height);
        gradient.addColorStop(0, '#3b82f6');
        gradient.addColorStop(0.5, '#8b5cf6');
        gradient.addColorStop(1, '#ec4899');

        ctx.fillStyle = gradient;
        ctx.fillRect(barX, canvas.height - barHeight, barWidth, barHeight);

        barX += barWidth + 1;
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [isPlaying]);

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Audio Visualizer</h3>
        {currentNote && (
          <div className="px-3 py-1 bg-blue-600 rounded-full">
            <span className="text-white text-sm font-medium">{currentNote}</span>
          </div>
        )}
        {!isPlaying && (
          <div className="px-3 py-1 bg-gray-600 rounded-full">
            <span className="text-white text-sm font-medium">Paused</span>
          </div>
        )}
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={150}
        className="w-full h-32 rounded-lg bg-gray-900/30"
      />
      <div className="flex justify-center gap-6 mt-4">
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isPlaying ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`} />
          <p className="text-xs text-gray-400">Waveform</p>
        </div>
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isPlaying ? 'bg-purple-500 animate-pulse' : 'bg-gray-500'}`} />
          <p className="text-xs text-gray-400">Frequency</p>
        </div>
        <div className="text-center">
          <div className={`w-3 h-3 rounded-full mx-auto mb-1 ${isPlaying ? 'bg-pink-500 animate-pulse' : 'bg-gray-500'}`} />
          <p className="text-xs text-gray-400">Spectrum</p>
        </div>
      </div>
    </div>
  );
}